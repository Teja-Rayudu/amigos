import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl.clone();
  // Support both HTTP and HTTPS session cookies
  const session = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token');

  // 1. Homepage logic
  if (url.pathname === '/') {
    if (session) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 2. Protected Routes logic
  if (!session) {
    // Redirect unauthenticated users to login
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { 
  matcher: [
    "/",
    "/dashboard/:path*",
    "/feed/:path*",
    "/create-post/:path*",
    "/friends/:path*",
    "/deep-shield/:path*",
    "/account/:path*"
  ]
};