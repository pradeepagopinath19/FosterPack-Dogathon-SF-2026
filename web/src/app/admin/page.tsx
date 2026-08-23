import Link from "next/link";
import OpsExceptionBoard from "@/components/OpsExceptionBoard";
import { dogs, fosterParents, scheduledTasks, volunteers } from "@/lib/mock-data";

const directories = [
  {
    href: "/admin/dogs",
    title: "Dogs",
    description: "Profiles, journals, and traits proposed from foster observations.",
  },
  {
    href: "/admin/fosters",
    title: "Foster parents",
    description: "Browse and manage foster parent profiles.",
  },
  {
    href: "/admin/volunteers",
    title: "Volunteers",
    description: "Browse and manage volunteer profiles.",
  },
];

export default function AdminPage() {
  const openTasks = scheduledTasks.filter((task) => task.status === "open").length;

  const stats = [
    { label: "Dogs in the program", value: dogs.length },
    { label: "Foster parents", value: fosterParents.length },
    { label: "Volunteers", value: volunteers.length },
    { label: "Open tasks", value: openTasks },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Operations</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Exceptions first — what needs a person today, not everything that is fine.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Needs attention</h2>
        <div className="mt-2">
          <OpsExceptionBoard dogs={dogs} fosters={fosterParents} tasks={scheduledTasks} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">At a glance</h2>
        <div className="mt-2 grid grid-cols-2 gap-3">
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
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Directories</h2>
        <div className="mt-2 flex flex-col gap-3">
          {directories.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="flex-1 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
            >
              <p className="font-medium text-zinc-900 dark:text-zinc-50">{entry.title}</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{entry.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
