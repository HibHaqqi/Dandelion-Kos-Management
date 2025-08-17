"use client";

import { useState } from 'react';
import type { Transaction, Room, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, Upload } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionsTable } from './transactions-table';
import { TransactionFormDialog } from './transaction-form-dialog';
import { ImportDialog } from './import-dialog';
import { useToast } from '@/hooks/use-toast';

export function TransactionsView({ transactions, rooms, categories }: { transactions: Transaction[], rooms: Room[], categories: Category[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Add null checks to prevent filter errors
  const safeTransactions = transactions || [];
  const safeRooms = rooms || [];
  const safeCategories = categories || [];

  const revenue = safeTransactions.filter(t => t.type === 'revenue');
  const expenses = safeTransactions.filter(t => t.type === 'expense');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/transactions/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Export successful",
          description: "Transactions exported to Excel file",
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export transactions",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportComplete = () => {
    // Refresh the page to show imported transactions
    window.location.reload();
  };

  return (
    <>
      <TransactionFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        rooms={safeRooms}
        categories={safeCategories}
      />
      <ImportDialog
        isOpen={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImportComplete={handleImportComplete}
      />
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Transactions"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Download className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Excel
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import Excel
              </Button>
              <Button onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </div>
          }
        />
        <Tabs defaultValue="revenue">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expense">Expenses</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Transactions</CardTitle>
                <CardDescription>All incoming revenue transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionsTable transactions={revenue} rooms={safeRooms} categories={safeCategories} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="expense">
            <Card>
              <CardHeader>
                <CardTitle>Expense Transactions</CardTitle>
                <CardDescription>All outgoing expense transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionsTable transactions={expenses} rooms={safeRooms} categories={safeCategories} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
