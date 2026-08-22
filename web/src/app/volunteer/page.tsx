import { getDogs, getScheduledTasks, getVolunteers } from "@/lib/db";
import { formatMemberSince, reliabilityBadge } from "@/lib/labels";
import VolunteerCalendar from "@/components/VolunteerCalendar";
import AvailabilityEditor from "@/components/AvailabilityEditor";
import TaskCard from "@/components/TaskCard";

// No auth yet — standing in as "the logged-in volunteer" until sign-in exists.
const CURRENT_VOLUNTEER_ID = "v1";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function VolunteerHomePage() {
  const [volunteers, dogs, scheduledTasks] = await Promise.all([getVolunteers(), getDogs(), getScheduledTasks()]);
  const volunteer = volunteers.find((v) => v.id === CURRENT_VOLUNTEER_ID)!;
  const myTasks = scheduledTasks.filter((task) => task.assignedVolunteerId === volunteer.id);
  const openTasks = scheduledTasks.filter((task) => task.status === "open");
  const badge = reliabilityBadge(volunteer.reliability);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-lg font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
          {initials(volunteer.name)}
        </div>
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Welcome back,</p>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">{volunteer.name}</h1>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 dark:border-orange-900 dark:from-orange-950/40 dark:to-amber-950/10">
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700 dark:text-orange-300">
            Reliability
          </p>
          <h2 className="mt-1 text-lg font-bold text-zinc-950 dark:text-white">{badge.label}</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Thanks for showing up for the dogs who need you.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white/70 py-3 dark:bg-black/20">
              <p className="text-xl font-bold text-zinc-950 dark:text-white">{volunteer.reliability.tasksCompleted}</p>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Tasks completed</p>
            </div>
            <div className="rounded-xl bg-white/70 py-3 dark:bg-black/20">
              <p className="text-xl font-bold text-zinc-950 dark:text-white">{volunteer.reliability.tasksClaimed}</p>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Tasks claimed</p>
            </div>
            <div className="rounded-xl bg-white/70 py-3 dark:bg-black/20">
              <p className="text-sm font-bold text-zinc-950 dark:text-white sm:text-base">
                {formatMemberSince(volunteer.reliability.memberSince)}
              </p>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Volunteering since</p>
            </div>
          </div>
        </div>
      </section>

      <AvailabilityEditor volunteer={volunteer} />

      <section>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Your schedule</h2>
        <div className="mt-2">
          <VolunteerCalendar tasks={myTasks} dogs={dogs} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Your tasks</h2>
        <div className="mt-2 flex flex-col gap-3">
          {myTasks.length === 0 && (
            <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              Nothing assigned to you right now.
            </p>
          )}
          {myTasks.map((task) => (
            <TaskCard key={task.id} task={task} dog={dogs.find((d) => d.id === task.dogId)} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Open tasks near you</h2>
        <div className="mt-2 flex flex-col gap-3">
          {openTasks.map((task) => (
            <TaskCard key={task.id} task={task} dog={dogs.find((d) => d.id === task.dogId)} />
          ))}
        </div>
      </section>
    </div>
  );
}
