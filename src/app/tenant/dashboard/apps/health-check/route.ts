import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { SERVER_APPS } from '@/lib/server-apps';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check health of all server apps
    const healthChecks = await Promise.allSettled(
      SERVER_APPS.map(async (app) => {
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
