import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            FosterPack
          </h1>
          <p className="mt-1 text-sm font-medium text-orange-600 dark:text-orange-400">
            Every foster has a pack.
          </p>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            One message from a foster caregiver becomes prioritized, assigned,
            trackable actions — walks, vet runs, medication, and backup care.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <Link
            href="/volunteer"
            className="rounded-full bg-orange-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-700"
          >
            Volunteer view
          </Link>
          <Link
            href="/foster"
            className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Foster parent view
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Admin view
          </Link>
        </div>
      </div>
    </div>
  );
}
