import Link from "next/link";
import { dogs, fosterParents, scheduledTasks, volunteers } from "@/lib/mock-data";

export default function AdminPage() {
  const openTasks = scheduledTasks.filter((task) => task.status === "open").length;

  const stats = [
    { label: "Volunteers", value: volunteers.length },
    { label: "Foster parents", value: fosterParents.length },
    { label: "Dogs in the program", value: dogs.length },
    { label: "Open tasks", value: openTasks },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Admin</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Oversight across volunteers, foster parents, and dogs in the program.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/admin/volunteers"
          className="flex-1 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
        >
          <p className="font-medium text-zinc-900 dark:text-zinc-50">Volunteers directory</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Browse and manage volunteer profiles.</p>
        </Link>
        <Link
          href="/admin/fosters"
          className="flex-1 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
        >
          <p className="font-medium text-zinc-900 dark:text-zinc-50">Foster parents directory</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Browse and manage foster parent profiles.</p>
        </Link>
      </div>
    </div>
  );
}
