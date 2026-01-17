import { TenantNav } from '@/components/tenant/tenant-nav';

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TenantNav />
      <main className="pb-16 md:pb-6">{children}</main>
    </div>
  );
}
