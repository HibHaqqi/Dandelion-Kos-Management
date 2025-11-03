'use client';

import { useState, useEffect } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { DateFilter, type DateFilterValue } from '@/components/dashboard/date-filter';
import { IncomeVsExpenseChart } from '@/components/dashboard/income-vs-expense-chart';
import { ExpenseCategoryChart } from '@/components/dashboard/expense-category-chart';
import { DollarSign, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type DashboardData = {
  totalRevenue: number;
  totalExpenses: number;
  occupiedRooms: number;
  totalRooms: number;
  occupancyRate: number;
  recentTransactions: any[];
  recentCustomers: any[];
  customersCount: number;
  incomeVsExpenseData: any[];
  expenseCategoryData: any[];
};

export default function DashboardPage() {
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ type: 'all' });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/dashboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dateFilter }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateFilter]);

  if (loading || !dashboardData) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <PageHeader title="Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  const {
    totalRevenue,
    totalExpenses,
    occupiedRooms,
    totalRooms,
    occupancyRate,
    recentTransactions,
    recentCustomers,
    customersCount,
    incomeVsExpenseData,
    expenseCategoryData,
  } = dashboardData;

  const getFilterDescription = () => {
    switch (dateFilter.type) {
      case 'all':
        return 'All time';
      case 'monthly':
        const months = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
        return `${months[dateFilter.month || 0]} ${dateFilter.year || new Date().getFullYear()}`;
      case 'yearly':
        return `Year ${dateFilter.year || new Date().getFullYear()}`;
      case 'custom':
        return 'Custom period';
      default:
        return 'All time';
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader title="Dashboard" />
        <DateFilter value={dateFilter} onChange={setDateFilter} />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total Revenue"
          value={`IDR ${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          description={`${getFilterDescription()} revenue`}
        />
        <StatCard
          title="Total Expenses"
          value={`IDR ${totalExpenses.toLocaleString()}`}
          icon={TrendingDown}
          description={`${getFilterDescription()} expenses`}
        />
        <StatCard
          title="Net Result"
          value={`IDR ${(totalRevenue - totalExpenses).toLocaleString()}`}
          icon={TrendingUp}
          description="Revenue - Expenses"
        />
        <StatCard
          title="Active Customers"
          value={`+${customersCount}`}
          icon={Users}
          description="Total customers"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${occupancyRate.toFixed(0)}%`}
          icon={TrendingUp}
          description={`${occupiedRooms} of ${totalRooms} rooms`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        <IncomeVsExpenseChart data={incomeVsExpenseData} />
        <ExpenseCategoryChart data={expenseCategoryData} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Recent transactions for {getFilterDescription().toLowerCase()}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isMobile ? (
              // Mobile card view for transactions
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-start p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              transaction.type === 'revenue'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {transaction.type}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          IDR {transaction.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No transactions found for the selected period
                  </div>
                )}
              </div>
            ) : (
              // Desktop table view
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.type === 'revenue'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {transaction.description}
                          </TableCell>
                          <TableCell className="text-right">
                            IDR {transaction.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No transactions found for the selected period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New Customers</CardTitle>
            <CardDescription>A list of the 5 newest customers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCustomers.length > 0 ? (
                recentCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        {customer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {customer.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customer.phone}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-sm">
                      Room {customer.roomNumber || 'N/A'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground">
                  No customers found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
