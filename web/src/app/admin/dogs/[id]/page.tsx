import Link from "next/link";
import { notFound } from "next/navigation";
import DogProfilePanel from "@/components/DogProfilePanel";
import { dogStatusLabels, dogStatusStyles, formatDateTime, taskStatusLabels, taskTypeLabels } from "@/lib/labels";
import { dogs, fosterParents, scheduledTasks, volunteers } from "@/lib/mock-data";

export default async function DogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dog = dogs.find((candidate) => candidate.id === id);

  if (!dog) {
    notFound();
  }

  const foster = fosterParents.find((candidate) => candidate.id === dog.fosterParentId);
  const tasks = scheduledTasks
    .filter((task) => task.dogId === dog.id)
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));

  const goodWith = Object.entries(dog.goodWith)
    .filter(([, value]) => value)
    .map(([key]) => key);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <Link
        href="/admin/dogs"
        className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        &larr; Back to dogs
      </Link>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{dog.name}</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {dog.breed} &middot; {dog.age} yrs &middot; {dog.size} &middot; {dog.energyLevel} energy
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${dogStatusStyles[dog.status]}`}
          >
            {dogStatusLabels[dog.status]}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Foster home</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">
              {foster ? (
                <Link
                  href={`/admin/fosters/${foster.id}`}
                  className="text-orange-600 hover:text-orange-700 dark:text-orange-400"
                >
                  {foster.name}
                </Link>
              ) : (
                <span className="text-red-600 dark:text-red-400">Unassigned</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Intake date</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">{dog.intakeDate}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Good with</dt>
            <dd className="capitalize text-zinc-900 dark:text-zinc-100">
              {goodWith.length > 0 ? goodWith.join(", ") : "Not established"}
            </dd>
          </div>
        </dl>
      </div>

      <DogProfilePanel dog={dog} />

      <section>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Medical</h2>
        <div className="mt-2 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          {dog.medical.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No recorded conditions.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {dog.medical.map((note) => (
                <li key={note.condition} className="text-sm text-zinc-900 dark:text-zinc-100">
                  <span className="font-medium">{note.condition}</span>
                  {note.medication ? ` — ${note.medication}` : ""}: {note.instructions}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-5 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Feeding</p>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
            {dog.feeding.foodBrand} &middot; {dog.feeding.timesPerDay}&times; daily &middot;{" "}
            {dog.feeding.amountPerMeal}
          </p>
          {dog.feeding.allergies.length > 0 && (
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">
              Allergies: {dog.feeding.allergies.join(", ")}
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Care schedule</h2>
        <div className="mt-2 flex flex-col gap-3">
          {tasks.length === 0 && (
            <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              Nothing scheduled.
            </p>
          )}
          {tasks.map((task) => {
            const volunteer = volunteers.find((candidate) => candidate.id === task.assignedVolunteerId);
            return (
              <div
                key={task.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between gap-3">
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
      </section>
    </div>
  );
}
