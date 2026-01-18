'use client';

import { Button } from '@/components/ui/button';
import { logout } from '@/app/(site)/login/actions';
import { LogOut } from 'lucide-react';
import { useTransition } from 'react';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout} disabled={isPending}>
      <LogOut className="mr-2 h-4 w-4" />
      {isPending ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
