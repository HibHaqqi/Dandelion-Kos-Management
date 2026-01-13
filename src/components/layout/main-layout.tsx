import { SidebarProvider, Sidebar, SidebarInset, SidebarFooter } from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";
import { LogoutButton } from "./logout-button";
import { headers } from 'next/headers';
import { cookies } from "next/headers";

export async function MainLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-next-pathname') || '';
  const session = (await cookies()).get('session');

  // Don't show the sidebar on:
  // - Login/register pages
  // - Tenant routes (they have their own navigation)
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/tenant/register';
  const isTenantRoute = pathname?.startsWith('/tenant');
  const noSidebar = !session?.value || isAuthPage || isTenantRoute;

  if (noSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
        <SidebarFooter>
          <LogoutButton />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
