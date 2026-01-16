'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface InfoCardProps {
  title: string;
  items: Array<{
    key: string;
    value: string;
    description?: string;
    category?: string;
  }>;
  icon?: React.ReactNode;
  sensitive?: boolean; // If true, hide values by default
}

export function InfoCard({ title, items, icon, sensitive = false }: InfoCardProps) {
  const [showSensitive, setShowSensitive] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      general: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      security: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      contact: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      access: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      utilities: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      server: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };
    return colors[category || ''] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getCategoryLabel = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {sensitive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSensitive(!showSensitive)}
            >
              {showSensitive ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.key} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {getCategoryLabel(item.key)}
                  </span>
                  {item.category && (
                    <Badge className={getCategoryColor(item.category)} variant="outline">
                      {item.category}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <code
                    className={`text-sm ${
                      sensitive && !showSensitive
                        ? 'bg-gray-200 dark:bg-gray-700 blur-sm select-none'
                        : 'bg-gray-100 dark:bg-gray-800'
                    } px-2 py-1 rounded font-mono`}
                  >
                    {sensitive && !showSensitive ? '••••••••' : item.value}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(item.value, item.key)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  {copiedKey === item.key && (
                    <span className="text-xs text-green-600 dark:text-green-400">Copied!</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
