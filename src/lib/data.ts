import prisma from './db';
import { format } from 'date-fns';
import type { Customer, Transaction } from '@/types';
import { getSession } from './session';

export async function getCustomers() {
  const session = await getSession();
  if (!session?.userId) {
    return [];
  }
  const customers = await prisma.customer.findMany({
    where: { userId: session.userId },
  });
  return customers.map((customer) => ({
    ...customer,
    entryDate: format(new Date(customer.entryDate), 'yyyy-MM-dd'),
  }));
}

export async function getTransactions() {
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
  }));
}

export async function getCategories() {
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
}
