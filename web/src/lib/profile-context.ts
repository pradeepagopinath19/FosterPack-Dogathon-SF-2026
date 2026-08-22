import type { BehaviorObservation } from "@/types";

export interface StoredDogContext {
  dogId: string;
  updatedAt: string;
  observations: BehaviorObservation[];
}

const keyForDog = (dogId: string) => `fosterpack:dog-context:${dogId}`;

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
