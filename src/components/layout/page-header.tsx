"use client";

import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

type PageHeaderProps = {
  title: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, actions }: PageHeaderProps) {
  const isMobile = useIsMobile();
  return (
    <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between'}`}>
      <div className={`flex items-center ${isMobile ? 'justify-between w-full' : 'gap-4'}`}>
        <div className="flex items-center gap-4">
          {isMobile && <SidebarTrigger />}
          <h1 className={`font-bold tracking-tight ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{title}</h1>
        </div>
        {actions && isMobile && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {actions && !isMobile && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
