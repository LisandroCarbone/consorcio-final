import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, revokeSessionFromToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  await revokeSessionFromToken(sessionCookie);

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
  await revokeSessionFromToken(sessionCookie);

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
