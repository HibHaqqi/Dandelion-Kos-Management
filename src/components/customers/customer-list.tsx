"use client";

import { useState, useEffect, useTransition } from "react";
import type { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CustomerFormDialog } from "./customer-form-dialog";
import { CheckoutDialog } from "./checkout-dialog";
import { deleteCustomer } from "@/app/(dashboard)/customers/actions";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MonthsOccupied = ({ entryDate, checkoutDate }: { entryDate: string; checkoutDate?: string | null }) => {
  const [months, setMonths] = useState(0);

  useEffect(() => {
    if (!entryDate) {
      setMonths(0);
      return;
    }
    const start = new Date(entryDate);
    const end = checkoutDate ? new Date(checkoutDate) : new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setMonths(0);
      return;
    }

    let calculatedMonths = (end.getFullYear() - start.getFullYear()) * 12;
    calculatedMonths -= start.getMonth();
    calculatedMonths += end.getMonth();

    setMonths(calculatedMonths <= 0 ? 1 : calculatedMonths + 1);
  }, [entryDate, checkoutDate]);

  if (!months) {
      return <>-</>;
  }

  return <>{months}</>;
};

export function CustomerList({ customers }: { customers: Customer[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerToCheckout, setCustomerToCheckout] = useState<Customer | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const openFormForEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  }

  const openFormForAdd = () => {
    setSelectedCustomer(undefined);
    setIsFormOpen(true);
  }

  const confirmDelete = (customerId: string) => {
    setCustomerToDelete(customerId);
    setIsAlertOpen(true);
  }

  const confirmCheckout = (customer: Customer) => {
    setCustomerToCheckout(customer);
    setIsCheckoutOpen(true);
  }

  const handleDelete = () => {
    if (!customerToDelete) return;

    startTransition(async () => {
      try {
        await deleteCustomer(customerToDelete);
        toast({ title: "Success", description: "Customer deleted successfully." });
        setIsAlertOpen(false);
        setCustomerToDelete(null);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete customer." });
      }
    });
  }

  return (
    <>
      <CustomerFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        customer={selectedCustomer}
      />
      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        customer={customerToCheckout}
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Customers"
          actions={
            <Button onClick={openFormForAdd}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          }
        />
        {isMobile ? (
          // Mobile card view
          <div className="space-y-4">
            {customers.map((customer) => (
              <Card key={customer.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openFormForEdit(customer)}>Edit</DropdownMenuItem>
                        {customer.roomNumber && !customer.checkoutDate && (
                          <DropdownMenuItem onClick={() => confirmCheckout(customer)}>Checkout</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => confirmDelete(customer.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Entry Date</span>
                      <span>{customer.entryDate}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Last Payment</span>
                      <span>{customer.lastPaymentDate || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Months Occupied</span>
                      <Badge variant="outline">
                        <MonthsOccupied entryDate={customer.entryDate} checkoutDate={customer.checkoutDate} /> months
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Room</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={customer.roomNumber ? "default" : "secondary"}>
                          {customer.roomNumber || 'N/A'}
                        </Badge>
                        {customer.checkoutDate && (
                          <Badge variant="destructive" className="text-xs">
                            Checked Out
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Desktop table view
          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>View, edit, or delete existing customer entries.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Entry Date</TableHead>
                      <TableHead>Last Payment</TableHead>
                      <TableHead>Months Occupied</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.entryDate}</TableCell>
                        <TableCell>{customer.lastPaymentDate || 'N/A'}</TableCell>
                        <TableCell><MonthsOccupied entryDate={customer.entryDate} checkoutDate={customer.checkoutDate} /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{customer.roomNumber || 'N/A'}</span>
                            {customer.checkoutDate && (
                              <Badge variant="destructive" className="text-xs">
                                Checked Out
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openFormForEdit(customer)}>Edit</DropdownMenuItem>
                              {customer.roomNumber && !customer.checkoutDate && (
                                <DropdownMenuItem onClick={() => confirmCheckout(customer)}>Checkout</DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => confirmDelete(customer.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
