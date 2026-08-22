import Link from "next/link";
import { notFound } from "next/navigation";
import { volunteers } from "@/lib/mock-data";

const skillLabels: Record<string, string> = {
  "dog-walking": "Dog walking",
  "vet-transport": "Vet transport",
  "overnight-sitting": "Overnight sitting",
  "supply-runs": "Supply runs",
  training: "Training",
  photography: "Photography",
};

export default async function VolunteerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const volunteer = volunteers.find((v) => v.id === id);

  if (!volunteer) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <Link href="/volunteers" className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
        &larr; Back to volunteers
      </Link>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{volunteer.name}</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {volunteer.location.neighborhood}, {volunteer.location.city}, {volunteer.location.state}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium capitalize text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            Volunteer
          </span>
        </div>

        <p className="mt-4 text-zinc-700 dark:text-zinc-300">{volunteer.bio}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Phone</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">{volunteer.phone}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Email</dt>
            <dd className="truncate text-zinc-900 dark:text-zinc-100">{volunteer.email}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Travel radius</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">{volunteer.maxTravelMiles} miles</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Has vehicle</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">{volunteer.hasVehicle ? "Yes" : "No"}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-zinc-500 dark:text-zinc-400">Availability</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">{volunteer.availability.join(", ")}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Skills</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {volunteer.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
              >
                {skillLabels[skill] ?? skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
