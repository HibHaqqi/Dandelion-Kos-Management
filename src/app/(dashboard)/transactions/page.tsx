import { TransactionsView } from "@/components/transactions/transactions-view";
import { getTransactionsData, getRoomsData, getCategoriesData } from "./index";
import { seedDefaultCategories } from "@/app/(dashboard)/categories/actions";
import type { Transaction, Room, Category } from "@/types";

export default async function TransactionsPage() {
  const transactions = await getTransactionsData();
  const rooms = await getRoomsData();
  
  // Seed default categories if none exist
  await seedDefaultCategories();
  const categories = await getCategoriesData();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <TransactionsView transactions={transactions} rooms={rooms} categories={categories} />
    </div>
  );
}
