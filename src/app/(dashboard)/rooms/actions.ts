'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';

export async function addRoom(data: { roomNumber: string }) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('Unauthorized');
  }
  const { roomNumber } = data;
  await prisma.room.create({
    data: {
      roomNumber,
      status: 'vacant',
      userId: session.userId,
    },
  });
  revalidatePath('/rooms');
  revalidatePath('/');
}

export async function updateRoom(id: string, data: { roomNumber: string }) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('Unauthorized');
  }
  const { roomNumber } = data;
  await prisma.room.update({
    where: { id, userId: session.userId },
    data: { roomNumber },
  });
  revalidatePath('/rooms');
  revalidatePath('/');
}

export async function deleteRoom(id: string) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('Unauthorized');
  }
  await prisma.room.delete({
    where: { id, userId: session.userId },
  });
  revalidatePath('/rooms');
  revalidatePath('/');
}