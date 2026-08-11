import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiting map for security throttling (max 30 requests per minute per IP)
const ipRateMap = new Map<string, { count: number; expiresAt: number }>();

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Security Headers Enforcement
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Permissions-Policy',
    'camera=(self), geolocation=(self), microphone=()'
  );

  // Cache Control for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
  }

  // 2. API Throttling & Rate Limiting Security Gate
  if (request.nextUrl.pathname.startsWith('/api/analyze-crop')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    const record = ipRateMap.get(ip);

    if (record) {
      if (now > record.expiresAt) {
        ipRateMap.set(ip, { count: 1, expiresAt: now + windowMs });
      } else {
        record.count++;
        if (record.count > 30) {
          console.warn(`[Security Alert] Rate limit exceeded for IP: ${ip}`);
          return NextResponse.json(
            {
              success: false,
              error: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests. Please wait a minute before analyzing another image.',
            },
            { status: 429, headers: response.headers }
          );
        }
      }
    } else {
      ipRateMap.set(ip, { count: 1, expiresAt: now + windowMs });
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
