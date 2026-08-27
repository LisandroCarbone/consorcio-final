import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, images, and internal Next.js paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webp") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. Allow n8n webhook for SUTERH escalas if x-api-key header is present
  if (pathname === "/api/sueldos/escalas" && request.headers.has("x-api-key")) {
    return NextResponse.next();
  }

  // 3. Read and verify session cookie
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { valid } = await verifySessionToken(sessionCookie);

  // 4. If visiting /login:
  if (pathname === "/login") {
    // If already logged in, redirect to home dashboard
    if (valid) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Allow accessing login page
    return addSecurityHeaders(NextResponse.next());
  }

  // 5. If not authenticated and trying to access protected routes:
  if (!valid) {
    // For API routes, return 401 Unauthorized JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autenticado. Por favor inicie sesión." }, { status: 401 });
    }
    // For web pages, redirect to /login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 6. User is authenticated, proceed with security headers
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
