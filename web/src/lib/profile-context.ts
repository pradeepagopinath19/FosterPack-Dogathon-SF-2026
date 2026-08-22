import type { BehaviorObservation, TraitDecision } from "@/types";

export interface StoredDogContext {
  dogId: string;
  updatedAt: string;
  observations: BehaviorObservation[];
}

const keyForDog = (dogId: string) => `fosterpack:dog-context:${dogId}`;
const keyForTraits = (dogId: string) => `fosterpack:dog-traits:${dogId}`;

export function loadDogContext(dogId: string): StoredDogContext | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(keyForDog(dogId));
    return value ? JSON.parse(value) as StoredDogContext : null;
  } catch {
    return null;
  }
}

export function saveDogContext(dogId: string, observations: BehaviorObservation[]) {
  if (typeof window === "undefined") return;
  const safeObservations = observations.map((observation) => ({
    ...observation,
    media: observation.media?.map((media) => ({
      ...media,
      // Blob URLs do not survive navigation. Data URLs and attachment metadata do.
      url: media.url.startsWith("data:") ? media.url : "",
    })),
  }));
  try {
    window.localStorage.setItem(keyForDog(dogId), JSON.stringify({ dogId, updatedAt: new Date().toISOString(), observations: safeObservations }));
  } catch {
    // A large video can exceed browser demo storage. Its metadata still remains in component state.
  }
}

// Admin decisions on proposed profile traits. Kept under a separate key so a
// storage failure while saving media never takes the profile decisions with it.
export function loadTraitDecisions(dogId: string): TraitDecision[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(keyForTraits(dogId));
    if (!value) return [];
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as TraitDecision[]) : [];
  } catch {
    return [];
  }
}

export function saveTraitDecisions(dogId: string, decisions: TraitDecision[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(keyForTraits(dogId), JSON.stringify(decisions));
  } catch {
    // Decisions stay in component state for this session even if storage is full.
  }
}
