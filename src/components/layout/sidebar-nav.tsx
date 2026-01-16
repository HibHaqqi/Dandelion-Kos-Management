"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Receipt, Building, MessageSquare, DollarSign, Settings } from "lucide-react";
import { useEffect, useState } from "react";

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/rooms", label: "Rooms", icon: Building },
  { href: "/admin/info", label: "Info Settings", icon: Settings },
  { href: "/admin/complaints", label: "Complaints", icon: MessageSquare, showBadge: true },
  { href: "/admin/payments", label: "Tenant Payments", icon: DollarSign, showBadge: true },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold text-foreground">
            BizTrack Lite
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === link.href}
                className="w-full justify-start"
              >
                <Link href={link.href}>
                  <link.icon className="h-4 w-4" />
                  <span>{link.label}</span>
                  {link.href === '/admin/complaints' && link.showBadge && <ComplaintsBadge />}
                  {link.href === '/admin/payments' && link.showBadge && <PendingPaymentsBadge />}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}

// Client component to fetch and display open complaints count
function ComplaintsBadge() {
  const [openCount, setOpenCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOpenComplaints() {
      try {
        const response = await fetch('/api/admin/complaints/open-count');
        if (response.ok) {
          const data = await response.json();
          setOpenCount(data.count);
        }
      } catch (error) {
        console.error('Failed to fetch complaints count:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOpenComplaints();

    // Refresh every 30 seconds
    const interval = setInterval(fetchOpenComplaints, 30000);
    return () => clearInterval(interval);
  }, []);

  // Don't show badge if loading or no open complaints
  if (loading || openCount === null || openCount === 0) {
    return null;
  }

  // Show badge with count
  return (
    <Badge variant="destructive" className="ml-auto text-xs">
      {openCount}
    </Badge>
  );
}

// Client component to fetch and display pending payments count
function PendingPaymentsBadge() {
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPendingPayments() {
      try {
        const response = await fetch('/api/admin/payments/pending-count');
        if (response.ok) {
          const data = await response.json();
          setPendingCount(data.count);
        }
      } catch (error) {
        console.error('Failed to fetch pending payments count:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPendingPayments();

    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingPayments, 30000);
    return () => clearInterval(interval);
  }, []);

  // Don't show badge if loading or no pending payments
  if (loading || pendingCount === null || pendingCount === 0) {
    return null;
  }

  // Show badge with count
  return (
    <Badge variant="destructive" className="ml-auto text-xs">
      {pendingCount}
    </Badge>
  );
}
