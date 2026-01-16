"use client";

import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

type AdminPageHeaderProps = {
  title: string;
  description?: string;
};

export function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center gap-4 mb-4 md:mb-6">
      <SidebarTrigger />
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-sm md:text-base">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
