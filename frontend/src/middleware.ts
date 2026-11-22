import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/links", "/campaigns", "/traffic", "/analytics", "/settings"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const authHeader = req.headers.get("authorization");
    const cookieToken = req.cookies.get("sb-access-token")?.value;
    const hasToken = Boolean(authHeader || cookieToken);

    // In development mode, allow browser access with default session
    if (!hasToken && process.env.NODE_ENV === "production") {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/links/:path*", "/campaigns/:path*", "/traffic/:path*", "/analytics/:path*", "/settings/:path*"],
};
