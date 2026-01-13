'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SERVER_APPS, ServerApp } from '@/lib/server-apps';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export function ServerAppsGrid() {
  const [appStatus, setAppStatus] = useState<Record<string, 'online' | 'offline' | 'checking'>>({});
  const [latency, setLatency] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initial health check
    checkHealth();

    // Refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  async function checkHealth() {
    setAppStatus((prev) =>
      Object.fromEntries(SERVER_APPS.map((app) => [app.id, 'checking']))
    );

    try {
      const response = await fetch('/tenant/dashboard/apps/health-check');
      const data = await response.json();

      if (data.results) {
        const newStatus: Record<string, 'online' | 'offline'> = {};
        const newLatency: Record<string, number> = {};

        data.results.forEach((result: any) => {
          newStatus[result.id] = result.status;
          if (result.latency) {
            newLatency[result.id] = result.latency;
          }
        });

        setAppStatus(newStatus);
        setLatency(newLatency);
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setAppStatus((prev) =>
        Object.fromEntries(Object.keys(prev).map((key) => [key, 'offline']))
      );
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {SERVER_APPS.map((app) => (
        <ServerAppCard
          key={app.id}
          app={app}
          status={appStatus[app.id] || 'checking'}
          latency={latency[app.id]}
        />
      ))}
    </div>
  );
}

interface ServerAppCardProps {
  app: ServerApp;
  status: 'online' | 'offline' | 'checking';
  latency?: number;
}

function ServerAppCard({ app, status, latency }: ServerAppCardProps) {
  const isOnline = status === 'online';

  return (
    <a
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        block transition-all duration-200
        ${isOnline
          ? 'hover:scale-105 hover:shadow-lg cursor-pointer'
          : 'opacity-60 cursor-not-allowed'
        }
      `}
      onClick={(e) => {
        if (!isOnline) {
          e.preventDefault();
        }
      }}
    >
      <Card
        className={`
          h-full
          ${isOnline
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }
        `}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <span className="text-4xl">{app.icon}</span>
            <StatusIndicator status={status} latency={latency} />
          </div>

          <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">
            {app.name}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {app.description}
          </p>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-500 font-mono truncate">
              {app.url}
            </p>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'checking';
  latency?: number;
}

function StatusIndicator({ status, latency }: StatusIndicatorProps) {
  if (status === 'checking') {
    return (
      <div className="flex items-center gap-1 text-yellow-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-xs font-medium">Checking...</span>
      </div>
    );
  }

  if (status === 'online') {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-xs font-medium">
          Online {latency && `(${latency}ms)`}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-red-600">
      <XCircle className="h-4 w-4" />
      <span className="text-xs font-medium">Offline</span>
    </div>
  );
}
