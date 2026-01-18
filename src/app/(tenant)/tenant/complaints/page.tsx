import { Suspense } from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ComplaintTicket } from './complaint-ticket';

export default async function ComplaintsPage() {
  const session = await getSession();

  if (!session || session.role !== 'TENANT') {
    redirect('/login');
  }

  if (!session.tenantId) {
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

  // Get all tenant complaints
  const complaints = await prisma.complaint.findMany({
    where: {
      tenantId: session.tenantId,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate stats
  const openComplaints = complaints.filter((c) => c.status === 'OPEN').length;
  const inProgressComplaints = complaints.filter(
    (c) => c.status === 'IN_PROGRESS'
  ).length;
  const resolvedComplaints = complaints.filter(
    (c) => c.status === 'RESOLVED' || c.status === 'CLOSED'
  ).length;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            My Complaints
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your maintenance requests and issues
          </p>
        </div>
        <Link href="/tenant/complaints/new" className="self-start">
          <Button className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
            + New Complaint
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {openComplaints}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {inProgressComplaints}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {resolvedComplaints}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaints List */}
      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No complaints submitted yet
              </p>
              <Link href="/tenant/complaints/new">
                <Button className="mt-4" variant="outline">
                  Submit Your First Complaint
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((complaint) => (
                <ComplaintTicket key={complaint.id} complaint={complaint} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
