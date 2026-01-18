"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useTransition } from "react";
import { addCustomer, updateCustomer } from "@/app/(dashboard)/customers/actions";
import { useToast } from "@/hooks/use-toast";

const customerFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, { message: "Phone number is required." }),
  nik: z.string().length(16, { message: "NIK must be 16 digits." }),
  entryDate: z.string().min(1, { message: "Entry date is required." }),
  roomNumber: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

type CustomerFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  customer?: Customer;
};

export function CustomerFormDialog({ isOpen, onOpenChange, customer }: CustomerFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customer || {
      name: "",
      email: "",
      phone: "",
      nik: "",
      entryDate: new Date().toISOString().split('T')[0],
      roomNumber: ""
    },
  });

  useEffect(() => {
    if (isOpen) {
      const defaultValues = customer ? {
        ...customer,
        roomNumber: customer.roomNumber || '',
        email: customer.email || ''
       } : {
        name: "",
        email: "",
        phone: "",
        nik: "",
        entryDate: new Date().toISOString().split('T')[0],
        roomNumber: ""
      };
      form.reset(defaultValues);
    }
  }, [customer, form, isOpen]);

  const onSubmit = (data: CustomerFormValues) => {
    startTransition(async () => {
      try {
        if (customer?.id) {
          await updateCustomer(customer.id, data);
          toast({ title: "Success", description: "Customer updated successfully." });
        } else {
          await addCustomer(data);
          toast({ title: "Success", description: "Customer added successfully." });
        }
        onOpenChange(false);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Something went wrong." });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          <DialogDescription>
            {customer ? "Update the customer's details." : "Fill in the details for the new customer."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="123-456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nik"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIK</FormLabel>
                  <FormControl>
                    <Input placeholder="16-digit NIK" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="entryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 101" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Customer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    