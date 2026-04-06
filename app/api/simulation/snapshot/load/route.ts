import { NextRequest, NextResponse } from "next/server";
import { listSnapshots, loadSnapshot } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "Snapshot name is required." }, { status: 400 });
  }

  const state = await loadSnapshot(body.name);
  const snapshots = await listSnapshots();
  return NextResponse.json({ state, snapshots });
}

export async function GET() {
  const snapshots = await listSnapshots();
  return NextResponse.json({ snapshots });
}
