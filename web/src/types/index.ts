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

// Modeled now for context and future persistence; no UI surfaces it yet.
export type DogSize = "small" | "medium" | "large" | "extra-large";
export type EnergyLevel = "low" | "moderate" | "high";

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
  temperament: string[];
  goodWith: {
    kids: boolean;
    dogs: boolean;
    cats: boolean;
  };
  feeding: FeedingSchedule;
  medical: MedicalNote[];
  quirks: string[];
  intakeDate: string;
}
