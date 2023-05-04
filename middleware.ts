import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/', '/verify/:path*'],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  if (!token) {
    // If not authenticated, redirect to sign-in page
    if (url.pathname !== '/sign-in') {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  } else {
    const { role } = token;

    if (url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/sign-up') || url.pathname.startsWith('/verify') || url.pathname === '/') {
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else if (role === 'organizer') {
        return NextResponse.redirect(new URL('/organizer', request.url));
      } else if (role === 'viewer') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  // If the user is logged in but tries to access /dashboard without a session, redirect to /sign-in
  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}
