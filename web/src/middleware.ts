import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only handle /api requests, except specific system paths if any
    if (pathname.startsWith('/api')) {
        // Get the internal API URL from environment (Runtime)
        // In Docker, this will be http://ranking_api:3333
        // In local dev, it falls back to http://127.0.0.1:3333
        const apiUrl = process.env.API_INTERNAL_URL || 'http://127.0.0.1:3333';

        // Construct the target URL
        // request.nextUrl.pathname includes /api/...
        // apiUrl includes http://host:port
        const targetUrl = `${apiUrl}${pathname}${request.nextUrl.search}`;

        console.log(`[Middleware] Proxying ${pathname} to ${targetUrl}`);

        // Rewrite the request to the backend
        return NextResponse.rewrite(new URL(targetUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
