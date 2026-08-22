import type {
  BehaviorObservation,
  DogProfile,
  DogStats,
  FosterParent,
  HealthAlert,
  OpsException,
  ScheduledTask,
  TraitDecision,
  TraitKind,
  TraitProposal,
} from "@/types";

// How the dog profile writes itself.
//
// Fosters and volunteers log observations. These rules read those observations
// and *propose* profile traits, always with the entry ids that triggered them.
// Nothing here mutates a profile: an admin confirms or dismisses each proposal
// (D10 — "AI drafts, humans decide"). Matching is deterministic keyword logic,
// not a model, so a proposal can always be explained by pointing at its rule.

export const OVERDUE_CHECKIN_DAYS = 3;
export const LONG_STAY_DAYS = 60;
const MAX_EVIDENCE = 4;

const normalize = (value: string) => value.trim().toLowerCase();

function observationText(observation: BehaviorObservation) {
  return `${observation.behavior} ${observation.context}`.toLowerCase();
}

interface TraitRule {
  id: string;
  kind: TraitKind;
  trait: string;
  rationale: string;
  pattern: RegExp;
  /** Must also be present — keeps "met a cat" from becoming "good with cats". */
  alsoPattern?: RegExp;
  threshold: number;
}

const POSITIVE = /good|great|gentle|calm|fine|friendly|played|happy|relaxed|curious|sniff/;

const TRAIT_RULES: TraitRule[] = [
  {
    id: "skateboards",
    kind: "quirk",
    trait: "Afraid of skateboards",
    rationale: "Repeatedly reacted to skateboards on walks",
    pattern: /skateboard/,
    threshold: 2,
  },
  {
    id: "storms",
    kind: "quirk",
    trait: "Hides during storms and fireworks",
    rationale: "Sought cover during loud weather or fireworks more than once",
    pattern: /thunder|storm|firework/,
    threshold: 2,
  },
  {
    id: "visitors",
    kind: "quirk",
    trait: "Alerts at visitors and deliveries",
    rationale: "Reacted to people arriving at the door on multiple days",
    pattern: /visitor|delivery|doorbell|mail carrier|package/,
    threshold: 2,
  },
  {
    id: "house-training",
    kind: "quirk",
    trait: "Still house-training",
    rationale: "Indoor accidents recorded on more than one occasion",
    pattern: /accident|soiled|potty|peed indoors|house-?training/,
    threshold: 2,
  },
  {
    id: "crate",
    kind: "quirk",
    trait: "Settles well in a crate",
    rationale: "Rested calmly in a crate across several entries",
    pattern: /crate|kennel at home/,
    alsoPattern: POSITIVE,
    threshold: 2,
  },
  {
    id: "leash-reactive",
    kind: "temperament",
    trait: "leash-reactive",
    rationale: "Pulling or reacting while on leash was noted repeatedly",
    pattern: /leash|pulls?\b|lunged|reactive/,
    threshold: 2,
  },
  {
    id: "settles",
    kind: "temperament",
    trait: "settles easily",
    rationale: "Repeatedly described as calm, settled, or relaxed",
    pattern: /calm|settled|relax|rested|quiet/,
    threshold: 2,
  },
  {
    id: "playful",
    kind: "temperament",
    trait: "playful",
    rationale: "Play, toys, or fetch mentioned across several entries",
    pattern: /play|toy|fetch|tug|zoomies/,
    threshold: 2,
  },
  {
    id: "vocal",
    kind: "temperament",
    trait: "vocal",
    rationale: "Barking or whining reported on multiple days",
    pattern: /bark|whin|howl/,
    threshold: 2,
  },
  {
    id: "good-with-dogs",
    kind: "temperament",
    trait: "good with dogs",
    rationale: "Positive encounters with other dogs recorded more than once",
    pattern: /other dogs?|another dog|puppy|dog park/,
    alsoPattern: POSITIVE,
    threshold: 2,
  },
  {
    id: "good-with-cats",
    kind: "temperament",
    trait: "good with cats",
    rationale: "Positive encounters with cats recorded more than once",
    pattern: /\bcats?\b|kitten/,
    alsoPattern: POSITIVE,
    threshold: 2,
  },
  {
    id: "good-with-kids",
    kind: "temperament",
    trait: "good with kids",
    rationale: "Positive encounters with children recorded more than once",
    pattern: /\bkids?\b|child|toddler/,
    alsoPattern: POSITIVE,
    threshold: 2,
  },
];

/** Traits an admin has confirmed, layered on top of the seed profile. */
export function effectiveProfile(dog: DogProfile, decisions: TraitDecision[]) {
  const confirmed = decisions.filter((decision) => decision.status === "confirmed");
  const add = (base: string[], kind: TraitKind) => {
    const existing = new Set(base.map(normalize));
    const extra = confirmed
      .filter((decision) => decision.kind === kind && !existing.has(normalize(decision.trait)))
      .map((decision) => decision.trait);
    return [...base, ...extra];
  };
  return {
    temperament: add(dog.temperament, "temperament"),
    quirks: add(dog.quirks, "quirk"),
  };
}

export function deriveTraitProposals(
  dog: DogProfile,
  observations: BehaviorObservation[],
  decisions: TraitDecision[],
): TraitProposal[] {
  const decided = new Set(decisions.map((decision) => normalize(decision.trait)));
  const alreadyOnProfile = new Set(
    [...dog.temperament, ...dog.quirks].map(normalize),
  );

  const proposals: TraitProposal[] = [];

  for (const rule of TRAIT_RULES) {
    const key = normalize(rule.trait);
    // Skip anything the profile already claims or an admin has already ruled on.
    if (alreadyOnProfile.has(key) || decided.has(key)) continue;

    const matches = observations.filter((observation) => {
      const text = observationText(observation);
      if (!rule.pattern.test(text)) return false;
      return rule.alsoPattern ? rule.alsoPattern.test(text) : true;
    });

    if (matches.length < rule.threshold) continue;

    proposals.push({
      id: `${dog.id}:${rule.id}`,
      dogId: dog.id,
      kind: rule.kind,
      trait: rule.trait,
      rationale: rule.rationale,
      evidenceIds: matches.slice(0, MAX_EVIDENCE).map((observation) => observation.id),
      supportingCount: matches.length,
    });
  }

  return proposals.sort((a, b) => b.supportingCount - a.supportingCount);
}

interface AlertRule {
  id: string;
  label: string;
  detail: string;
  pattern: RegExp;
  threshold: number;
  severity: "watch" | "urgent";
}

const ALERT_RULES: AlertRule[] = [
  {
    id: "appetite",
    label: "Appetite decline",
    detail: "Refused or skipped meals in recent entries — worth a check before it becomes a crisis.",
    pattern: /refus\w* (?:to eat|food|breakfast|dinner)|didn['’]?t eat|not eating|skipped (?:a )?meal|no appetite|off (?:his|her|their) food/,
    threshold: 2,
    severity: "watch",
  },
  {
    id: "energy",
    label: "Energy decline",
    detail: "Repeatedly described as lethargic or unusually tired.",
    pattern: /lethargic|sluggish|low energy|unusually tired|slept all day|no interest/,
    threshold: 2,
    severity: "watch",
  },
  {
    id: "symptom",
    label: "Symptom reported",
    detail: "A physical symptom was logged from the foster home and needs triage.",
    pattern: /limp|vomit|blood|seizure|diarrh|collapse|swollen|bleeding/,
    threshold: 1,
    severity: "urgent",
  },
];

/** Recent-window health signals. Advisory only — never changes the record. */
export function deriveHealthAlerts(
  dog: DogProfile,
  observations: BehaviorObservation[],
): HealthAlert[] {
  const recent = [...observations]
    .sort((a, b) => b.observedAt.localeCompare(a.observedAt))
    .slice(0, 5);

  const alerts: HealthAlert[] = [];

  for (const rule of ALERT_RULES) {
    const matches = recent.filter((observation) => rule.pattern.test(observationText(observation)));
    if (matches.length < rule.threshold) continue;
    alerts.push({
      id: `${dog.id}:${rule.id}`,
      dogId: dog.id,
      label: rule.label,
      detail: rule.detail,
      severity: rule.severity,
      evidenceIds: matches.slice(0, MAX_EVIDENCE).map((observation) => observation.id),
    });
  }

  // A foster explicitly flagging an entry outranks any keyword rule.
  const flagged = recent.filter((observation) => observation.concernLevel === "urgent");
  if (flagged.length > 0 && !alerts.some((alert) => alert.severity === "urgent")) {
    alerts.push({
      id: `${dog.id}:flagged`,
      dogId: dog.id,
      label: "Flagged by the foster home",
      detail: "An entry was marked urgent by the person logging it.",
      severity: "urgent",
      evidenceIds: flagged.slice(0, MAX_EVIDENCE).map((observation) => observation.id),
    });
  }

  return alerts;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function wholeDaysBetween(from: Date, to: Date) {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(0, Math.round((b - a) / DAY_MS));
}

/**
 * Objective statistics. These update live with no approval step — they are
 * counts and clocks, not inferences.
 *
 * `now` is injected rather than read here so server and client renders agree.
 */
export function deriveDogStats(
  dog: DogProfile,
  observations: BehaviorObservation[],
  now: Date,
): DogStats {
  const sorted = [...observations].sort((a, b) => b.observedAt.localeCompare(a.observedAt));
  const lastObservedAt = sorted[0]?.observedAt ?? null;

  return {
    daysInCare: wholeDaysBetween(new Date(dog.intakeDate), now),
    observationCount: observations.length,
    sharedCount: observations.filter((observation) => observation.sharedWithShelter).length,
    lastObservedAt,
    daysSinceLastObservation: lastObservedAt
      ? wholeDaysBetween(new Date(lastObservedAt), now)
      : null,
  };
}

/**
 * The exception-first operations home (F10.1): surface what needs a human,
 * rather than a firehose of everything that is fine.
 */
export function deriveExceptions(
  dogs: DogProfile[],
  observationsByDog: Record<string, BehaviorObservation[]>,
  fosters: FosterParent[],
  tasks: ScheduledTask[],
  now: Date,
): OpsException[] {
  const exceptions: OpsException[] = [];
  const fosterIds = new Set(fosters.map((foster) => foster.id));

  for (const dog of dogs) {
    const observations = observationsByDog[dog.id] ?? dog.behaviorObservations;
    const stats = deriveDogStats(dog, observations, now);

    if (!dog.fosterParentId || !fosterIds.has(dog.fosterParentId)) {
      exceptions.push({
        id: `${dog.id}:no-foster`,
        dogId: dog.id,
        dogName: dog.name,
        kind: "no-foster",
        label: "No foster assigned",
        detail: "This dog has no active foster home.",
        severity: "urgent",
      });
    }

    if (stats.daysSinceLastObservation === null) {
      exceptions.push({
        id: `${dog.id}:overdue-checkin`,
        dogId: dog.id,
        dogName: dog.name,
        kind: "overdue-checkin",
        label: "No check-ins yet",
        detail: "Nobody has logged an observation for this dog.",
        severity: "watch",
      });
    } else if (stats.daysSinceLastObservation > OVERDUE_CHECKIN_DAYS) {
      exceptions.push({
        id: `${dog.id}:overdue-checkin`,
        dogId: dog.id,
        dogName: dog.name,
        kind: "overdue-checkin",
        label: "Overdue check-in",
        detail: `${stats.daysSinceLastObservation} days since the last observation.`,
        severity: "watch",
      });
    }

    for (const alert of deriveHealthAlerts(dog, observations)) {
      exceptions.push({
        id: alert.id,
        dogId: dog.id,
        dogName: dog.name,
        kind: "health-alert",
        label: alert.label,
        detail: alert.detail,
        severity: alert.severity,
      });
    }

    if (stats.daysInCare > LONG_STAY_DAYS) {
      exceptions.push({
        id: `${dog.id}:long-stay`,
        dogId: dog.id,
        dogName: dog.name,
        kind: "long-stay",
        label: "Long length of stay",
        detail: `${stats.daysInCare} days in care, over the ${LONG_STAY_DAYS}-day threshold.`,
        severity: "watch",
      });
    }
  }

  for (const task of tasks) {
    if (task.status !== "open") continue;
    if (new Date(task.scheduledFor).getTime() >= now.getTime()) continue;
    const dog = dogs.find((candidate) => candidate.id === task.dogId);
    if (!dog) continue;
    exceptions.push({
      id: `${task.id}:overdue-task`,
      dogId: dog.id,
      dogName: dog.name,
      kind: "overdue-task",
      label: "Unclaimed task past due",
      detail: task.notes,
      severity: "watch",
    });
  }

  const rank = { urgent: 0, watch: 1 };
  return exceptions.sort((a, b) => rank[a.severity] - rank[b.severity]);
}
