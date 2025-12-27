'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';

export async function addCustomer(data: { name: string; phone: string; nik: string; entryDate: string; roomNumber?: string; }) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('Unauthorized');
  }
  await prisma.customer.create({
    data: {
      ...data,
      entryDate: new Date(data.entryDate),
      userId: session.userId,
    },
  });
  revalidatePath('/customers');
  revalidatePath('/');
}

export async function updateCustomer(id: string, data: { name: string; phone: string; nik: string; entryDate: string; roomNumber?: string; }) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('Unauthorized');
  }
  await prisma.customer.update({
    where: { id, userId: session.userId },
    data: {
      ...data,
      entryDate: new Date(data.entryDate),
    },
  });
  revalidatePath('/customers');
  revalidatePath('/');
}

export async function deleteCustomer(id: string) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('Unauthorized');
  }
  await prisma.customer.delete({
    where: { id, userId: session.userId },
  });
  revalidatePath('/customers');
  revalidatePath('/');
}

export async function checkoutCustomer(id: string, checkoutDate: string) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('Unauthorized');
  }

  // Get customer details before checkout
  const customer = await prisma.customer.findUnique({
    where: { id, userId: session.userId },
    select: { roomNumber: true },
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  // Update customer with checkout date and clear room assignment
  await prisma.customer.update({
    where: { id, userId: session.userId },
    data: {
      checkoutDate: new Date(checkoutDate),
      roomNumber: null,
    },
  });

  // Update room status to vacant if room exists
  if (customer.roomNumber) {
    await prisma.room.updateMany({
      where: {
        roomNumber: customer.roomNumber,
        userId: session.userId,
      },
      data: {
        status: 'vacant',
        lastPayment: null,
      },
    });
  }

  revalidatePath('/customers');
  revalidatePath('/rooms');
  revalidatePath('/');
}
