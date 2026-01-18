import type { Customer } from "@/types";
import { getCustomers, getTransactions } from '@/lib/data';
import { format } from 'date-fns';

export async function getCustomersData(): Promise<Customer[]> {
  const customers = await getCustomers();
  const transactions = await getTransactions();

  const customersWithLastPayment = customers.map((customer: Customer) => {
    if (!customer.roomNumber) {
      return {
        ...customer,
        entryDate: format(new Date(customer.entryDate), 'yyyy-MM-dd'),
      };
    }
    
    const lastPayment = transactions
      .filter((t: any) => t.type === 'revenue' && t.roomNumber === customer.roomNumber)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    return {
      ...customer,
      entryDate: format(new Date(customer.entryDate), 'yyyy-MM-dd'),
      lastPaymentDate: lastPayment ? format(new Date(lastPayment.date), 'yyyy-MM-dd') : undefined,
    };
  });
  return customersWithLastPayment;
}
