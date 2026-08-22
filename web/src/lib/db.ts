import fs from "node:fs/promises";
import path from "node:path";
import type { DogProfile, ScheduledTask, Volunteer } from "@/types";
import { dogs as seedDogs, scheduledTasks as seedScheduledTasks, volunteers as seedVolunteers } from "@/lib/mock-data";

// Demo-only persistence for the volunteer experience: a JSON file standing
// in for a database. Survives reloads and dev-server restarts; auto-reseeds
// from mock-data.ts on first run. Not for production use — no concurrency
// control, no real DB guarantees. Scoped to volunteer data only — foster and
// admin still read directly from mock-data.ts while those areas are in
// progress on their own branches.
interface Database {
  volunteers: Volunteer[];
  dogs: DogProfile[];
  scheduledTasks: ScheduledTask[];
}

const DB_PATH = path.join(process.cwd(), "data", "db.json");

async function readDb(): Promise<Database> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw) as Database;
  } catch {
    const seed: Database = {
      volunteers: seedVolunteers,
      dogs: seedDogs,
      scheduledTasks: seedScheduledTasks,
    };
    await writeDb(seed);
    return seed;
  }
}

async function writeDb(db: Database): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

export async function getVolunteers(): Promise<Volunteer[]> {
  return (await readDb()).volunteers;
}

export async function getVolunteer(id: string): Promise<Volunteer | undefined> {
  return (await readDb()).volunteers.find((v) => v.id === id);
}

export async function getDogs(): Promise<DogProfile[]> {
  return (await readDb()).dogs;
}

export async function getScheduledTasks(): Promise<ScheduledTask[]> {
  return (await readDb()).scheduledTasks;
}

export interface AvailabilityUpdate {
  availability: string[];
  availabilityExceptions: Volunteer["availabilityExceptions"];
  skills: Volunteer["skills"];
  maxTravelMiles: number;
  hasVehicle: boolean;
}

export async function updateVolunteerAvailability(id: string, update: AvailabilityUpdate): Promise<Volunteer> {
  const db = await readDb();
  const index = db.volunteers.findIndex((v) => v.id === id);
  if (index === -1) throw new Error(`Volunteer ${id} not found`);
  db.volunteers[index] = { ...db.volunteers[index], ...update };
  await writeDb(db);
  return db.volunteers[index];
}
