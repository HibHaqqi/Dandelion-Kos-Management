import { Suspense } from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoManagement } from '@/components/admin/info-management';
import { TenantServerAppsManagement } from '@/components/admin/tenant-server-apps-management';
import { AdminPageHeader } from '@/components/layout/admin-page-header';

export default async function AdminInfoPage() {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <AdminPageHeader
        title="Building & Room Information"
        description="Manage building-wide, room-specific, and tenant server app information"
      />

      <Tabs defaultValue="building" className="space-y-4">
        <TabsList>
          <TabsTrigger value="building">Building & Room Info</TabsTrigger>
          <TabsTrigger value="server-apps">Tenant Server Apps</TabsTrigger>
        </TabsList>

        <TabsContent value="building">
          <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
            <InfoManagement />
          </Suspense>
        </TabsContent>

        <TabsContent value="server-apps">
          <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
            <TenantServerAppsManagement />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
