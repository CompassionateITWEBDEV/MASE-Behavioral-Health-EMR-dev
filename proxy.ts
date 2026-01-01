import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Proxy middleware placeholder.
 * 
 * Note: Session/authentication handling is currently disabled.
 * When authentication is required, uncomment the updateSession call.
 * All requests currently pass through without authentication.
 */
export async function proxy(request: NextRequest) {
  // TODO: Implement session-based authentication when ready
  // return await updateSession(request)

  // Allow all requests to pass through without authentication
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
