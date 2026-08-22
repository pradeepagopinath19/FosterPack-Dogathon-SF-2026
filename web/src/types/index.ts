export type UserRole = "volunteer" | "foster";

export interface Location {
  neighborhood: string;
  city: string;
  state: string;
}

export interface BaseProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  location: Location;
  phone: string;
  email: string;
  bio: string;
}

export interface Volunteer extends BaseProfile {
  role: "volunteer";
  skills: VolunteerSkill[];
  availability: string[];
  maxTravelMiles: number;
  hasVehicle: boolean;
}

export type VolunteerSkill =
  | "dog-walking"
  | "vet-transport"
  | "overnight-sitting"
  | "supply-runs"
  | "training"
  | "photography";

export interface FosterParent extends BaseProfile {
  role: "foster";
  activeDogIds: string[];
  yearsFostering: number;
  householdNotes: string;
}

export type UserProfile = Volunteer | FosterParent;

export type DogSize = "small" | "medium" | "large" | "extra-large";
export type EnergyLevel = "low" | "moderate" | "high";

export type DogStatus =
  | "intake"
  | "in-care"
  | "needs-vet"
  | "available-for-adoption"
  | "adopted";

export interface MedicalNote {
  condition: string;
  medication?: string;
  instructions: string;
}

export interface FeedingSchedule {
  foodBrand: string;
  timesPerDay: number;
  amountPerMeal: string;
  allergies: string[];
}

export interface DogProfile {
  id: string;
  name: string;
  fosterParentId: string;
  photoUrl?: string;
  breed: string;
  age: number;
  size: DogSize;
  energyLevel: EnergyLevel;
  status: DogStatus;
  temperament: string[];
  goodWith: {
    kids: boolean;
    dogs: boolean;
    cats: boolean;
  };
  feeding: FeedingSchedule;
  medical: MedicalNote[];
  quirks: string[];
  behaviorObservations: BehaviorObservation[];
  intakeDate: string;
}

export type BehaviorCategory = "temperament" | "routine" | "trigger" | "progress";
export type ConcernLevel = "routine" | "watch" | "urgent";

export interface BehaviorObservation {
  id: string;
  category: BehaviorCategory;
  behavior: string;
  context: string;
  observedAt: string;
  concernLevel: ConcernLevel;
  sharedWithShelter: boolean;
  media?: ObservationMedia[];
}

export interface ObservationMedia {
  id: string;
  type: "image" | "video";
  url: string;
  name: string;
}

// Scheduling/workflow layer: vet visits, walks, transport, medication, etc.
// tied to a dog and optionally assigned to a volunteer.
export type TaskType =
  | "vet-visit"
  | "medication"
  | "dog-walking"
  | "vet-transport"
  | "overnight-sitting"
  | "supply-runs";

export type TaskStatus = "open" | "assigned" | "completed" | "cancelled";

export interface ScheduledTask {
  id: string;
  dogId: string;
  type: TaskType;
  scheduledFor: string;
  status: TaskStatus;
  assignedVolunteerId?: string;
  notes: string;
}
