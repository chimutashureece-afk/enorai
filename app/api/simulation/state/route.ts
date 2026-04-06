import { NextResponse } from "next/server";
import { loadSimulationState } from "@/lib/storage";

export async function GET() {
  const state = await loadSimulationState();
  return NextResponse.json(state);
}
