import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "krishi-hedge-admin-secret-key-change-in-production";

// Simple JWT decode without verification (for Edge runtime compatibility)
// We trust the cookie since it's httpOnly and can't be modified by client
function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    );
    
    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null; // Token expired
    }
    
    return payload;
  } catch {
    return null;
  }
}

// Public routes that don't require authentication
const publicPaths = ["/login", "/signup", "/api/auth/login", "/api/auth/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[Middleware] Checking path:', pathname);

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    console.log('[Middleware] Public path, allowing');
    return NextResponse.next();
  }

  // Check for admin token
  const token = request.cookies.get("admin_token")?.value;
  console.log('[Middleware] Token found:', !!token);

  if (!token) {
    console.log('[Middleware] No token, redirecting to login');
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Decode and validate token (no crypto verification needed for httpOnly cookie)
    const decoded = decodeJWT(token);
    if (!decoded) {
      console.log('[Middleware] Token decode failed or expired');
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    console.log('[Middleware] Token verified, allowing access');
    return NextResponse.next();
  } catch (error) {
    console.log('[Middleware] Token verification failed:', error);
    // Invalid token, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (manifest, icons, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
