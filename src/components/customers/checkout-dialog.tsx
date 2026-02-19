"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { checkoutCustomer } from "@/app/(dashboard)/customers/actions";

interface CheckoutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customer: { id: string; name: string; roomNumber?: string | null } | null;
}

export function CheckoutDialog({ isOpen, onOpenChange, customer }: CheckoutDialogProps) {
  const [checkoutDate, setCheckoutDate] = useState<Date>(new Date());
  const [isPending, setIsPending] = useState(false);

  const handleCheckout = async () => {
    if (!customer) return;

    setIsPending(true);
    try {
      await checkoutCustomer(customer.id, checkoutDate.toISOString());
      onOpenChange(false);
      window.location.reload(); // Refresh to show updated data
    } catch (error) {
      console.error("Failed to checkout customer:", error);
      alert("Failed to checkout customer. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {isOpen && (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Checkout Customer</DialogTitle>
            <DialogDescription>
              Checkout {customer?.name} from room {customer?.roomNumber}. This will mark their checkout date and free up the room.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="checkout-date">Checkout Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !checkoutDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkoutDate ? format(checkoutDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkoutDate}
                    onSelect={(date) => date && setCheckoutDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleCheckout} disabled={isPending}>
              {isPending ? "Processing..." : "Checkout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
