import { NextResponse } from "next/server";
import { resetSimulationState } from "@/lib/storage";

export async function POST() {
  const state = await resetSimulationState();
  return NextResponse.json(state);
}
