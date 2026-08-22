import Link from "next/link";
import { notFound } from "next/navigation";
import { dogs, fosterParents } from "@/lib/mock-data";

export default async function FosterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const foster = fosterParents.find((f) => f.id === id);

  if (!foster) {
    notFound();
  }

  const activeDogs = dogs.filter((dog) => foster.activeDogIds.includes(dog.id));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <Link href="/admin/fosters" className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
        &larr; Back to foster parents
      </Link>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{foster.name}</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {foster.location.neighborhood}, {foster.location.city}, {foster.location.state}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium capitalize text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            Foster
          </span>
        </div>

        <p className="mt-4 text-zinc-700 dark:text-zinc-300">{foster.bio}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Phone</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">{foster.phone}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Email</dt>
            <dd className="truncate text-zinc-900 dark:text-zinc-100">{foster.email}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Years fostering</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">{foster.yearsFostering}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Household notes</p>
          <p className="mt-1 text-zinc-900 dark:text-zinc-100">{foster.householdNotes}</p>
        </div>

        {activeDogs.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Currently fostering</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {activeDogs.map((dog) => (
                <span
                  key={dog.id}
                  className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                >
                  {dog.name} &middot; {dog.breed}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
