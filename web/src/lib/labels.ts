import type { DogStatus, ReliabilityStats, TaskStatus, TaskType, VolunteerSkill } from "@/types";

export const skillLabels: Record<VolunteerSkill, string> = {
  "dog-walking": "Dog walking",
  "vet-transport": "Vet transport",
  "overnight-sitting": "Overnight sitting",
  "supply-runs": "Supply runs",
  training: "Training",
  photography: "Photography",
};

export const taskTypeLabels: Record<TaskType, string> = {
  "vet-visit": "Vet visit",
  medication: "Medication",
  "dog-walking": "Dog walking",
  "vet-transport": "Vet transport",
  "overnight-sitting": "Overnight sitting",
  "supply-runs": "Supply run",
};

export const taskTypeIcon: Record<TaskType, string> = {
  "vet-visit": "🏥",
  medication: "💊",
  "dog-walking": "🐾",
  "vet-transport": "🚗",
  "overnight-sitting": "🌙",
  "supply-runs": "📦",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  open: "Open",
  assigned: "Assigned",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const dogStatusLabels: Record<DogStatus, string> = {
  intake: "Intake",
  "in-care": "In care",
  "needs-vet": "Needs vet",
  "available-for-adoption": "Available for adoption",
  adopted: "Adopted",
};

export const dogStatusStyles: Record<DogStatus, string> = {
  intake: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  "in-care": "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "needs-vet": "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "available-for-adoption": "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  adopted: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// Encouragement framing, never a punitive score — a volunteer with few
// claims yet reads as "getting started," not "unreliable."
export function reliabilityBadge(stats: ReliabilityStats): { label: string; style: string } {
  const completionRate = stats.tasksClaimed === 0 ? 1 : stats.tasksCompleted / stats.tasksClaimed;

  if (stats.tasksClaimed < 3) {
    return { label: "Getting started", style: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" };
  }
  if (completionRate >= 0.95 && stats.lateReleases <= 1) {
    return { label: "Rock solid", style: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" };
  }
  return { label: "Reliable helper", style: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" };
}
