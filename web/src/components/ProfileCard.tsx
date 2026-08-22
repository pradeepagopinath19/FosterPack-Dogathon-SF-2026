import Link from "next/link";
import type { UserProfile } from "@/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfileCard({ profile }: { profile: UserProfile }) {
  const href = profile.role === "volunteer" ? `/volunteers/${profile.id}` : `/fosters/${profile.id}`;

  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
        {initials(profile.name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">{profile.name}</p>
        <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
          {profile.location.neighborhood}, {profile.location.city}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium capitalize text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        {profile.role}
      </span>
    </Link>
  );
}
