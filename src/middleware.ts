import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSameOriginMutation } from "@/lib/security/csrf";

/**
 * Global Edge Middleware
 * 1. Enforces strict Same-Origin CSRF validation across all Administrative & Mutation API routes
 * 2. Blocks cross-site unauthorized state-changing requests
 */
export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Protect administrative mutation endpoints against Cross-Site Request Forgery (CSRF)
  if (pathname.startsWith("/api/admin")) {
    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method.toUpperCase());
    if (isMutation && !isSameOriginMutation(req)) {
      return NextResponse.json(
        {
          success: false,
          error: "CSRF validation failed: Cross-origin administrative mutations are forbidden.",
          code: "CSRF_FORBIDDEN",
        },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/admin/:path*",
  ],
};
