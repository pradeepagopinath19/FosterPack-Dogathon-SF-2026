import { dogs, fosterParents, scheduledTasks, volunteers } from "@/lib/mock-data";
import { dogStatusLabels, dogStatusStyles, formatDateTime, taskStatusLabels, taskTypeLabels } from "@/lib/labels";
import BehaviorJournal from "@/components/BehaviorJournal";
import EmergencyConcern from "@/components/EmergencyConcern";
import Image from "next/image";

// No auth yet — standing in as "the logged-in foster parent" until sign-in exists.
const CURRENT_FOSTER_ID = "f1";

export default function FosterHomePage() {
  const foster = fosterParents.find((f) => f.id === CURRENT_FOSTER_ID)!;
  const myDogs = dogs.filter((dog) => foster.activeDogIds.includes(dog.id));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Welcome back,</p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{foster.name}</h1>
      </div>

      {myDogs.map((dog) => {
        const tasks = scheduledTasks
          .filter((task) => task.dogId === dog.id)
          .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));

        return (
          <div
            key={dog.id}
            className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-4">
                {dog.photoUrl && (
                  <Image
                    src={dog.photoUrl}
                    alt={`${dog.name}, a ${dog.breed}`}
                    width={88}
                    height={88}
                    priority
                    className="size-20 shrink-0 rounded-2xl border-2 border-white object-cover shadow-md ring-1 ring-zinc-200 dark:border-zinc-800 dark:ring-zinc-700 sm:size-24"
                  />
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-300">Your foster dog</p>
                  <h2 className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">{dog.name}</h2>
                  <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    {dog.breed} &middot; {dog.age} years old &middot; {dog.energyLevel} energy
                  </p>
                </div>
              </div>
              <div className="flex w-full flex-row items-center justify-between gap-2 sm:w-auto sm:flex-col sm:items-end">
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${dogStatusStyles[dog.status]}`}>
                  {dogStatusLabels[dog.status]}
                </span>
                <EmergencyConcern dogName={dog.name} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {dog.temperament.map((trait) => (
                <span
                  key={trait}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {trait}
                </span>
              ))}
            </div>

            {dog.medical.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Medical</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {dog.medical.map((note) => (
                    <li key={note.condition} className="text-sm text-zinc-900 dark:text-zinc-100">
                      {note.condition}
                      {note.medication ? ` — ${note.medication}` : ""}: {note.instructions}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <BehaviorJournal
              dogId={dog.id}
              dogName={dog.name}
              temperament={dog.temperament}
              initialObservations={dog.behaviorObservations}
            />

            <div className="mt-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Care schedule</p>
              <div className="mt-2 flex flex-col gap-3">
                {tasks.length === 0 && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Nothing scheduled.</p>
                )}
                {tasks.map((task) => {
                  const volunteer = volunteers.find((v) => v.id === task.assignedVolunteerId);
                  return (
                    <div key={task.id} className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">{taskTypeLabels[task.type]}</p>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {formatDateTime(task.scheduledFor)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{task.notes}</p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {taskStatusLabels[task.status]}
                        {volunteer ? ` — ${volunteer.name}` : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
