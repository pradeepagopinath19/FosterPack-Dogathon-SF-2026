"use client";

import Link from "next/link";
import { useMemo } from "react";
import { deriveDogStats, deriveHealthAlerts, deriveTraitProposals } from "@/lib/insights";
import { dogStatusLabels, dogStatusStyles } from "@/lib/labels";
import { useAllTraitDecisions, useDogObservations, useNow } from "@/lib/use-dog-insights";
import type { DogProfile, FosterParent } from "@/types";

export default function DogRosterList({
  dogs,
  fosters,
}: {
  dogs: DogProfile[];
  fosters: FosterParent[];
}) {
  const seed = useMemo(
    () => dogs.map((dog) => ({ id: dog.id, behaviorObservations: dog.behaviorObservations })),
    [dogs],
  );
  const dogIds = useMemo(() => dogs.map((dog) => dog.id), [dogs]);

  const { byDog } = useDogObservations(seed);
  const decisionsByDog = useAllTraitDecisions(dogIds);
  const now = useNow();

  return (
    <div className="flex flex-col gap-3">
      {dogs.map((dog) => {
        const observations = (byDog[dog.id] ?? dog.behaviorObservations).filter(
          (observation) => observation.sharedWithShelter,
        );
        const decisions = decisionsByDog[dog.id] ?? [];
        const stats = now ? deriveDogStats(dog, observations, now) : null;
        const alerts = deriveHealthAlerts(dog, observations);
        const proposals = deriveTraitProposals(dog, observations, decisions);
        const foster = fosters.find((candidate) => candidate.id === dog.fosterParentId);

        return (
          <Link
            key={dog.id}
            href={`/admin/dogs/${dog.id}`}
            className="rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-zinc-900 dark:text-zinc-50">{dog.name}</p>
                <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                  {dog.breed} &middot; {dog.age} yrs &middot;{" "}
                  {foster ? foster.name : <span className="text-red-600 dark:text-red-400">no foster</span>}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${dogStatusStyles[dog.status]}`}
              >
                {dogStatusLabels[dog.status]}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">
                {stats ? `${stats.daysInCare} days in care` : "—"}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span className="text-zinc-500 dark:text-zinc-400">
                {stats
                  ? stats.daysSinceLastObservation === null
                    ? "no check-ins"
                    : stats.daysSinceLastObservation === 0
                      ? "checked in today"
                      : `last check-in ${stats.daysSinceLastObservation}d ago`
                  : "—"}
              </span>

              {alerts.length > 0 && (
                <span
                  className={`rounded-full px-2.5 py-1 font-semibold ${
                    alerts.some((alert) => alert.severity === "urgent")
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                  }`}
                >
                  {alerts.length} health {alerts.length === 1 ? "signal" : "signals"}
                </span>
              )}

              {proposals.length > 0 && (
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 font-semibold text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100">
                  {proposals.length} to review
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
