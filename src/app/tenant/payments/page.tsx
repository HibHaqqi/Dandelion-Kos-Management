import { Suspense } from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PaymentReceipt } from './payment-receipt';

export default async function PaymentsPage() {
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

  // Get all tenant payments
  const payments = await prisma.transaction.findMany({
    where: {
      customerId: session.customerId,
      type: 'revenue',
    },
    orderBy: { date: 'desc' },
  });

  // Calculate totals
  const totalPaid = payments
    .filter((p) => p.isVerified)
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments.filter((p) => p.status === 'PENDING').length;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Payment History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View all your payments and receipts
          </p>
        </div>
        <Link href="/tenant/payments/submit" className="self-start">
          <Button className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
            + Submit Payment
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              Rp {totalPaid.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Verified payments only
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingPayments}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Waiting for verification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No payments yet
              </p>
              <Link href="/tenant/payments/submit">
                <Button className="mt-4" variant="outline">
                  Submit Your First Payment
                </Button>
              </Link>
            </div>
          ) : (
            <Suspense fallback={<div className="text-center py-8">Loading payments...</div>}>
              <div className="space-y-3">
                {payments.map((payment) => (
                  <PaymentReceipt key={payment.id} payment={payment} />
                ))}
              </div>
            </Suspense>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
