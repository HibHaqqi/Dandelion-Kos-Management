import { getCustomers, getTransactions, getRooms, getCategories } from '@/lib/data';
import type { Customer, Transaction, Room, Category } from '@/types';
import { subMonths, isWithinInterval, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export type DateFilterValue = {
  type: 'all' | 'monthly' | 'yearly' | 'custom';
  startDate?: Date;
  endDate?: Date;
  month?: number;
  year?: number;
};

function filterTransactionsByDate(transactions: Transaction[], filter: DateFilterValue): Transaction[] {
  if (filter.type === 'all') {
    return transactions;
  }

  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    
    switch (filter.type) {
      case 'monthly':
        if (filter.month !== undefined && filter.year !== undefined) {
          const monthStart = startOfMonth(new Date(filter.year, filter.month));
          const monthEnd = endOfMonth(new Date(filter.year, filter.month));
          return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
        }
        return false;
      
      case 'yearly':
        if (filter.year !== undefined) {
          const yearStart = startOfYear(new Date(filter.year, 0));
          const yearEnd = endOfYear(new Date(filter.year, 0));
          return isWithinInterval(transactionDate, { start: yearStart, end: yearEnd });
        }
        return false;
      
      case 'custom':
        if (filter.startDate && filter.endDate) {
          return isWithinInterval(transactionDate, {
            start: filter.startDate,
            end: filter.endDate
          });
        }
        return false;
      
      default:
        return true;
    }
  });
}

export async function getDashboardData(dateFilter?: DateFilterValue) {
  const customers = await getCustomers();
  const allTransactions = await getTransactions();
  const rooms = await getRooms();
  const categories = await getCategories();

  // Apply date filter to transactions
  const transactions = dateFilter ? filterTransactionsByDate(allTransactions, dateFilter) : allTransactions;

  const totalRevenue = transactions
    .filter((t) => t.type === 'revenue')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const oneMonthAgo = subMonths(new Date(), 1);
  const occupiedRoomsCount = rooms.filter((room: Room) => room.lastPayment && new Date(room.lastPayment) > oneMonthAgo).length;
  const totalRooms = rooms.length;
  const occupancyRate = totalRooms > 0 ? (occupiedRoomsCount / totalRooms) * 100 : 0;

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((t) => ({ ...t, date: new Date(t.date).toISOString().split('T')[0] }));
    
  const recentCustomers = [...customers]
    .filter((c) => !c.checkoutDate) // Only show active customers (not checked out)
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
    .slice(0, 5)
    .map((c) => ({ ...c, entryDate: new Date(c.entryDate).toISOString().split('T')[0] }));

  const customersCount = customers.filter((c) => !c.checkoutDate).length; // Count only active customers

  // Prepare chart data
  const incomeVsExpenseData = prepareIncomeVsExpenseData(transactions, dateFilter);
  const expenseCategoryData = prepareExpenseCategoryData(transactions, categories as Category[]);

  return {
    totalRevenue,
    totalExpenses,
    occupiedRooms: occupiedRoomsCount,
    totalRooms,
    occupancyRate,
    recentTransactions,
    recentCustomers,
    customersCount,
    incomeVsExpenseData,
    expenseCategoryData,
  };
}

function prepareIncomeVsExpenseData(transactions: Transaction[], dateFilter?: DateFilterValue) {
  // Group transactions by month for the chart
  const monthlyData: { [key: string]: { income: number; expense: number } } = {};
  
  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0 };
    }
    
    if (transaction.type === 'revenue') {
      monthlyData[monthKey].income += transaction.amount;
    } else {
      monthlyData[monthKey].expense += transaction.amount;
    }
  });

  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
    }));
}

function prepareExpenseCategoryData(transactions: Transaction[], categories: Category[]) {
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const categoryTotals: { [key: string]: number } = {};
  
  expenseTransactions.forEach((transaction) => {
    const category = transaction.category || 'Uncategorized';
    categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
  });

  return Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount,
    percentage: 0, // Will be calculated in the component
  }));
}
