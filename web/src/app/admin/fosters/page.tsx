import Link from "next/link";
import ProfileCard from "@/components/ProfileCard";
import { fosterParents } from "@/lib/mock-data";

export default function FostersPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Foster parents</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            People currently caring for a foster dog.
          </p>
        </div>
        <Link
          href="/admin/volunteers"
          className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
        >
          View volunteers &rarr;
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {fosterParents.map((foster) => (
          <ProfileCard key={foster.id} profile={foster} />
        ))}
      </div>
    </div>
  );
}
