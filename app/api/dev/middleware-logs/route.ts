import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedForDevDashboard } from "@/lib/dev-dashboard-auth";
import { listMiddlewareLogs } from "@/lib/middleware-monitor";

export async function GET(request: NextRequest) {
  if (!isAuthorizedForDevDashboard(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    logs: await listMiddlewareLogs()
  });
}
