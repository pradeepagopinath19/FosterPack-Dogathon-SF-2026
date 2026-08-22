"use client";
/* eslint-disable @next/next/no-img-element -- demo media is supplied as browser data URLs */

import { useEffect, useMemo, useState } from "react";
import { loadDogContext } from "@/lib/profile-context";
import type { BehaviorObservation } from "@/types";

const categoryLabels = {
  temperament: "Temperament",
  routine: "Routine",
  trigger: "Trigger",
  progress: "Progress",
};

function matchingSignals(observations: BehaviorObservation[]) {
  const text = observations.map((item) => `${item.behavior} ${item.context}`.toLowerCase()).join(" ");
  const signals: Array<{ label: string; detail: string; tone: string }> = [];
  if (/visitor|delivery|bark|noise|skateboard/.test(text)) signals.push({ label: "Lower-stimulation home", detail: "Sensitive to sudden people, sounds, or street activity", tone: "amber" });
  if (/calm|quiet|settled|relax/.test(text)) signals.push({ label: "Calm handling works", detail: "Responds well to space, patience, and predictable routines", tone: "emerald" });
  if (/walk|pull|leash/.test(text)) signals.push({ label: "Confident leash handler", detail: "Match with a foster comfortable managing outdoor triggers", tone: "sky" });
  if (/medication|medical|tired|eat|appetite/.test(text)) signals.push({ label: "Medical observation", detail: "Coordinator should review care context before placement", tone: "rose" });
  if (signals.length === 0) signals.push({ label: "Context building", detail: "More foster observations will strengthen future matching", tone: "zinc" });
  return signals;
}

export default function AdminDogContext({ dogId, dogName, initialObservations }: { dogId: string; dogName: string; initialObservations: BehaviorObservation[] }) {
  const [observations, setObservations] = useState(initialObservations);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const hydrate = window.setTimeout(() => {
      const stored = loadDogContext(dogId);
      if (stored) {
        setObservations(stored.observations.filter((observation) => observation.sharedWithShelter));
        setUpdatedAt(stored.updatedAt);
      }
    }, 0);
    return () => window.clearTimeout(hydrate);
  }, [dogId]);

  const signals = useMemo(() => matchingSignals(observations), [observations]);
  const mediaCount = observations.reduce((count, observation) => count + (observation.media?.length ?? 0), 0);

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-50/60 dark:border-indigo-900 dark:bg-indigo-950/20">
      <div className="flex flex-col gap-3 border-b border-indigo-100 p-5 dark:border-indigo-900 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-700 dark:text-indigo-300">Admin only · Matching context</p>
          <h3 className="mt-1 text-xl font-bold text-zinc-950 dark:text-white">What the foster home taught us about {dogName}</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-700 dark:text-zinc-200">FosterPack organizes everyday observations into evidence that staff can use for the next foster or adoption match.</p>
        </div>
        <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm ring-1 ring-indigo-100 dark:bg-zinc-900 dark:text-indigo-200 dark:ring-indigo-900">{observations.length} shared updates</span>
      </div>

      <div className="p-5">
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3"><p className="text-sm font-bold text-zinc-900 dark:text-white">Matching impact</p><span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Evidence-linked, human reviewed</span></div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {signals.map((signal) => <div key={signal.label} className={`rounded-xl border p-3 ${signal.tone === "amber" ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30" : signal.tone === "emerald" ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30" : signal.tone === "sky" ? "border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/30" : signal.tone === "rose" ? "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30" : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"}`}><p className="text-sm font-bold text-zinc-900 dark:text-white">{signal.label}</p><p className="mt-0.5 text-xs leading-5 text-zinc-600 dark:text-zinc-300">{signal.detail}</p></div>)}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3"><div><p className="text-sm font-bold text-zinc-900 dark:text-white">Foster observations</p><p className="text-xs text-zinc-500 dark:text-zinc-400">{mediaCount} media attachment{mediaCount === 1 ? "" : "s"} · newest first</p></div>{updatedAt && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">Updated from foster view</span>}</div>

        <div className="mt-3 space-y-3">
          {observations.map((observation) => {
            const visuals = observation.media?.filter((media) => media.type !== "audio") ?? [];
            const hasAudio = observation.media?.some((media) => media.type === "audio");
            return <article key={observation.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100">{categoryLabels[observation.category]}</span>{observation.concernLevel !== "routine" && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">{observation.concernLevel === "urgent" ? "Urgent review" : "Watch"}</span>}</div><span className="text-xs text-zinc-500">{new Date(observation.observedAt).toLocaleDateString()}</span></div><h4 className="mt-3 font-bold text-zinc-950 dark:text-white">{observation.behavior}</h4><p className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-200">{observation.context}</p>{(hasAudio || visuals.length > 0) && <div className="mt-3 flex flex-wrap gap-2">{hasAudio && <span className="rounded-lg bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">🎙 Voice note attached</span>}{visuals.map((media) => media.url && media.type === "image" ? <img key={media.id} src={media.url} alt={media.name} className="h-20 w-24 rounded-lg object-cover" /> : <span key={media.id} className="rounded-lg bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">{media.type === "video" ? "▶" : "▧"} {media.name}</span>)}</div>}</article>;
          })}
        </div>
      </div>
    </section>
  );
}
