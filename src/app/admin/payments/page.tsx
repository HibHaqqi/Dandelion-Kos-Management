import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { PaymentVerificationTable } from '@/components/admin/payment-verification-table';

export default async function AdminPaymentsPage() {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  // Fetch all tenant payments with PENDING or recently updated status
  const payments = await prisma.transaction.findMany({
    where: {
      type: 'revenue',
      receiptUrl: {
        not: null,
      },
    },
    include: {
      customer: true,
    },
    orderBy: {
      date: 'desc',
    },
  });

  // Transform data to match expected format
  const formattedPayments = payments.map((payment) => ({
    ...payment,
    date: payment.date.toISOString().split('T')[0],
  }));

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tenant Payments</h2>
          <p className="text-muted-foreground">
            Verify and manage tenant payment submissions
          </p>
        </div>
      </div>

      <PaymentVerificationTable payments={formattedPayments} />
    </div>
  );
}
