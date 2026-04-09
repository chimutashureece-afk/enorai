import { NextRequest } from "next/server";

export function isAuthorizedForDevDashboard(request: NextRequest) {
  const expectedToken = process.env.DEV_DASHBOARD_TOKEN?.trim();
  if (!expectedToken) {
    return true;
  }

  const requestToken =
    request.nextUrl.searchParams.get("token") ??
    request.headers.get("x-dev-dashboard-token") ??
    "";

  return requestToken === expectedToken;
}
