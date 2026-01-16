'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { ImageModal } from '@/components/ui/image-modal';

interface Payment {
  id: string;
  amount: number;
  date: string | Date;
  status: string;
  receiptUrl: string | null;
}

interface PaymentData {
  recentPayments: Payment[];
  totalPaid: number;
}

export function PaymentHistoryCard() {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const response = await fetch('/api/tenant/dashboard/payments');
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        const data = await response.json();
        setPaymentData(data);
      } catch (err) {
        setError('Failed to load payment data');
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, []);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    VERIFIED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !paymentData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            {error || 'Failed to load payment data'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Payments</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total verified: Rp {paymentData.totalPaid.toLocaleString('id-ID')}
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
          {paymentData.recentPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No payments yet
            </div>
          ) : (
            <div className="space-y-3">
              {paymentData.recentPayments.map((payment) => {
                const dateObj = typeof payment.date === 'string' ? new Date(payment.date) : payment.date;
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Rp {payment.amount.toLocaleString('id-ID')}
                        </p>
                        <Badge className={statusColors[payment.status] || statusColors.PENDING}>
                          {payment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {dateObj.toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {payment.receiptUrl && (
                        <button
                          onClick={() => setModalImage(payment.receiptUrl)}
                          className="text-xs text-teal-600 hover:text-teal-700 cursor-pointer hover:underline mt-1"
                        >
                          <Receipt className="h-3 w-3 inline mr-1" />
                          View Receipt (Click to enlarge)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {modalImage && (
        <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />
      )}
    </>
  );
}
