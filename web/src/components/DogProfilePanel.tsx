"use client";

import { useMemo } from "react";
import {
  deriveDogStats,
  deriveHealthAlerts,
  deriveTraitProposals,
  effectiveProfile,
} from "@/lib/insights";
import { useDogObservations, useNow, useTraitDecisions } from "@/lib/use-dog-insights";
import type { BehaviorObservation, DogProfile } from "@/types";

const categoryLabels: Record<BehaviorObservation["category"], string> = {
  temperament: "Temperament",
  routine: "Daily routine",
  trigger: "Trigger",
  progress: "Positive progress",
};

function formatStamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

export default function DogProfilePanel({ dog }: { dog: DogProfile }) {
  const dogs = useMemo(() => [{ id: dog.id, behaviorObservations: dog.behaviorObservations }], [dog]);
  const { byDog } = useDogObservations(dogs);
  const { decisions, decide, undo } = useTraitDecisions(dog.id);
  const now = useNow();

  const allObservations = byDog[dog.id] ?? dog.behaviorObservations;
  // A foster can mark an entry private. The shelter view honours that, so
  // private entries never reach the profile, the proposals, or the alerts.
  const observations = useMemo(
    () => allObservations.filter((observation) => observation.sharedWithShelter),
    [allObservations],
  );
  const privateCount = allObservations.length - observations.length;

  const sorted = useMemo(
    () => [...observations].sort((a, b) => b.observedAt.localeCompare(a.observedAt)),
    [observations],
  );

  const profile = effectiveProfile(dog, decisions);
  const proposals = deriveTraitProposals(dog, observations, decisions);
  const alerts = deriveHealthAlerts(dog, observations);
  const stats = now ? deriveDogStats(dog, observations, now) : null;

  const confirmedTraits = new Set(
    decisions.filter((decision) => decision.status === "confirmed").map((d) => d.trait.toLowerCase()),
  );
  const dismissed = decisions.filter((decision) => decision.status === "dismissed");
  const byId = new Map(observations.map((observation) => [observation.id, observation]));

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={stats ? String(stats.daysInCare) : "—"} label="Days in care" />
        <Stat value={String(observations.length)} label="Shared journal entries" />
        <Stat value={String(privateCount)} label="Kept private by foster" />
        <Stat
          value={
            stats
              ? stats.daysSinceLastObservation === null
                ? "None"
                : stats.daysSinceLastObservation === 0
                  ? "Today"
                  : `${stats.daysSinceLastObservation}d ago`
              : "—"
          }
          label="Last check-in"
        />
      </section>

      {alerts.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Health signals</h2>
          <div className="mt-2 flex flex-col gap-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl border p-4 ${
                  alert.severity === "urgent"
                    ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
                    : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      alert.severity === "urgent"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                    }`}
                  >
                    {alert.severity === "urgent" ? "Urgent" : "Watch"}
                  </span>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{alert.label}</p>
                </div>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{alert.detail}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Based on {alert.evidenceIds.length} journal{" "}
                  {alert.evidenceIds.length === 1 ? "entry" : "entries"}. Advisory only — the record is unchanged.
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Profile</h2>
        <div className="mt-2 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Temperament</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.temperament.map((trait) => {
              const fromJournal = confirmedTraits.has(trait.toLowerCase());
              return (
                <span
                  key={trait}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    fromJournal
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                  title={fromJournal ? "Confirmed from journal evidence" : undefined}
                >
                  {trait}
                  {fromJournal ? " ✓" : ""}
                </span>
              );
            })}
          </div>

          <p className="mt-5 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Quirks</p>
          <ul className="mt-2 flex flex-col gap-1">
            {profile.quirks.map((quirk) => (
              <li key={quirk} className="text-sm text-zinc-900 dark:text-zinc-100">
                {quirk}
                {confirmedTraits.has(quirk.toLowerCase()) && (
                  <span className="ml-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    confirmed from journal
                  </span>
                )}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            Entries marked ✓ started as journal observations and were confirmed by an admin.
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Proposed from the journal
          </h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {proposals.length} awaiting review
          </span>
        </div>

        {proposals.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            Nothing new to review. Proposals appear once the same signal shows up in more than one
            entry.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-3">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900 dark:bg-indigo-950/20"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold capitalize text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100">
                    {proposal.kind}
                  </span>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{proposal.trait}</p>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {proposal.supportingCount} supporting{" "}
                    {proposal.supportingCount === 1 ? "entry" : "entries"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{proposal.rationale}</p>

                <div className="mt-3 flex flex-col gap-2">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Evidence</p>
                  {proposal.evidenceIds.map((id) => {
                    const observation = byId.get(id);
                    if (!observation) return null;
                    return (
                      <div
                        key={id}
                        className="rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">
                          {observation.behavior}
                        </p>
                        <p className="mt-0.5 text-zinc-600 dark:text-zinc-400">{observation.context}</p>
                        {now && (
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {formatStamp(observation.observedAt)}
                            {observation.authorRole ? ` · ${observation.authorRole}` : ""}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => decide(proposal, "confirmed")}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                  >
                    Add to profile
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(proposal, "dismissed")}
                    className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {dismissed.length > 0 && (
          <details className="mt-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <summary className="cursor-pointer text-sm text-zinc-600 dark:text-zinc-400">
              {dismissed.length} dismissed {dismissed.length === 1 ? "proposal" : "proposals"}
            </summary>
            <div className="mt-3 flex flex-col gap-2">
              {dismissed.map((decision) => (
                <div key={decision.proposalId} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{decision.trait}</span>
                  <button
                    type="button"
                    onClick={() => undo(decision.proposalId)}
                    className="text-xs font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
                  >
                    Undo
                  </button>
                </div>
              ))}
            </div>
          </details>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Journal</h2>
        <div className="mt-2 flex flex-col gap-3">
          {sorted.length === 0 && (
            <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              No entries yet. Fosters and volunteers add these from their own views.
            </p>
          )}
          {sorted.map((observation) => (
            <article
              key={observation.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {categoryLabels[observation.category]}
                  </span>
                  {observation.concernLevel !== "routine" && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        observation.concernLevel === "urgent"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                      }`}
                    >
                      {observation.concernLevel === "urgent" ? "Urgent" : "Watch"}
                    </span>
                  )}
                </div>
                {now && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatStamp(observation.observedAt)}
                  </span>
                )}
              </div>
              <h3 className="mt-2 font-medium text-zinc-900 dark:text-zinc-50">{observation.behavior}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{observation.context}</p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Logged by {observation.authorName ?? "the foster home"}
                {observation.authorRole ? ` · ${observation.authorRole}` : ""}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
