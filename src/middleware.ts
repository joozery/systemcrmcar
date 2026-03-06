import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value;
    const { pathname } = request.nextUrl;

    // 1. Allow access to login, public assets, and api/auth
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/api/auth') ||
        pathname.includes('.') // for images, icons, etc.
    ) {
        // If user is already logged in and tries to go to /login, redirect to /
        if (pathname.startsWith('/login') && session) {
            try {
                await decrypt(session);
                return NextResponse.redirect(new URL('/', request.url));
            } catch (e) {
                // If token invalid, allow login
            }
        }
        return NextResponse.next();
    }

    // 2. Protect all other routes
    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        await decrypt(session);
        return NextResponse.next();
    } catch (error) {
        // Token invalid or expired
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
