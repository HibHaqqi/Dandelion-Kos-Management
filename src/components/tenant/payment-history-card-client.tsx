'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DashboardPaymentItem } from './dashboard-payment-item';

interface PaymentHistoryCardClientProps {
  recentPayments: Array<{
    id: string;
    amount: number;
    date: Date;
    status: string;
    receiptUrl: string | null;
  }>;
  totalPaid: number;
}

export function PaymentHistoryCardClient({
  recentPayments,
  totalPaid,
}: PaymentHistoryCardClientProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Payments</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total verified: Rp {totalPaid.toLocaleString('id-ID')}
            </p>
          </div>
          <Link href="/tenant/payments">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {recentPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No payments yet
          </div>
        ) : (
          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <DashboardPaymentItem
                key={payment.id}
                amount={payment.amount}
                date={payment.date}
                status={payment.status}
                receiptUrl={payment.receiptUrl}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
