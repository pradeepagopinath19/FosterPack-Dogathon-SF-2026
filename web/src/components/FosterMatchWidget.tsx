"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { loadDogContext } from "@/lib/profile-context";
import type { DogProfile, FosterParent } from "@/types";

const activityLabels = { low: "Low-key", moderate: "Moderately active", active: "Active", "very-active": "Very active" };

export default function FosterMatchWidget({ foster, dog }: { foster: FosterParent; dog: DogProfile }) {
  const [expanded, setExpanded] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [contextText, setContextText] = useState(dog.behaviorObservations.map((item) => `${item.behavior} ${item.context}`).join(" ").toLowerCase());

  useEffect(() => {
    const hydrate = window.setTimeout(() => {
      const stored = loadDogContext(dog.id);
      if (stored) setContextText(stored.observations.map((item) => `${item.behavior} ${item.context}`).join(" ").toLowerCase());
    }, 0);
    return () => window.clearTimeout(hydrate);
  }, [dog.id]);

  const factors = useMemo(() => {
    const positives: Array<{ title: string; explanation: string; evidence: string }> = [];
    if (foster.matchingProfile.yard === "fenced" && dog.energyLevel === "high") positives.push({ title: "Space for an active dog", explanation: `${dog.name} has high energy, and your fenced yard creates safer room for play and decompression.`, evidence: "Foster profile · Dog energy level" });
    if (foster.matchingProfile.residentPets.length === 0 && (!dog.goodWith.dogs || !dog.goodWith.cats)) positives.push({ title: "No resident-pet conflict", explanation: `${dog.name} is not currently recommended with other pets, and your home has none.`, evidence: "Household profile · Dog compatibility" });
    if (foster.yearsFostering >= 2 && dog.temperament.some((trait) => trait.includes("reactive"))) positives.push({ title: "Experience meets handling needs", explanation: `Your ${foster.yearsFostering} years of fostering and leash-reactivity experience support ${dog.name}’s current needs.`, evidence: "Experience profile · Behavior record" });
    if (/quiet|calm|settled|relax/.test(contextText)) positives.push({ title: "Your environment matches what works", explanation: `Foster observations show ${dog.name} settles with quiet, patient handling—and your profile describes a quiet street and one-dog home.`, evidence: "Foster observation · Household notes" });
    return positives;
  }, [contextText, dog, foster]);

  return (
    <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-emerald-950/5 dark:border-emerald-900 dark:bg-zinc-900">
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 p-5 text-white sm:p-7">
        <div className="absolute -right-16 -top-16 size-56 rounded-full border-[36px] border-white/5" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">Your strongest current match</p><h2 className="mt-2 text-3xl font-bold">You + {dog.name}</h2><p className="mt-2 max-w-lg text-sm leading-6 text-emerald-50">Your home, experience, and activity profile align with what we currently know about {dog.name}.</p></div>
          <div className="flex items-center gap-3"><div className="grid size-20 place-items-center rounded-2xl border border-white/20 bg-white/10 text-center shadow-xl backdrop-blur"><span className="text-2xl">🏡</span><span className="text-[10px] font-bold">YOUR HOME</span></div><span className="text-2xl text-emerald-200">↔</span>{dog.photoUrl && <Image src={dog.photoUrl} alt={dog.name} width={88} height={88} className="size-20 rounded-2xl border-2 border-white/80 object-cover shadow-xl" />}</div>
        </div>
        <div className="relative mt-5 flex flex-wrap items-center gap-2"><span className="rounded-full bg-emerald-300 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-emerald-950">Strong fit</span><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15">No hard-constraint conflicts found</span></div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/70"><p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-300">Your context</p><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200">🏠 {foster.matchingProfile.housingType} · {foster.matchingProfile.yard} yard</span><span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200">🏃 {activityLabels[foster.matchingProfile.activityLevel]}</span><span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200">🐾 {foster.matchingProfile.residentPets.length ? foster.matchingProfile.residentPets.join(", ") : "No resident pets"}</span><span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200">★ {foster.yearsFostering} years fostering</span></div></div>
          <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/25"><p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-800 dark:text-amber-200">{dog.name}’s needs</p><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200">⚡ {dog.energyLevel} energy</span><span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200">◉ {dog.size} dog</span>{dog.temperament.map((trait) => <span key={trait} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200">{trait}</span>)}</div></div>
        </div>

        <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-4 flex w-full items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-left text-sm font-bold text-emerald-900 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"><span>Why this match?</span><span>{expanded ? "↑" : "↓"}</span></button>

        {expanded && <div className="mt-3 space-y-2">{factors.map((factor) => <article key={factor.title} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"><div className="flex items-start gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-black text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">✓</span><div><h3 className="text-sm font-bold text-zinc-950 dark:text-white">{factor.title}</h3><p className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-200">{factor.explanation}</p><p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Evidence: {factor.evidence}</p></div></div></article>)}<article className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30"><p className="text-sm font-bold text-amber-900 dark:text-amber-100">One thing to confirm</p><p className="mt-1 text-sm leading-6 text-amber-800 dark:text-amber-200">Can your weekly routine consistently support a high-energy dog’s exercise needs? Your profile says “active,” but the coordinator should confirm the daily schedule.</p></article></div>}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-zinc-900 dark:text-white">Dogs likely to thrive with your household</p><p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Active adults · only-pet placements · dogs needing confident handling</p></div><button type="button" onClick={() => setAccepted(true)} className={`shrink-0 rounded-full px-5 py-3 text-sm font-bold transition ${accepted ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100" : "bg-emerald-800 text-white shadow-md hover:bg-emerald-900"}`}>{accepted ? "✓ Interested—staff notified" : "I’m interested in this match"}</button></div>
        <p className="mt-4 border-t border-zinc-100 pt-4 text-center text-xs leading-5 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">FosterPack suggests and explains. Shelter staff review safety constraints and make every placement decision.</p>
      </div>
    </section>
  );
}
