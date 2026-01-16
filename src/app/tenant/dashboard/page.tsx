import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { PaymentHistoryCard } from '@/components/tenant/payment-history-card';
import { TenantServerAppsWrapper } from '@/components/tenant/tenant-server-apps-wrapper';
import { QuickActions } from '@/components/tenant/quick-actions';
import { TenantDashboardInfo } from '@/components/tenant/tenant-dashboard-info';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function TenantDashboard() {
  const session = await getSession();

  if (!session || session.role !== 'TENANT') {
    redirect('/login');
  }

  if (!session.customerId) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
            Account Not Configured
          </h2>
          <p className="text-red-700 dark:text-red-300">
            Your tenant account is not properly linked. Please contact your
            property administrator.
          </p>
        </div>
      </div>
    );
  }

  // Fetch customer data
  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    include: {
      Transaction: {
        where: { type: 'revenue' },
        orderBy: { date: 'desc' },
        take: 5,
      },
    },
  });

  if (!customer) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
            Customer Record Not Found
          </h2>
          <p className="text-red-700 dark:text-red-300">
            We couldn't find your customer record. Please contact your property
            administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome, {customer.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {customer.roomNumber ? `Room ${customer.roomNumber}` : 'No room assigned'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {customer.Transaction.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Room
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {customer.roomNumber || 'Not Assigned'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Last Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {customer.lastPayment
                ? new Date(customer.lastPayment).toLocaleDateString()
                : 'Never'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Server Apps Directory */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Server Apps</h2>
        <TenantServerAppsWrapper />
      </div>

      {/* Room Information */}
      <TenantDashboardInfo />

      {/* Recent Payments */}
      <PaymentHistoryCard />
    </div>
  );
}
