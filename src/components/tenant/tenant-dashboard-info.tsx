'use client';

import { useEffect, useState } from 'react';
import { InfoCard } from '@/components/info/info-card';
import { Wifi, Shield, Phone, Key, Zap, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServerAppsGrid } from '@/components/tenant/server-apps-grid';

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

interface TenantInfo {
  roomNumber: string;
  entryDate: Date;
  buildingInfo: Record<string, { value: string; category: string; description?: string }>;
  roomInfo: Record<string, { value: string; category: string; description?: string }>;
  serverApps: TenantServerApp[];
}

export function TenantDashboardInfo() {
  const [info, setInfo] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInfo() {
      try {
        const response = await fetch('/api/tenant/info');
        if (response.ok) {
          const data = await response.json();
          setInfo(data);
        }
      } catch (error) {
        console.error('Error fetching tenant info:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchInfo();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            Loading information...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!info) {
    return null;
  }

  // Group building info by category
  const generalInfo = Object.entries(info.buildingInfo)
    .filter(([_, data]) => data.category === 'general')
    .map(([key, data]) => ({ key, value: data.value, description: data.description, category: data.category }));

  const securityInfo = Object.entries(info.buildingInfo)
    .filter(([_, data]) => data.category === 'security')
    .map(([key, data]) => ({ key, value: data.value, description: data.description, category: data.category }));

  const contactInfo = Object.entries(info.buildingInfo)
    .filter(([_, data]) => data.category === 'contact')
    .map(([key, data]) => ({ key, value: data.value, description: data.description, category: data.category }));

  // Group room info by category
  const accessInfo = Object.entries(info.roomInfo)
    .filter(([_, data]) => data.category === 'access')
    .map(([key, data]) => ({ key, value: data.value, description: data.description, category: data.category }));

  const utilitiesInfo = Object.entries(info.roomInfo)
    .filter(([_, data]) => data.category === 'utilities')
    .map(([key, data]) => ({ key, value: data.value, description: data.description, category: data.category }));

  const serverInfo = Object.entries(info.roomInfo)
    .filter(([_, data]) => data.category === 'server')
    .map(([key, data]) => ({ key, value: data.value, description: data.description, category: data.category }));

  return (
    <>
      {/* ROOM INFORMATION SECTION */}
      {(accessInfo.length > 0 || utilitiesInfo.length > 0 || serverInfo.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Room Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accessInfo.length > 0 && (
              <InfoCard
                title="Room Access"
                items={accessInfo}
                icon={<Key className="h-5 w-5 text-purple-600" />}
                sensitive
              />
            )}

            {utilitiesInfo.length > 0 && (
              <InfoCard
                title="Utilities"
                items={utilitiesInfo}
                icon={<Zap className="h-5 w-5 text-yellow-600" />}
                sensitive
              />
            )}

            {serverInfo.length > 0 && (
              <InfoCard
                title="Server Access"
                items={serverInfo}
                icon={<Server className="h-5 w-5 text-indigo-600" />}
                sensitive
              />
            )}

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">Room Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Room Number</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{info.roomNumber}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Entry Date</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(info.entryDate).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* BUILDING INFORMATION SECTION */}
      {(generalInfo.length > 0 || securityInfo.length > 0 || contactInfo.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Building Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generalInfo.length > 0 && (
              <InfoCard
                title="Building Information"
                items={generalInfo}
                icon={<Wifi className="h-5 w-5 text-blue-600" />}
              />
            )}

            {securityInfo.length > 0 && (
              <InfoCard
                title="Security & Access"
                items={securityInfo}
                icon={<Shield className="h-5 w-5 text-red-600" />}
                sensitive
              />
            )}

            {contactInfo.length > 0 && (
              <InfoCard
                title="Emergency Contacts"
                items={contactInfo}
                icon={<Phone className="h-5 w-5 text-green-600" />}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
