'use client';

import { useEffect, useState } from 'react';
import { RoomInfoDisplay } from './room-info-display';
import { BuildingInfoDisplay } from './building-info-display';
import { Card, CardContent } from '@/components/ui/card';

interface TenantInfo {
  roomNumber: string;
  entryDate: Date;
  buildingInfo: Record<string, { value: string; category: string; description?: string }>;
  roomInfo: Record<string, { value: string; category: string; description?: string }>;
}

export function TenantInfoWrapper() {
  const [info, setInfo] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInfo() {
      try {
        const response = await fetch('/api/tenant/info');
        if (!response.ok) {
          throw new Error('Failed to fetch information');
        }
        const data = await response.json();
        setInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load information');
      } finally {
        setLoading(false);
      }
    }

    fetchInfo();
  }, []);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <RoomInfoDisplay info={info} loading={loading} />
      <BuildingInfoDisplay info={info} loading={loading} />
    </>
  );
}
