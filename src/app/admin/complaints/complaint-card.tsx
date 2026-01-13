'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Image as ImageIcon, User } from 'lucide-react';
import { ImageModal } from '@/components/ui/image-modal';

interface ComplaintCardProps {
  complaint: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    imageUrl: string | null;
    adminReply: string | null;
    createdAt: Date;
    tenant: {
      customer: {
        name: string;
        roomNumber: string | null;
      };
    };
  };
}

export function ComplaintCard({ complaint }: ComplaintCardProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [status, setStatus] = useState(complaint.status);
  const [reply, setReply] = useState(complaint.adminReply || '');

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

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/complaints/${complaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminReply: reply }),
      });

      if (!response.ok) {
        throw new Error('Failed to update complaint');
      }

      toast({
        title: 'Complaint updated',
        description: 'Status and reply have been saved',
      });

      setIsEditing(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Please try again',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>{categoryIcons[complaint.category] || '📦'}</span>
              {complaint.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <User className="h-4 w-4" />
              {complaint.tenant.customer.name}
              {complaint.tenant.customer.roomNumber && (
                <span>• Room {complaint.tenant.customer.roomNumber}</span>
              )}
              {' • '}
              {new Date(complaint.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge className={statusColors[complaint.status]}>
            {complaint.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          {complaint.description}
        </p>

        {complaint.imageUrl && (
          <div>
            <p className="text-sm font-medium mb-2">Image Proof:</p>
            <button
              onClick={() => setModalImage(complaint.imageUrl)}
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-medium cursor-pointer hover:underline"
            >
              <ImageIcon className="h-4 w-4" />
              View Image (Click to enlarge)
            </button>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Reply</label>
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Enter your response to the tenant..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setStatus(complaint.status);
                  setReply(complaint.adminReply || '');
                }}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-t pt-4">
            {complaint.adminReply ? (
              <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg">
                <p className="text-sm font-medium text-teal-900 dark:text-teal-100 mb-1">
                  Admin Response:
                </p>
                <p className="text-teal-800 dark:text-teal-200">
                  {complaint.adminReply}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No response yet</p>
            )}
            <Button
              className="mt-3"
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              Update Status / Reply
            </Button>
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
