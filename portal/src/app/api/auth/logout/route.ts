import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, revokeSessionFromToken, verifySessionToken } from "@/lib/auth";
import { logAuditDirect } from "@/lib/audit";

function auditLogout(req: NextRequest, username: string | undefined) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  logAuditDirect(username ?? "unknown", ip, "logout", "auth", null, {});
}

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { username } = await verifySessionToken(sessionCookie);
  await revokeSessionFromToken(sessionCookie);
  auditLogout(req, username);

  const response = NextResponse.json({ success: true, message: "Sesión cerrada correctamente" });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { username } = await verifySessionToken(sessionCookie);
  await revokeSessionFromToken(sessionCookie);
  auditLogout(req, username);

  const loginUrl = new URL("/login", req.url);
  const response = NextResponse.redirect(loginUrl);

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
