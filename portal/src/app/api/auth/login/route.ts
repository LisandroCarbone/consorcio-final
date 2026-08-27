import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  checkRateLimit,
  clearFailedAttempts,
  createSessionToken,
  recordFailedAttempt,
  validateCredentials,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    
    // 1. Check rate limit
    const rateCheck = await checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Demasiados intentos fallidos. Por seguridad, la cuenta está bloqueada temporalmente. Intente nuevamente en ${rateCheck.waitMinutes} minutos.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json(
        { error: "Por favor ingrese usuario y contraseña." },
        { status: 400 }
      );
    }

    // 2. Validate credentials
    const isValid = validateCredentials(username.trim(), password);

    if (!isValid) {
      const lockResult = await recordFailedAttempt(ip);
      if (lockResult.locked) {
        return NextResponse.json(
          {
            error: "Demasiados intentos fallidos. Acceso bloqueado por 15 minutos.",
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos." },
        { status: 401 }
      );
    }

    // 3. Clear failed attempts on success
    await clearFailedAttempts(ip);

    // 4. Create signed session token (30 days validity)
    const token = await createSessionToken(username.trim(), 30);

    // 5. Build response and set secure HttpOnly cookie
    const response = NextResponse.json({ success: true, user: username.trim() });
    
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: "Ocurrió un error inesperado al procesar el inicio de sesión." },
      { status: 500 }
    );
  }
}
