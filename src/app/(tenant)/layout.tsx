import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tenant Portal | Dandelion Kos',
  description: 'Tenant portal for Dandelion Kos residents',
};

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
