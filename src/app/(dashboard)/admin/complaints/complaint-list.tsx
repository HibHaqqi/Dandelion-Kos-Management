import prisma from '@/lib/db';
import { ComplaintCard } from './complaint-card';

export async function ComplaintList() {
  const complaints = await prisma.complaint.findMany({
    include: {
      tenant: {
        include: {
          customer: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (complaints.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No complaints submitted yet
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {complaints.map((complaint) => (
        <ComplaintCard key={complaint.id} complaint={complaint} />
      ))}
    </div>
  );
}
