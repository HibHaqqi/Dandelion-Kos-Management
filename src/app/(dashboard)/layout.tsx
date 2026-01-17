import type { Metadata } from 'next';
import { MainLayout } from '@/components/layout/main-layout';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Dandelion Kos',
  description: 'Admin dashboard for managing Dandelion Kos operations',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
