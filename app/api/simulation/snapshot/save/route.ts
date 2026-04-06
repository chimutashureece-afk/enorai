import { NextRequest, NextResponse } from "next/server";
import { listSnapshots, saveSnapshot } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const filename = await saveSnapshot(body.name);
  const snapshots = await listSnapshots();
  return NextResponse.json({ filename, snapshots });
}
