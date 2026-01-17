'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

async function updateRoomAndCustomer(roomNumber: string, date: string) {
  await prisma.room.update({
    where: { roomNumber },
    data: {
      status: 'occupied',
      lastPayment: new Date(date),
    },
  });

  const customer = await prisma.customer.findFirst({
    where: { roomNumber },
  });

  if (customer) {
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastPayment: new Date(date) },
    });
    return {
      customerName: customer.name,
      customerId: customer.id,
    };
  }
  return {};
}

import { getSession } from '@/lib/session';

export async function addTransaction(data: {
  type: 'revenue' | 'expense';
  amount: number;
  date: string;
  description: string;
  category?: string;
  roomNumber?: string;
}) {
  const { type, amount, date, description, category, roomNumber } = data;
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('Unauthorized');
  }
  const userId = session.userId;

  let customerData: { customerId?: string; customerName?: string } = {};
  if (type === 'revenue' && roomNumber) {
    const customerInfo = await updateRoomAndCustomer(roomNumber, date);
    if (customerInfo.customerId && customerInfo.customerName) {
      customerData = customerInfo;
    }
  }

  await prisma.transaction.create({
    data: {
      type,
      amount,
      date: new Date(date),
      description,
      category: type === 'expense' ? category : undefined,
      roomNumber: type === 'revenue' ? roomNumber : undefined,
      ...(customerData.customerId && { customerId: customerData.customerId }),
      ...(customerData.customerName && {
        customerName: customerData.customerName,
      }),
      userId,
    },
  });

  revalidatePath('/transactions');
  revalidatePath('/');
  revalidatePath('/customers');
  revalidatePath('/rooms');
}

export async function updateTransaction(id: string, data: {
  type: 'revenue' | 'expense';
  amount: number;
  date: string;
  description: string;
  category?: string;
  roomNumber?: string;
}) {
  const { type, amount, date, description, category, roomNumber } = data;
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('Unauthorized');
  }
  const userId = session.userId;
  const role = session.role;

  // Find the transaction first
  const existingTransaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!existingTransaction) {
    throw new Error('Transaction not found');
  }

  // Check permissions:
  // - Admin can update any transaction
  // - Tenant can only update their own pending transactions
  if (role === 'TENANT') {
    if (existingTransaction.userId !== userId) {
      throw new Error('You can only update your own transactions');
    }
    if (existingTransaction.status !== 'PENDING') {
      throw new Error('You can only update pending transactions. Contact admin for verified/rejected payments.');
    }
  }

  let customerData: { customerId?: string; customerName?: string } = {};
  if (type === 'revenue' && roomNumber) {
    const customerInfo = await updateRoomAndCustomer(roomNumber, date);
    if (customerInfo.customerId && customerInfo.customerName) {
      customerData = customerInfo;
    }
  }

  await prisma.transaction.update({
    where: { id },
    data: {
      type,
      amount,
      date: new Date(date),
      description,
      category: type === 'expense' ? category : undefined,
      roomNumber: type === 'revenue' ? roomNumber : undefined,
      ...(customerData.customerId && { customerId: customerData.customerId }),
      ...(customerData.customerName && {
        customerName: customerData.customerName,
      }),
    },
  });

  revalidatePath('/transactions');
  revalidatePath('/');
  revalidatePath('/customers');
  revalidatePath('/rooms');
  revalidatePath('/tenant/payments');
  revalidatePath('/tenant/dashboard');
}

export async function deleteTransaction(id: string) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('Unauthorized');
  }
  const userId = session.userId;
  const role = session.role;

  // Find the transaction first
  const transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  // Check permissions:
  // - Admin can delete any transaction
  // - Tenant can only delete their own pending transactions
  if (role === 'TENANT') {
    if (transaction.userId !== userId) {
      throw new Error('You can only delete your own transactions');
    }
    if (transaction.status !== 'PENDING') {
      throw new Error('You can only delete pending transactions. Contact admin for verified/rejected payments.');
    }
  }
  // Admin can delete any transaction (no additional check needed)

  // Delete the transaction
  await prisma.transaction.delete({
    where: { id },
  });

  // Update room status if this was a revenue transaction
  if (transaction.type === 'revenue' && transaction.roomNumber) {
    const lastTransaction = await prisma.transaction.findFirst({
      where: {
        roomNumber: transaction.roomNumber,
        type: 'revenue',
        status: 'VERIFIED', // Only count verified payments for room status
      },
      orderBy: {
        date: 'desc',
      },
    });

    await prisma.room.update({
      where: { roomNumber: transaction.roomNumber },
      data: {
        status: lastTransaction ? 'occupied' : 'vacant',
        lastPayment: lastTransaction ? lastTransaction.date : null,
      },
    });
  }

  revalidatePath('/transactions');
  revalidatePath('/');
  revalidatePath('/customers');
  revalidatePath('/rooms');
  revalidatePath('/tenant/payments');
  revalidatePath('/tenant/dashboard');
}
