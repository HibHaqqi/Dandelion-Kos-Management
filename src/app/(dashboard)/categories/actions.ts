'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';

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
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
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
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  }));
}

export async function addCategory(data: {
  name: string;
  type: 'expense' | 'revenue';
}) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('Unauthorized');
  }

  const { name, type } = data;

  // Check if category already exists for this user and type
  const existingCategory = await prisma.category.findFirst({
    where: {
      name,
      type,
      userId: session.userId,
    },
  });

  if (existingCategory) {
    throw new Error('Category already exists');
  }

  await prisma.category.create({
    data: {
      name,
      type,
      userId: session.userId,
    },
  });

  revalidatePath('/transactions');
}

export async function deleteCategory(id: string) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('Unauthorized');
  }

  await prisma.category.delete({
    where: {
      id,
      userId: session.userId,
    },
  });

  revalidatePath('/transactions');
}

export async function seedDefaultCategories() {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('Unauthorized');
  }

  const defaultExpenseCategories = [
    'Maintenance',
    'Utilities',
    'Capital',
    'Marketing',
    'Salaries'
  ];

  // Check if user already has categories
  const existingCategories = await prisma.category.findMany({
    where: { userId: session.userId },
  });

  if (existingCategories.length === 0) {
    // Create default expense categories
    await prisma.category.createMany({
      data: defaultExpenseCategories.map(name => ({
        name,
        type: 'expense' as const,
        userId: session.userId,
      })),
    });
  }

  // Note: revalidatePath removed as this function is called during render
  // Categories will be fetched fresh on each page load
}