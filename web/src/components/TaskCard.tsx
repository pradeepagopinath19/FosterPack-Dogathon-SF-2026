import type { DogProfile, ScheduledTask } from "@/types";
import { formatDateTime, taskTypeIcon, taskTypeLabels } from "@/lib/labels";

export default function TaskCard({ task, dog }: { task: ScheduledTask; dog?: DogProfile }) {
  return (
    <div className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-lg dark:bg-orange-900/30">
        <span aria-hidden>{taskTypeIcon[task.type]}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-zinc-900 dark:text-zinc-50">
            {taskTypeLabels[task.type]}
            {dog && <> &middot; {dog.name}</>}
          </p>
          <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">{formatDateTime(task.scheduledFor)}</span>
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{task.notes}</p>
      </div>
    </div>
  );
}
