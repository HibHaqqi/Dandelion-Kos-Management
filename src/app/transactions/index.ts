import { getTransactions, getRooms, getCategories } from '@/lib/data';
import type { Transaction, Room, Category } from '@/types';

export async function getTransactionsData() {
    return await getTransactions();
}

export async function getRoomsData(): Promise<Room[]> {
    return await getRooms();
}

export async function getCategoriesData(): Promise<Category[]> {
    return await getCategories();
}
