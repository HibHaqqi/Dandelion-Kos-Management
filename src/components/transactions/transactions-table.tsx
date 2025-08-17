"use client";

import type { Transaction, Room, Category } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useState, useTransition } from 'react';
import { TransactionFormDialog } from './transaction-form-dialog';
import { deleteTransaction } from '@/app/transactions/actions';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

export function TransactionsTable({ transactions, rooms, categories = [] }: { transactions: Transaction[], rooms: Room[], categories?: Category[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTransaction) {
      startTransition(async () => {
        try {
          await deleteTransaction(selectedTransaction.id);
          toast({ title: "Success", description: "Transaction deleted successfully." });
          setIsAlertOpen(false);
          setSelectedTransaction(null);
        } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Something went wrong." });
        }
      });
    }
  };
  
  if (transactions.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No transactions found.</div>;
  }
  
  const isRevenue = transactions[0]?.type === 'revenue';

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            {isRevenue ? <TableHead>Room</TableHead> : <TableHead>Category</TableHead>}
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map(transaction => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.date}</TableCell>
              <TableCell className="font-medium">{transaction.description}</TableCell>
              {isRevenue ? <TableCell>{transaction.roomNumber}</TableCell> : <TableCell><Badge variant="outline">{transaction.category}</Badge></TableCell>}
              <TableCell className="text-right">IDR {transaction.amount.toLocaleString('id-ID')}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(transaction)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(transaction)} className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TransactionFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        transaction={selectedTransaction}
        rooms={rooms}
        categories={categories}
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
