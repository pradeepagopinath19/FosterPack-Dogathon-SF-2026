import { dogs, scheduledTasks, volunteers } from "@/lib/mock-data";
import { formatDateTime, skillLabels, taskTypeLabels } from "@/lib/labels";

// No auth yet — standing in as "the logged-in volunteer" until sign-in exists.
const CURRENT_VOLUNTEER_ID = "v1";

export default function VolunteerHomePage() {
  const volunteer = volunteers.find((v) => v.id === CURRENT_VOLUNTEER_ID)!;
  const myTasks = scheduledTasks.filter((task) => task.assignedVolunteerId === volunteer.id);
  const openTasks = scheduledTasks.filter((task) => task.status === "open");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Welcome back,</p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{volunteer.name}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          {volunteer.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
            >
              {skillLabels[skill]}
            </span>
          ))}
        </div>
      </div>

      <section>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Your tasks</h2>
        <div className="mt-2 flex flex-col gap-3">
          {myTasks.length === 0 && (
            <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              Nothing assigned to you right now.
            </p>
          )}
          {myTasks.map((task) => {
            const dog = dogs.find((d) => d.id === task.dogId);
            return (
              <div
                key={task.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {taskTypeLabels[task.type]} &middot; {dog?.name}
                  </p>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{formatDateTime(task.scheduledFor)}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{task.notes}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Open tasks near you</h2>
        <div className="mt-2 flex flex-col gap-3">
          {openTasks.map((task) => {
            const dog = dogs.find((d) => d.id === task.dogId);
            return (
              <div
                key={task.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {taskTypeLabels[task.type]} &middot; {dog?.name}
                  </p>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{formatDateTime(task.scheduledFor)}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{task.notes}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
