'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MessageSquare, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { ImageModal } from '@/components/ui/image-modal';
import { useToast } from '@/hooks/use-toast';

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
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tenant/complaints/${complaint.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete complaint');
      }

      toast({
        title: 'Complaint deleted',
        description: 'Your complaint has been removed',
      });

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.message || 'Please try again',
      });
    } finally {
      setIsDeleting(false);
    }
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

          {/* Delete button - only for OPEN complaints */}
          {complaint.status === 'OPEN' && (
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
              size="sm"
              className="w-full mt-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Complaint
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {modalImage && (
        <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />
      )}
    </>
  );
}
