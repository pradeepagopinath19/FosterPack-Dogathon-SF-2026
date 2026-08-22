import Link from "next/link";
import ProfileCard from "@/components/ProfileCard";
import { volunteers } from "@/lib/mock-data";

export default function VolunteersPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Volunteers</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            People ready to help with walks, vet runs, and supplies.
          </p>
        </div>
        <Link
          href="/fosters"
          className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
        >
          View fosters &rarr;
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {volunteers.map((volunteer) => (
          <ProfileCard key={volunteer.id} profile={volunteer} />
        ))}
      </div>
    </div>
  );
}
