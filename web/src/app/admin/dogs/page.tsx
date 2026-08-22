import Link from "next/link";
import DogRosterList from "@/components/DogRosterList";
import { dogs, fosterParents } from "@/lib/mock-data";

export default function DogsPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dogs</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Every dog in the program, with live journal activity.
          </p>
        </div>
        <Link
          href="/admin"
          className="shrink-0 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
        >
          Operations &rarr;
        </Link>
      </div>

      <DogRosterList dogs={dogs} fosters={fosterParents} />
    </div>
  );
}
