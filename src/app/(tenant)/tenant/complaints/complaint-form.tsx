'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'ELECTRICITY', label: '⚡ Electricity' },
  { value: 'PLUMBING', label: '🚿 Plumbing' },
  { value: 'INTERNET', label: '🌐 Internet' },
  { value: 'CLEANING', label: '🧹 Cleaning' },
  { value: 'SECURITY', label: '🔒 Security' },
  { value: 'OTHER', label: '📦 Other' },
];

export function ComplaintForm() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please upload an image smaller than 1MB',
      });
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Only JPG and PNG images are allowed',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadedUrl(result.url);
      toast({
        title: 'Image uploaded successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message,
      });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setUploadedUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.category) {
      toast({
        variant: 'destructive',
        title: 'Category required',
        description: 'Please select a complaint category',
      });
      return;
    }

    if (!formData.title || formData.title.length < 5) {
      toast({
        variant: 'destructive',
        title: 'Invalid title',
        description: 'Title must be at least 5 characters',
      });
      return;
    }

    if (!formData.description || formData.description.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Invalid description',
        description: 'Description must be at least 10 characters',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/tenant/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imageUrl: uploadedUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }

      toast({
        title: 'Complaint submitted!',
        description: 'Your complaint has been registered',
      });

      router.push('/tenant/complaints');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complaint Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Brief summary of the issue"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              disabled={isLoading}
              minLength={5}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Detailed description of the issue..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              disabled={isLoading}
              minLength={10}
              rows={5}
            />
          </div>

          {/* Optional Image */}
          <div className="space-y-2">
            <Label>Image Proof (Optional)</Label>

            {previewUrl ? (
              <div className="relative border-2 border-dashed rounded-lg p-4">
                <div className="relative aspect-video max-h-64 mx-auto">
                  <img
                    src={previewUrl}
                    alt="Proof preview"
                    className="w-full h-full object-contain rounded"
                  />
                </div>
                <div className="flex justify-center mt-4 gap-2">
                  {isUploading ? (
                    <Button type="button" disabled size="sm">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={clearImage}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Add optional image proof
                  </p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileSelect}
                    disabled={isLoading || isUploading}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG or PNG, max 1MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700"
            disabled={isLoading || isUploading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Complaint'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
