'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Receipt, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ImageModal } from '@/components/ui/image-modal';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PaymentReceiptProps {
  payment: {
    id: string;
    amount: number;
    date: Date;
    description: string;
    status: string;
    receiptUrl: string | null;
    isVerified: boolean;
    rejectionReason: string | null;
  };
}

export function PaymentReceipt({ payment }: PaymentReceiptProps) {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    VERIFIED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tenant/payments/${payment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to delete payment');
        return;
      }

      // Refresh the page to show updated list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Failed to delete payment');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Delete button - only show for pending payments */}
              {payment.status === 'PENDING' && (
                <div className="flex justify-end mb-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 text-xs"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Payment?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this payment of Rp{' '}
                          {payment.amount.toLocaleString('id-ID')}? This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
              <div className="flex items-center gap-3 mb-2">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  Rp {payment.amount.toLocaleString('id-ID')}
                </p>
                <Badge className={statusColors[payment.status]}>
                  {payment.status}
                </Badge>
                {payment.isVerified && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    ✓ Verified
                  </Badge>
                )}
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(payment.date).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300">
                  {payment.description}
                </p>

                {payment.rejectionReason && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-300 text-sm">
                    <strong>Reason:</strong> {payment.rejectionReason}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-2">
                  {payment.receiptUrl && (
                    <button
                      onClick={() => setModalImage(payment.receiptUrl)}
                      className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm font-medium cursor-pointer hover:underline"
                    >
                      <Receipt className="h-4 w-4" />
                      View Receipt (Click to enlarge)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {modalImage && (
        <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />
      )}
    </>
  );
}
