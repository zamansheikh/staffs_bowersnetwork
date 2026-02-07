import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/signin'];

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.includes(pathname);

    // Get the access token from cookies or headers
    const token = request.cookies.get('access_token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    // If it's signin page and user is authenticated, redirect to dashboard
    if (pathname === '/signin' && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If it's a protected route and user is not authenticated, redirect to signin
    if (!isPublicRoute && !token) {
        const isDirectAccess = !request.headers.get('referer');
        if (isDirectAccess) {
            return NextResponse.redirect(new URL('/signin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
