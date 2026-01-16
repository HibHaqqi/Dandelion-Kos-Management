'use client';

import { Badge } from '@/components/ui/badge';
import { Receipt } from 'lucide-react';
import { useState } from 'react';
import { ImageModal } from '@/components/ui/image-modal';

interface DashboardPaymentItemProps {
  amount: number;
  date: string | Date;
  status: string;
  receiptUrl: string | null;
}

export function DashboardPaymentItem({
  amount,
  date,
  status,
  receiptUrl,
}: DashboardPaymentItemProps) {
  const [modalImage, setModalImage] = useState<string | null>(null);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    VERIFIED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  // Convert date to Date object if it's a string
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return (
    <div className="relative">
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 dark:text-white">
              Rp {amount.toLocaleString('id-ID')}
            </p>
            <Badge className={statusColors[status] || statusColors.PENDING}>
              {status}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {dateObj.toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {receiptUrl && (
            <button
              onClick={() => setModalImage(receiptUrl)}
              className="text-xs text-teal-600 hover:text-teal-700 cursor-pointer hover:underline mt-1"
            >
              <Receipt className="h-3 w-3 inline mr-1" />
              View Receipt (Click to enlarge)
            </button>
          )}
        </div>
      </div>

      {modalImage && (
        <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />
      )}
    </div>
  );
}
