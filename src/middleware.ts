import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/session';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const isLoggedIn = !!session;

  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Skip URL rewriting for now - route groups handle the routing
  // Just add authentication headers and continue

  // Route categories
  const isApiRoute = pathname.startsWith('/api');
  const isTenantRegisterApi =
    pathname === '/api/tenant/register' ||
    pathname === '/api/tenant/register-auto'; // Allow auto-registration too
  const isAuthApi = pathname.startsWith('/api/auth'); // Public auth API routes
  const isLoginPage = pathname === '/login';
  const isRegisterPage = pathname === '/register';
  const isTenantRegisterPage = pathname === '/tenant/register';
  const isTenantRoute = pathname.startsWith('/tenant');
  const isAdminRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/customers') ||
    pathname.startsWith('/transactions') ||
    pathname.startsWith('/rooms') ||
    pathname.startsWith('/categories');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-pathname', request.nextUrl.pathname);

  // Add user info to headers
  if (session?.userId) {
    requestHeaders.set('x-user-id', session.userId);
    requestHeaders.set('x-user-role', session.role);
    if (session.customerId) {
      requestHeaders.set('x-customer-id', session.customerId);
    }
    if (session.tenantId) {
      requestHeaders.set('x-tenant-id', session.tenantId);
    }
  }

  // API Routes
  if (isApiRoute) {
    // Public API routes (no authentication required)
    if (isTenantRegisterApi || isAuthApi) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    const apiKey = request.headers.get('x-api-key');
    // API key bypass for webhooks
    if (apiKey && apiKey === process.env.API_KEY) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    if (!isLoggedIn) {
      return new NextResponse('Authentication required', { status: 401 });
    }

    // Role-based API access
    if (isAdminRoute && session?.role !== 'ADMIN') {
      return new NextResponse('Forbidden: Admin access required', { status: 403 });
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Public routes (landing page, login, register)
  const isLandingPage = pathname === '/';
  if (isLandingPage || isLoginPage || isRegisterPage || isTenantRegisterPage) {
    if (isLoggedIn) {
      // Redirect based on role
      if (session.role === 'TENANT') {
        return NextResponse.redirect(new URL('/tenant/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/home', request.url));
      }
    }
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Protected routes - require authentication
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based route protection
  if (isTenantRoute && session.role !== 'TENANT') {
    // Admin cannot access tenant routes
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isAdminRoute && session.role !== 'ADMIN') {
    // Tenant cannot access admin routes
    return NextResponse.redirect(new URL('/tenant/dashboard', request.url));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
