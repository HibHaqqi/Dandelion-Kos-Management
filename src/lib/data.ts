import prisma from './db';
import { format } from 'date-fns';
import type { Customer, Transaction } from '@/types';
import { getSession } from './session';

export async function getCustomers() {
  const session = await getSession();
  if (!session?.userId) {
    return [];
  }

  try {
    const customers = await prisma.customer.findMany({
      where: { userId: session.userId },
      include: {
        Transaction: {
          where: {
            type: 'revenue',
          },
          orderBy: {
            date: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        entryDate: 'desc',
      },
    });
    return customers.map((customer) => ({
      ...customer,
      entryDate: format(new Date(customer.entryDate), 'yyyy-MM-dd'),
      checkoutDate: customer.checkoutDate ? format(new Date(customer.checkoutDate), 'yyyy-MM-dd') : null,
      lastPaymentDate: customer.Transaction[0]?.date
        ? format(new Date(customer.Transaction[0].date), 'yyyy-MM-dd')
        : customer.lastPayment
        ? format(new Date(customer.lastPayment), 'yyyy-MM-dd')
        : null,
    }));
  } catch (error) {
    console.error('Error fetching customers:', error);
    // Fallback: fetch without Transaction relation if the above fails
    try {
      const customers = await prisma.customer.findMany({
        where: { userId: session.userId },
        orderBy: {
          entryDate: 'desc',
        },
      });
      return customers.map((customer) => ({
        ...customer,
        entryDate: format(new Date(customer.entryDate), 'yyyy-MM-dd'),
        checkoutDate: customer.checkoutDate ? format(new Date(customer.checkoutDate), 'yyyy-MM-dd') : null,
        lastPaymentDate: customer.lastPayment
          ? format(new Date(customer.lastPayment), 'yyyy-MM-dd')
          : null,
      }));
    } catch (fallbackError) {
      console.error('Error in fallback customer fetch:', fallbackError);
      return [];
    }
  }
}

export async function getTransactions() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return [];
    }
    const transactions = await prisma.transaction.findMany({
      where: { userId: session.userId },
      orderBy: {
        date: 'desc',
      },
    });
    return transactions.map((transaction) => ({
      ...transaction,
      date: format(new Date(transaction.date), 'yyyy-MM-dd'),
      type: transaction.type as 'revenue' | 'expense',
      category: transaction.category ?? undefined,
      roomNumber: transaction.roomNumber ?? undefined,
      customerName: transaction.customerName ?? undefined,
      status: transaction.status ?? undefined,
      receiptUrl: transaction.receiptUrl ?? undefined,
      isVerified: transaction.isVerified ?? undefined,
      rejectionReason: transaction.rejectionReason ?? undefined,
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function getCategories() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return [];
    }
    const categories = await prisma.category.findMany({
      where: { userId: session.userId },
      orderBy: { name: 'asc' },
    });
    return categories.map((category) => ({
      ...category,
      createdAt: format(new Date(category.createdAt), 'yyyy-MM-dd'),
      updatedAt: format(new Date(category.updatedAt), 'yyyy-MM-dd'),
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getCategoriesByType(type: 'expense' | 'revenue') {
  const session = await getSession();
  if (!session?.userId) {
    return [];
  }
  const categories = await prisma.category.findMany({
    where: {
      userId: session.userId,
      type: type,
    },
    orderBy: { name: 'asc' },
  });
  return categories.map((category) => ({
    ...category,
    createdAt: format(new Date(category.createdAt), 'yyyy-MM-dd'),
    updatedAt: format(new Date(category.updatedAt), 'yyyy-MM-dd'),
  }));
}

export async function getRooms() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return [];
    }
    const rooms = await prisma.room.findMany({
      where: { userId: session.userId },
    });
    return rooms.map((room) => ({
      ...room,
      lastPayment: room.lastPayment
        ? format(new Date(room.lastPayment), 'yyyy-MM-dd')
        : null,
    }));
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
}
