'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface PaymentVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
  onVerify: () => void;
}

export function PaymentVerificationDialog({
  isOpen,
  onClose,
  transaction,
  onVerify,
}: PaymentVerificationDialogProps) {
  const [status, setStatus] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens or transaction changes
  React.useEffect(() => {
    if (isOpen) {
      setStatus('VERIFIED');
      setRejectionReason('');
      setIsSubmitting(false);
    }
  }, [isOpen, transaction]);

  // Don't render if transaction is null
  if (!transaction) {
    return null;
  }

  const handleSubmit = async () => {
    if (status === 'REJECTED' && !rejectionReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide a reason for rejection',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.id,
          status,
          rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify payment');
      }

      toast({
        title: 'Success',
        description: `Payment ${status.toLowerCase()} successfully`,
      });

      onVerify();
      onClose();
      setRejectionReason('');
      setStatus('VERIFIED');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to verify payment',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    VERIFIED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {isOpen && (
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verify Payment</DialogTitle>
          <DialogDescription>
            Review the payment details and receipt, then verify or reject
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <Label className="text-sm text-muted-foreground">Amount</Label>
              <p className="text-lg font-semibold">
                Rp {transaction.amount?.toLocaleString('id-ID') || 0}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Date</Label>
              <p className="text-sm">
                {transaction.date
                  ? new Date(transaction.date).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Customer</Label>
              <p className="text-sm">{transaction.customerName || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Room</Label>
              <p className="text-sm">{transaction.roomNumber || 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-sm text-muted-foreground">Description</Label>
              <p className="text-sm">{transaction.description || 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-sm text-muted-foreground">Current Status</Label>
              <div className="mt-1">
                <Badge className={statusColors[transaction.status] || statusColors.PENDING}>
                  {transaction.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Receipt Image */}
          {transaction.receiptUrl && (
            <div>
              <Label>Receipt</Label>
              <div className="mt-2 border rounded-lg p-2 bg-white dark:bg-gray-900">
                <img
                  src={transaction.receiptUrl}
                  alt="Payment Receipt"
                  className="w-full h-auto max-h-[400px] object-contain rounded"
                />
              </div>
            </div>
          )}

          {/* Verification Actions */}
          <div className="space-y-3">
            <Label>Verification Action</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={status === 'VERIFIED' ? 'default' : 'outline'}
                onClick={() => setStatus('VERIFIED')}
                className="flex-1"
              >
                Verify Payment
              </Button>
              <Button
                type="button"
                variant={status === 'REJECTED' ? 'destructive' : 'outline'}
                onClick={() => setStatus('REJECTED')}
                className="flex-1"
              >
                Reject Payment
              </Button>
            </div>
          </div>

          {/* Rejection Reason */}
          {status === 'REJECTED' && (
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejectionReason"
                placeholder="Explain why this payment is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                required
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            variant={status === 'REJECTED' ? 'destructive' : 'default'}
          >
            {isSubmitting
              ? 'Processing...'
              : status === 'VERIFIED'
              ? 'Verify Payment'
              : 'Reject Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
      )}
    </Dialog>
  );
}
