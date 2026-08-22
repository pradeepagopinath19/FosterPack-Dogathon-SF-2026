"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { TimeBlock, Volunteer, VolunteerSkill, Weekday } from "@/types";
import { skillLabels } from "@/lib/labels";

const WEEKDAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_BLOCKS: TimeBlock[] = ["Morning", "Afternoon", "Evening"];
const BLOCK_ABBR: Record<TimeBlock, string> = { Morning: "AM", Afternoon: "PM", Evening: "Eve" };
const ALL_SKILLS = Object.keys(skillLabels) as VolunteerSkill[];

function slotKey(day: Weekday, block: TimeBlock) {
  return `${day}-${block}`;
}

// Parses the display strings ("Mon AM") this volunteer was seeded with into
// grid selections. Anything that doesn't match the "Day AM/PM" shape (e.g.
// "Weekends") is skipped — the grid is the new source of truth going forward.
function parseInitialSlots(availability: string[]): Set<string> {
  const abbrToBlock: Record<string, TimeBlock> = { AM: "Morning", PM: "Afternoon", Eve: "Evening" };
  const slots = new Set<string>();
  for (const entry of availability) {
    const [day, abbr] = entry.split(" ");
    if (WEEKDAYS.includes(day as Weekday) && abbrToBlock[abbr]) {
      slots.add(slotKey(day as Weekday, abbrToBlock[abbr]));
    }
  }
  return slots;
}

// Date-only strings ("2026-08-30") parse as UTC midnight; new Date(...) would
// then render a day earlier in any timezone behind UTC. Parse the parts
// directly instead of going through the UTC-anchored Date constructor.
function formatDateOnly(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function slotsToStrings(slots: Set<string>): string[] {
  return WEEKDAYS.flatMap((day) =>
    TIME_BLOCKS.filter((block) => slots.has(slotKey(day, block))).map((block) => `${day} ${BLOCK_ABBR[block]}`),
  );
}

function formatSlotsSummary(slots: Set<string>): string {
  const parts = slotsToStrings(slots);
  return parts.length === 0 ? "No recurring availability set" : parts.join(", ");
}

export default function AvailabilityEditor({ volunteer }: { volunteer: Volunteer }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [savedSlots, setSavedSlots] = useState(() => parseInitialSlots(volunteer.availability));
  const [savedSkills, setSavedSkills] = useState(new Set(volunteer.skills));
  const [savedRadius, setSavedRadius] = useState(volunteer.maxTravelMiles);
  const [savedVehicle, setSavedVehicle] = useState(volunteer.hasVehicle);
  const [savedExceptions, setSavedExceptions] = useState(volunteer.availabilityExceptions);

  const [draftSlots, setDraftSlots] = useState(savedSlots);
  const [draftSkills, setDraftSkills] = useState(savedSkills);
  const [draftRadius, setDraftRadius] = useState(savedRadius);
  const [draftVehicle, setDraftVehicle] = useState(savedVehicle);
  const [draftExceptions, setDraftExceptions] = useState(savedExceptions);
  const [exceptionDate, setExceptionDate] = useState("");
  const [exceptionNote, setExceptionNote] = useState("");

  function startEdit() {
    setDraftSlots(new Set(savedSlots));
    setDraftSkills(new Set(savedSkills));
    setDraftRadius(savedRadius);
    setDraftVehicle(savedVehicle);
    setDraftExceptions(savedExceptions);
    setExceptionDate("");
    setExceptionNote("");
    setSavedMessage("");
    setEditing(true);
  }

  function toggleSlot(day: Weekday, block: TimeBlock) {
    const key = slotKey(day, block);
    setDraftSlots((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleSkill(skill: VolunteerSkill) {
    setDraftSkills((current) => {
      const next = new Set(current);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  }

  function addException() {
    if (!exceptionDate || !exceptionNote.trim()) return;
    setDraftExceptions((current) => [
      ...current,
      { id: `exc-${Date.now()}`, date: exceptionDate, note: exceptionNote.trim() },
    ]);
    setExceptionDate("");
    setExceptionNote("");
  }

  function removeException(id: string) {
    setDraftExceptions((current) => current.filter((exception) => exception.id !== id));
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch(`/api/volunteers/${volunteer.id}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availability: slotsToStrings(draftSlots),
          availabilityExceptions: draftExceptions,
          skills: [...draftSkills],
          maxTravelMiles: draftRadius,
          hasVehicle: draftVehicle,
        }),
      });
      if (!response.ok) throw new Error("Save failed");

      setSavedSlots(draftSlots);
      setSavedSkills(draftSkills);
      setSavedRadius(draftRadius);
      setSavedVehicle(draftVehicle);
      setSavedExceptions(draftExceptions);
      setEditing(false);
      setSavedMessage("Availability saved — matching tasks will use this going forward.");
      router.refresh();
    } catch {
      setSaveError("Couldn't save your availability — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700 dark:text-orange-300">
            Availability
          </p>
          <h2 className="mt-0.5 text-base font-semibold text-zinc-950 dark:text-white">Availability & skills</h2>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={startEdit}
            className="shrink-0 rounded-full bg-orange-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-700"
          >
            Edit
          </button>
        )}
      </div>

      {savedMessage && !editing && (
        <p role="status" className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200">
          ✓ {savedMessage}
        </p>
      )}

      {!editing && (
        <div className="mt-3 flex flex-col gap-3">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Weekly availability</p>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{formatSlotsSummary(savedSlots)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">What you can do</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {[...savedSkills].map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                >
                  {skillLabels[skill]}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Travels up to {savedRadius} miles &middot; {savedVehicle ? "has a vehicle" : "no vehicle"}
          </p>
          {savedExceptions.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">One-off exceptions</p>
              <ul className="mt-1 flex flex-col gap-1">
                {savedExceptions.map((exception) => (
                  <li key={exception.id} className="text-sm text-zinc-900 dark:text-zinc-100">
                    {formatDateOnly(exception.date)}:{" "}
                    {exception.note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {editing && (
        <form onSubmit={save} className="mt-4 flex flex-col gap-5">
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Recurring weekly availability</p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[420px] border-separate border-spacing-1 text-center">
                <thead>
                  <tr>
                    <th />
                    {WEEKDAYS.map((day) => (
                      <th key={day} className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_BLOCKS.map((block) => (
                    <tr key={block}>
                      <td className="pr-2 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {block}
                      </td>
                      {WEEKDAYS.map((day) => {
                        const selected = draftSlots.has(slotKey(day, block));
                        return (
                          <td key={day}>
                            <button
                              type="button"
                              onClick={() => toggleSlot(day, block)}
                              aria-pressed={selected}
                              className={`h-8 w-10 rounded-md text-xs font-medium transition-colors ${
                                selected
                                  ? "bg-orange-600 text-white"
                                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                              }`}
                            >
                              {BLOCK_ABBR[block]}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">What you can do</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ALL_SKILLS.map((skill) => {
                const selected = draftSkills.has(skill);
                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    aria-pressed={selected}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      selected
                        ? "bg-orange-600 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {skillLabels[skill]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Travel radius (miles)
              <input
                type="number"
                min={0}
                value={draftRadius}
                onChange={(event) => setDraftRadius(Number(event.target.value))}
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              />
            </label>
            <label className="mt-6 flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={draftVehicle}
                onChange={(event) => setDraftVehicle(event.target.checked)}
                className="size-4 accent-orange-600"
              />
              I have a vehicle
            </label>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">One-off exceptions</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              A specific date that differs from your weekly pattern — extra availability or time off.
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {draftExceptions.map((exception) => (
                <div
                  key={exception.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800"
                >
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">
                    {formatDateOnly(exception.date)}:{" "}
                    {exception.note}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeException(exception.id)}
                    className="shrink-0 text-xs font-medium text-zinc-500 hover:text-red-600 dark:text-zinc-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                type="date"
                value={exceptionDate}
                onChange={(event) => setExceptionDate(event.target.value)}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              />
              <input
                type="text"
                value={exceptionNote}
                onChange={(event) => setExceptionNote(event.target.value)}
                placeholder="What can you do this day?"
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-600 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              />
              <button
                type="button"
                onClick={addException}
                className="shrink-0 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Add
              </button>
            </div>
          </div>

          {saveError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800 dark:bg-red-950/40 dark:text-red-200">
              {saveError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save availability"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
