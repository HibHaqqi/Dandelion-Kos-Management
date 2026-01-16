import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, MessageSquare, History, FileText } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      title: 'Submit Payment',
      description: 'Upload payment receipt',
      icon: CreditCard,
      href: '/tenant/payments/submit',
      color: 'bg-teal-600 hover:bg-teal-700',
    },
    {
      title: 'Payment History',
      description: 'View all transactions',
      icon: History,
      href: '/tenant/payments',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: 'Submit Complaint',
      description: 'Report an issue',
      icon: MessageSquare,
      href: '/tenant/complaints/new',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      title: 'My Complaints',
      description: 'Track your requests',
      icon: FileText,
      href: '/tenant/complaints',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button
                variant="outline"
                className={`w-full h-auto py-4 px-4 flex flex-col items-start gap-2 ${
                  action.color
                } text-white border-0 hover:opacity-90`}
              >
                <action.icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
