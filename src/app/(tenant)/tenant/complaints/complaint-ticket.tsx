'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { ImageModal } from '@/components/ui/image-modal';

interface ComplaintTicketProps {
  complaint: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    imageUrl: string | null;
    adminReply: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function ComplaintTicket({ complaint }: ComplaintTicketProps) {
  const [modalImage, setModalImage] = useState<string | null>(null);

  const categoryIcons: Record<string, string> = {
    ELECTRICITY: '⚡',
    PLUMBING: '🚿',
    INTERNET: '🌐',
    CLEANING: '🧹',
    SECURITY: '🔒',
    OTHER: '📦',
  };

  const statusColors: Record<string, string> = {
    OPEN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span>{categoryIcons[complaint.category] || '📦'}</span>
                {complaint.title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <Calendar className="h-3 w-3 inline mr-1" />
                {new Date(complaint.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Badge className={statusColors[complaint.status]}>
              {complaint.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-gray-700 dark:text-gray-300">
            {complaint.description}
          </p>

          {complaint.imageUrl && (
            <div>
              <button
                onClick={() => setModalImage(complaint.imageUrl)}
                className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm font-medium cursor-pointer hover:underline"
              >
                <ImageIcon className="h-4 w-4" />
                View Image Proof (Click to enlarge)
              </button>
            </div>
          )}

          {complaint.adminReply && (
            <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-1 text-sm font-medium text-teal-900 dark:text-teal-100 mb-1">
                <MessageSquare className="h-4 w-4" />
                Admin Response:
              </div>
              <p className="text-sm text-teal-800 dark:text-teal-200">
                {complaint.adminReply}
              </p>
            </div>
          )}

          {complaint.updatedAt.getTime() !== complaint.createdAt.getTime() && (
            <p className="text-xs text-gray-500">
              Last updated:{' '}
              {new Date(complaint.updatedAt).toLocaleDateString('id-ID')}
            </p>
          )}
        </CardContent>
      </Card>

      {modalImage && (
        <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />
      )}
    </>
  );
}
