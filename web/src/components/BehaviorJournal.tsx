"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { BehaviorCategory, BehaviorObservation, ConcernLevel } from "@/types";

const categoryLabels: Record<BehaviorCategory, string> = {
  temperament: "Temperament",
  routine: "Daily routine",
  trigger: "Trigger",
  progress: "Positive progress",
};

const concernLabels: Record<ConcernLevel, string> = {
  routine: "Routine note",
  watch: "Keep watching",
  urgent: "Contact shelter",
};

type FormState = Omit<BehaviorObservation, "id" | "observedAt">;

const emptyForm: FormState = {
  category: "progress",
  behavior: "",
  context: "",
  concernLevel: "routine",
  sharedWithShelter: false,
};

function formatObservationDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function BehaviorJournal({
  dogName,
  temperament,
  initialObservations,
}: {
  dogName: string;
  temperament: string[];
  initialObservations: BehaviorObservation[];
}) {
  const [observations, setObservations] = useState(initialObservations);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const profileInsights = useMemo(
    () => [
      ...temperament,
      ...observations.slice(0, 3).map((observation) => observation.behavior),
    ],
    [observations, temperament],
  );

  function startNew() {
    setEditingId(null);
    setForm(emptyForm);
    setSavedMessage("");
    setFormOpen(true);
  }

  function startEdit(observation: BehaviorObservation) {
    setEditingId(observation.id);
    setForm({
      category: observation.category,
      behavior: observation.behavior,
      context: observation.context,
      concernLevel: observation.concernLevel,
      sharedWithShelter: observation.sharedWithShelter,
    });
    setSavedMessage("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function saveObservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanBehavior = form.behavior.trim();
    const cleanContext = form.context.trim();
    if (!cleanBehavior || !cleanContext) return;

    if (editingId) {
      setObservations((current) =>
        current.map((observation) =>
          observation.id === editingId
            ? { ...observation, ...form, behavior: cleanBehavior, context: cleanContext }
            : observation,
        ),
      );
      setSavedMessage("Observation updated in the living profile.");
    } else {
      const observation: BehaviorObservation = {
        id: `behavior-${Date.now()}`,
        ...form,
        behavior: cleanBehavior,
        context: cleanContext,
        observedAt: new Date().toISOString(),
      };
      setObservations((current) => [observation, ...current]);
      setSavedMessage("Observation added to the living profile.");
    }

    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
            Living behavior profile
          </p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            What you notice helps {dogName}
          </h3>
          <p className="mt-1 max-w-lg text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Add real-life context from home. These observations help future fosters, volunteers, and shelter staff understand what works.
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="shrink-0 rounded-full bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          + Add observation
        </button>
      </div>

      <div className="border-y border-emerald-100 bg-white/75 px-5 py-4 dark:border-emerald-900 dark:bg-zinc-950/40">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Profile insights · updated by care experience</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {profileInsights.map((insight, index) => (
            <span
              key={`${insight}-${index}`}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                index < temperament.length
                  ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
              }`}
            >
              {insight}
            </span>
          ))}
        </div>
      </div>

      {savedMessage && (
        <p role="status" className="mx-5 mt-4 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
          ✓ {savedMessage}
        </p>
      )}

      {formOpen && (
        <form onSubmit={saveObservation} className="m-5 rounded-xl border border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-4">
            <h4 className="font-semibold text-zinc-950 dark:text-zinc-50">
              {editingId ? "Update observation" : "New observation"}
            </h4>
            <button type="button" onClick={closeForm} className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
              Cancel
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Type
              <select
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as BehaviorCategory }))}
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              >
                {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Attention level
              <select
                value={form.concernLevel}
                onChange={(event) => setForm((current) => ({ ...current, concernLevel: event.target.value as ConcernLevel }))}
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              >
                {Object.entries(concernLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>

          <label className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            What did {dogName} do?
            <input
              required
              value={form.behavior}
              onChange={(event) => setForm((current) => ({ ...current, behavior: event.target.value }))}
              placeholder="Example: Relaxed when visitors sat quietly"
              className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            What was happening around them?
            <textarea
              required
              rows={3}
              value={form.context}
              onChange={(event) => setForm((current) => ({ ...current, context: event.target.value }))}
              placeholder="Include the place, people, sounds, and what helped."
              className="mt-1.5 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </label>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/70">
            <input
              type="checkbox"
              checked={form.sharedWithShelter}
              onChange={(event) => setForm((current) => ({ ...current, sharedWithShelter: event.target.checked }))}
              className="mt-0.5 size-4 accent-emerald-700"
            />
            <span>
              <span className="block text-sm font-medium text-zinc-800 dark:text-zinc-100">Share with shelter care team</span>
              <span className="block text-xs leading-5 text-zinc-500 dark:text-zinc-400">Useful for changes, triggers, and anything that may affect care.</span>
            </span>
          </label>

          {form.concernLevel === "urgent" && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              This entry will be highlighted, but it does not replace emergency care. Contact the shelter or emergency veterinarian using your approved protocol.
            </p>
          )}

          <button type="submit" className="mt-4 w-full rounded-lg bg-emerald-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500">
            {editingId ? "Save update" : "Add to behavior profile"}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3 p-5">
        {observations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-emerald-200 bg-white/60 p-5 text-center dark:border-emerald-800 dark:bg-zinc-900/50">
            <p className="font-medium text-zinc-800 dark:text-zinc-100">No home observations yet</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">The first note can be something small—what helped {dogName} settle, eat, play, or rest.</p>
          </div>
        ) : observations.map((observation) => (
          <article key={observation.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  {categoryLabels[observation.category]}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  observation.concernLevel === "urgent"
                    ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
                    : observation.concernLevel === "watch"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                }`}>
                  {concernLabels[observation.concernLevel]}
                </span>
              </div>
              <button type="button" onClick={() => startEdit(observation)} className="shrink-0 text-sm font-semibold text-emerald-800 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-100">
                Edit
              </button>
            </div>
            <h4 className="mt-3 font-semibold text-zinc-950 dark:text-zinc-50">{observation.behavior}</h4>
            <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{observation.context}</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span>{formatObservationDate(observation.observedAt)}</span>
              <span>{observation.sharedWithShelter ? "✓ Shared with shelter" : "Private foster note"}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
