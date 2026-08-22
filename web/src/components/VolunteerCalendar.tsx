"use client";

import { useMemo, useState } from "react";
import type { DogProfile, ScheduledTask } from "@/types";
import TaskCard from "@/components/TaskCard";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function buildMonthCells(year: number, month: number): (number | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function VolunteerCalendar({
  tasks,
  dogs,
}: {
  tasks: ScheduledTask[];
  dogs: DogProfile[];
}) {
  const initialDate = tasks.length > 0 ? new Date(tasks[0].scheduledFor) : new Date();
  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());
  const [selectedKey, setSelectedKey] = useState(dateKey(initialDate));

  const tasksByDay = useMemo(() => {
    const map = new Map<string, ScheduledTask[]>();
    for (const task of tasks) {
      const key = dateKey(new Date(task.scheduledFor));
      map.set(key, [...(map.get(key) ?? []), task]);
    }
    return map;
  }, [tasks]);

  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);
  const today = new Date();
  const selectedTasks = tasksByDay.get(selectedKey) ?? [];

  function goToMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          {new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            aria-label="Previous month"
            className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={() => goToMonth(1)}
            aria-label="Next month"
            className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            &rarr;
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i}>{label}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const key = `${year}-${month}-${day}`;
          const hasTasks = tasksByDay.has(key);
          const isSelected = key === selectedKey;
          const isToday = dateKey(today) === key;

          return (
            <button
              type="button"
              key={i}
              onClick={() => setSelectedKey(key)}
              className={`relative flex h-9 flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                isSelected
                  ? "bg-orange-600 text-white"
                  : isToday
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {day}
              {hasTasks && (
                <span
                  className={`absolute bottom-1 h-1 w-1 rounded-full ${
                    isSelected ? "bg-white" : "bg-orange-600"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        {selectedTasks.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Nothing scheduled this day.</p>
        )}
        {selectedTasks.map((task) => (
          <TaskCard key={task.id} task={task} dog={dogs.find((d) => d.id === task.dogId)} />
        ))}
      </div>
    </div>
  );
}
