"use client";

import { useCallback, useEffect, useState } from "react";
import { loadDogContext, loadTraitDecisions, saveTraitDecisions } from "./profile-context";
import type {
  BehaviorObservation,
  DogProfile,
  TraitDecision,
  TraitDecisionStatus,
  TraitProposal,
} from "@/types";

type SeedDog = Pick<DogProfile, "id" | "behaviorObservations">;

/**
 * Observations start as the seeded server values and are replaced by anything
 * the foster or volunteer has since written to browser storage. The swap runs
 * after mount so the server and client markup match on first paint.
 */
export function useDogObservations(dogs: SeedDog[]) {
  const dogKey = dogs.map((dog) => dog.id).join(",");

  const [byDog, setByDog] = useState<Record<string, BehaviorObservation[]>>(() => {
    const map: Record<string, BehaviorObservation[]> = {};
    for (const dog of dogs) map[dog.id] = dog.behaviorObservations;
    return map;
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setByDog((current) => {
        const next: Record<string, BehaviorObservation[]> = {};
        for (const id of dogKey.split(",").filter(Boolean)) {
          const stored = loadDogContext(id);
          next[id] = stored ? stored.observations : current[id] ?? [];
        }
        return next;
      });
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [dogKey]);

  return { byDog, hydrated };
}

/** Admin confirm/dismiss decisions for one dog's proposed traits. */
export function useTraitDecisions(dogId: string) {  const [decisions, setDecisions] = useState<TraitDecision[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDecisions(loadTraitDecisions(dogId));
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [dogId]);

  const decide = useCallback(
    (proposal: TraitProposal, status: TraitDecisionStatus) => {
      setDecisions((current) => {
        const next: TraitDecision[] = [
          ...current.filter((decision) => decision.proposalId !== proposal.id),
          {
            proposalId: proposal.id,
            trait: proposal.trait,
            kind: proposal.kind,
            status,
            decidedAt: new Date().toISOString(),
          },
        ];
        saveTraitDecisions(dogId, next);
        return next;
      });
    },
    [dogId],
  );

  const undo = useCallback(
    (proposalId: string) => {
      setDecisions((current) => {
        const next = current.filter((decision) => decision.proposalId !== proposalId);
        saveTraitDecisions(dogId, next);
        return next;
      });
    },
    [dogId],
  );

  return { decisions, hydrated, decide, undo };
}

/**
 * `null` until mounted. Date-derived output renders only once this is set,
 * which keeps clock-dependent values out of the server/client markup diff.
 */
export function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  return now;
}

/** Read-only decisions for many dogs at once, for roster and board views. */
export function useAllTraitDecisions(dogIds: string[]) {
  const key = dogIds.join(",");
  const [byDog, setByDog] = useState<Record<string, TraitDecision[]>>({});

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next: Record<string, TraitDecision[]> = {};
      for (const id of key.split(",").filter(Boolean)) {
        next[id] = loadTraitDecisions(id);
      }
      setByDog(next);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [key]);

  return byDog;
}
