import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { SERVER_APPS } from '@/lib/server-apps';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.tenantId) {
      return NextResponse.json({ error: 'Tenant profile not found' }, { status: 404 });
    }

    // Fetch tenant's custom server apps
    const tenantServerApps = await prisma.tenantServerApp.findMany({
      where: {
        tenantId: session.tenantId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    // Use custom apps if available, otherwise fall back to defaults
    const appsToCheck = tenantServerApps.length > 0
      ? tenantServerApps.map((app) => ({
          id: app.appId,
          url: app.url,
        }))
      : SERVER_APPS;

    // Check health of all server apps
    const healthChecks = await Promise.allSettled(
      appsToCheck.map(async (app) => {
        const startTime = Date.now();

        try {
          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

          const response = await fetch(app.url, {
            method: 'HEAD',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const latency = Date.now() - startTime;

          return {
            id: app.id,
            status: response.ok ? 'online' : 'offline',
            latency,
          };
        } catch (error) {
          return {
            id: app.id,
            status: 'offline',
            latency: null,
          };
        }
      })
    );

    const results = healthChecks.map((result) =>
      result.status === 'fulfilled' ? result.value : { status: 'error' }
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
