import { NextResponse } from "next/server";
import { updateVolunteerAvailability, type AvailabilityUpdate } from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as AvailabilityUpdate;

  try {
    const volunteer = await updateVolunteerAvailability(id, body);
    return NextResponse.json(volunteer);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}
