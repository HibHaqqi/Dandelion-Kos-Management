import { Suspense } from 'react';
import { ComplaintList } from './complaint-list';

export default function AdminComplaintsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Manage Complaints
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View and respond to tenant complaints
        </p>
      </div>

      <Suspense fallback={<div>Loading complaints...</div>}>
        <ComplaintList />
      </Suspense>
    </div>
  );
}
