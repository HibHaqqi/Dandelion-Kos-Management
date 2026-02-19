'use client';

import { InfoCard } from '@/components/info/info-card';
import { Wifi, Shield, Phone } from 'lucide-react';

interface TenantInfo {
  buildingInfo: Record<string, { value: string; category: string; description?: string }>;
}

interface BuildingInfoDisplayProps {
  info: TenantInfo | null;
  loading: boolean;
}

export function BuildingInfoDisplay({ info, loading }: BuildingInfoDisplayProps) {
  if (loading || !info) {
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

  const hasBuildingInfo = generalInfo.length > 0 || securityInfo.length > 0 || contactInfo.length > 0;

  if (!hasBuildingInfo) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Building Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* General Building Info */}
        {generalInfo.length > 0 && (
          <InfoCard
            title="Building Information"
            items={generalInfo}
            icon={<Wifi className="h-5 w-5 text-blue-600" />}
          />
        )}

        {/* Security Info */}
        {securityInfo.length > 0 && (
          <InfoCard
            title="Security & Access"
            items={securityInfo}
            icon={<Shield className="h-5 w-5 text-red-600" />}
            sensitive
          />
        )}

        {/* Contact Info */}
        {contactInfo.length > 0 && (
          <InfoCard
            title="Emergency Contacts"
            items={contactInfo}
            icon={<Phone className="h-5 w-5 text-green-600" />}
          />
        )}
      </div>
    </div>
  );
}
