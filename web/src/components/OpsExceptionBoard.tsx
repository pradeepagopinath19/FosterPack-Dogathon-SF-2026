"use client";

import Link from "next/link";
import { useMemo } from "react";
import { deriveExceptions } from "@/lib/insights";
import { useDogObservations, useNow } from "@/lib/use-dog-insights";
import type { BehaviorObservation, DogProfile, FosterParent, ScheduledTask } from "@/types";

const kindLabels: Record<string, string> = {
  "no-foster": "Placement",
  "overdue-checkin": "Check-in",
  "health-alert": "Health",
  "overdue-task": "Task",
  "long-stay": "Length of stay",
};

export default function OpsExceptionBoard({
  dogs,
  fosters,
  tasks,
}: {
  dogs: DogProfile[];
  fosters: FosterParent[];
  tasks: ScheduledTask[];
}) {
  const seed = useMemo(
    () => dogs.map((dog) => ({ id: dog.id, behaviorObservations: dog.behaviorObservations })),
    [dogs],
  );
  const { byDog, hydrated } = useDogObservations(seed);
  const now = useNow();

  // Entries a foster marked private never feed the operations board.
  const sharedByDog = useMemo(() => {
    const next: Record<string, BehaviorObservation[]> = {};
    for (const dog of dogs) {
      const list = byDog[dog.id] ?? dog.behaviorObservations;
      next[dog.id] = list.filter((observation) => observation.sharedWithShelter);
    }
    return next;
  }, [byDog, dogs]);

  if (!now) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        Checking for exceptions…
      </p>
    );
  }

  const exceptions = deriveExceptions(dogs, sharedByDog, fosters, tasks, now);

  if (exceptions.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200">
        Nothing needs attention right now.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {!hydrated && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading the latest journal activity…</p>
      )}
      {exceptions.map((exception) => (
        <Link
          key={exception.id}
          href={`/admin/dogs/${exception.dogId}`}
          className={`rounded-xl border p-4 transition-colors ${
            exception.severity === "urgent"
              ? "border-red-200 bg-red-50 hover:bg-red-100/70 dark:border-red-900 dark:bg-red-950/30 dark:hover:bg-red-950/50"
              : "border-amber-200 bg-amber-50 hover:bg-amber-100/70 dark:border-amber-900 dark:bg-amber-950/30 dark:hover:bg-amber-950/50"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                exception.severity === "urgent"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
              }`}
            >
              {kindLabels[exception.kind] ?? "Exception"}
            </span>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              {exception.dogName} &middot; {exception.label}
            </p>
          </div>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{exception.detail}</p>
        </Link>
      ))}
    </div>
  );
}
