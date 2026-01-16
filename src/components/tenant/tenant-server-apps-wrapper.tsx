'use client';

import { useEffect, useState } from 'react';
import { ServerAppsGrid } from '@/components/tenant/server-apps-grid';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ServerApp } from '@/lib/server-apps';

interface TenantServerApp {
  id: string;
  appId: string;
  name: string;
  url: string;
  icon: string;
  description?: string;
  category: string;
  isActive: boolean;
}

export function TenantServerAppsWrapper() {
  const [customApps, setCustomApps] = useState<ServerApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomApps() {
      try {
        const response = await fetch('/api/tenant/info');
        if (response.ok) {
          const data = await response.json();

          // Transform tenant server apps to ServerApp format
          if (data.serverApps && Array.isArray(data.serverApps)) {
            const transformedApps: ServerApp[] = data.serverApps
              .filter((app: TenantServerApp) => app.isActive)
              .map((app: TenantServerApp) => ({
                id: app.appId,
                name: app.name,
                icon: app.icon,
                url: app.url,
                description: app.description || '',
                category: app.category as any,
              }));

            setCustomApps(transformedApps);
          }
        }
      } catch (error) {
        console.error('Error fetching custom server apps:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomApps();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading server apps...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <ServerAppsGrid customApps={customApps} />;
}
