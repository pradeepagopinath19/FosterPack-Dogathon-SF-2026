export type UserRole = "volunteer" | "foster";

export interface Location {
  neighborhood: string;
  city: string;
  state: string;
}

export interface BaseProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  location: Location;
  phone: string;
  email: string;
  bio: string;
}

export interface Volunteer extends BaseProfile {
  role: "volunteer";
  skills: VolunteerSkill[];
  availability: string[];
  availabilityExceptions: AvailabilityException[];
  maxTravelMiles: number;
  hasVehicle: boolean;
  reliability: ReliabilityStats;
}

// Recurring weekly availability + one-off exceptions (F5.1).
export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
export type TimeBlock = "Morning" | "Afternoon" | "Evening";

export interface AvailabilityException {
  id: string;
  date: string;
  note: string;
}

// Claim/completion/late-release history, framed as encouragement — never a
// punitive score.
export interface ReliabilityStats {
  tasksClaimed: number;
  tasksCompleted: number;
  lateReleases: number;
  memberSince: string;
}

export type VolunteerSkill =
  | "dog-walking"
  | "vet-transport"
  | "overnight-sitting"
  | "supply-runs"
  | "training"
  | "photography";

export interface FosterParent extends BaseProfile {
  role: "foster";
  activeDogIds: string[];
  yearsFostering: number;
  householdNotes: string;
  matchingProfile: {
    housingType: "studio" | "apartment" | "house";
    yard: "none" | "unfenced" | "fenced";
    activityLevel: "low" | "moderate" | "active" | "very-active";
    hoursAwayPerDay: number;
    residentPets: string[];
    experience: string[];
    preferences: string[];
  };
}

export type UserProfile = Volunteer | FosterParent;

export type DogSize = "small" | "medium" | "large" | "extra-large";
export type EnergyLevel = "low" | "moderate" | "high";

export type DogStatus =
  | "intake"
  | "in-care"
  | "needs-vet"
  | "available-for-adoption"
  | "adopted";

export interface MedicalNote {
  condition: string;
  medication?: string;
  instructions: string;
}

export interface FeedingSchedule {
  foodBrand: string;
  timesPerDay: number;
  amountPerMeal: string;
  allergies: string[];
}

export interface DogProfile {
  id: string;
  name: string;
  fosterParentId: string;
  photoUrl?: string;
  breed: string;
  age: number;
  size: DogSize;
  energyLevel: EnergyLevel;
  status: DogStatus;
  temperament: string[];
  goodWith: {
    kids: boolean;
    dogs: boolean;
    cats: boolean;
  };
  feeding: FeedingSchedule;
  medical: MedicalNote[];
  quirks: string[];
  behaviorObservations: BehaviorObservation[];
  intakeDate: string;
}

export type BehaviorCategory = "temperament" | "routine" | "trigger" | "progress";
export type ConcernLevel = "routine" | "watch" | "urgent";

// Who logged an observation. Optional so existing seed data stays valid;
// entries without it are treated as coming from the foster home.
export type JournalAuthorRole = "foster" | "volunteer";

export interface BehaviorObservation {
  id: string;
  category: BehaviorCategory;
  behavior: string;
  context: string;
  observedAt: string;
  concernLevel: ConcernLevel;
  sharedWithShelter: boolean;
  media?: ObservationMedia[];
  authorRole?: JournalAuthorRole;
  authorName?: string;
}

export interface ObservationMedia {
  id: string;
  type: "image" | "video" | "audio";
  url: string;
  name: string;
}

// --- Dynamic profile layer -------------------------------------------------
// Observations logged by fosters and volunteers are read by a rules engine that
// proposes profile traits. Proposals carry evidence and are never applied on
// their own: an admin confirms or dismisses each one (D10, "AI drafts, humans
// decide"). Objective statistics below update live and need no approval.

export type TraitKind = "temperament" | "quirk";

export interface TraitProposal {
  id: string;
  dogId: string;
  kind: TraitKind;
  trait: string;
  rationale: string;
  evidenceIds: string[];
  supportingCount: number;
}

export type TraitDecisionStatus = "confirmed" | "dismissed";

export interface TraitDecision {
  proposalId: string;
  trait: string;
  kind: TraitKind;
  status: TraitDecisionStatus;
  decidedAt: string;
}

export type AlertSeverity = "watch" | "urgent";

export interface HealthAlert {
  id: string;
  dogId: string;
  label: string;
  detail: string;
  severity: AlertSeverity;
  evidenceIds: string[];
}

export interface DogStats {
  daysInCare: number;
  observationCount: number;
  sharedCount: number;
  lastObservedAt: string | null;
  daysSinceLastObservation: number | null;
}

export type ExceptionKind =
  | "no-foster"
  | "overdue-checkin"
  | "health-alert"
  | "overdue-task"
  | "long-stay";

export interface OpsException {
  id: string;
  dogId: string;
  dogName: string;
  kind: ExceptionKind;
  label: string;
  detail: string;
  severity: AlertSeverity;
}

// Scheduling/workflow layer: vet visits, walks, transport, medication, etc.
// tied to a dog and optionally assigned to a volunteer.
export type TaskType =
  | "vet-visit"
  | "medication"
  | "dog-walking"
  | "vet-transport"
  | "overnight-sitting"
  | "supply-runs";

export type TaskStatus = "open" | "assigned" | "completed" | "cancelled";

export interface ScheduledTask {
  id: string;
  dogId: string;
  type: TaskType;
  scheduledFor: string;
  status: TaskStatus;
  assignedVolunteerId?: string;
  notes: string;
}
