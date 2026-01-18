import { Suspense } from 'react';
import { ComplaintList } from './complaint-list';
import { AdminPageHeader } from '@/components/layout/admin-page-header';

export default function AdminComplaintsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <AdminPageHeader
        title="Manage Complaints"
        description="View and respond to tenant complaints"
      />

      <Suspense fallback={<div>Loading complaints...</div>}>
        <ComplaintList />
      </Suspense>
    </div>
  );
}
