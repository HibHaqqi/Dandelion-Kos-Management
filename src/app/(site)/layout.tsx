import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dandelion Kos | Digital Living Experience',
  description: 'Experience the next generation of premium boarding. Seamless management, instant access, and high-tech amenities.',
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
