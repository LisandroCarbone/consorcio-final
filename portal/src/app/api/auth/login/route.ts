import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  checkRateLimit,
  clearFailedAttempts,
  createSessionToken,
  recordFailedAttempt,
  validateCredentials,
} from "@/lib/auth";
import { logAuditDirect } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

    const body = await req.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json(
        { error: "Por favor ingrese usuario y contraseña." },
        { status: 400 }
      );
    }

    const usernameKey = `user:${username.trim().toLowerCase()}`;

    // 1. Check rate limit by IP and username
    const ipCheck = await checkRateLimit(`ip:${ip}`);
    const userCheck = await checkRateLimit(usernameKey);
    if (!ipCheck.allowed || !userCheck.allowed) {
      const waitMinutes = ipCheck.waitMinutes || userCheck.waitMinutes;
      return NextResponse.json(
        {
          error: `Demasiados intentos fallidos. Por seguridad, la cuenta está bloqueada temporalmente. Intente nuevamente en ${waitMinutes} minutos.`,
        },
        { status: 429 }
      );
    }

    // 2. Validate credentials
    const isValid = await validateCredentials(username.trim(), password);

    if (!isValid) {
      const ipLock = await recordFailedAttempt(`ip:${ip}`);
      const userLock = await recordFailedAttempt(usernameKey);
      logAuditDirect(username.trim(), ip, "login_failed", "auth", null, {
        success: false,
        username: username.trim(),
      });
      if (ipLock.locked || userLock.locked) {
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
    await clearFailedAttempts(`ip:${ip}`);
    await clearFailedAttempts(usernameKey);

    // 4. Create signed session token (8h validity)
    const token = await createSessionToken(username.trim());
    logAuditDirect(username.trim(), ip, "login", "auth", null, {
      success: true,
      username: username.trim(),
    });

    // 5. Build response and set secure HttpOnly cookie
    const response = NextResponse.json({ success: true, user: username.trim() });
    
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: "Ocurrió un error inesperado al procesar el inicio de sesión." },
      { status: 500 }
    );
  }
}
