"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useTransition } from "react";
import { addRoom, updateRoom } from "@/app/(dashboard)/rooms/actions";
import { useToast } from "@/hooks/use-toast";
import type { Room } from "@/types";

const formSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required."),
});

type FormValues = z.infer<typeof formSchema>;

type RoomFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  room?: Room | null;
};

export function RoomFormDialog({ isOpen, onOpenChange, room }: RoomFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomNumber: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (room) {
        form.reset({ roomNumber: room.roomNumber });
      } else {
        form.reset({ roomNumber: "" });
      }
    }
  }, [isOpen, form, room]);

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        if (room) {
          await updateRoom(room.id, data);
          toast({ title: "Success", description: "Room updated successfully." });
        } else {
          await addRoom(data);
          toast({ title: "Success", description: "Room added successfully." });
        }
        onOpenChange(false);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Something went wrong." });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {isOpen && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{room ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            <DialogDescription>
              Enter the room number below.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl><Input placeholder="e.g. 101" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : (room ? "Save Changes" : "Save Room")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      )}
    </Dialog>
  );
}