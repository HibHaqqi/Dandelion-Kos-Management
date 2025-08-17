"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DateFilterType = "all" | "monthly" | "yearly" | "custom";

export type DateFilterValue = {
  type: DateFilterType;
  startDate?: Date;
  endDate?: Date;
  month?: number;
  year?: number;
};

type DateFilterProps = {
  value: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
};

export function DateFilter({ value, onChange }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleTypeChange = (type: DateFilterType) => {
    const now = new Date();
    switch (type) {
      case "all":
        onChange({ type: "all" });
        break;
      case "monthly":
        onChange({ 
          type: "monthly", 
          month: currentMonth, 
          year: currentYear 
        });
        break;
      case "yearly":
        onChange({ 
          type: "yearly", 
          year: currentYear 
        });
        break;
      case "custom":
        onChange({ 
          type: "custom", 
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: now
        });
        break;
    }
  };

  const getDisplayText = () => {
    switch (value.type) {
      case "all":
        return "All Time";
      case "monthly":
        return `${months[value.month || currentMonth]} ${value.year || currentYear}`;
      case "yearly":
        return `Year ${value.year || currentYear}`;
      case "custom":
        if (value.startDate && value.endDate) {
          return `${format(value.startDate, "MMM dd, yyyy")} - ${format(value.endDate, "MMM dd, yyyy")}`;
        }
        return "Custom Range";
      default:
        return "Select Period";
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Select value={value.type} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Filter Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>

      {value.type === "monthly" && (
        <>
          <Select 
            value={value.month?.toString() || currentMonth.toString()} 
            onValueChange={(month) => onChange({ ...value, month: parseInt(month) })}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select 
            value={value.year?.toString() || currentYear.toString()} 
            onValueChange={(year) => onChange({ ...value, year: parseInt(year) })}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}

      {value.type === "yearly" && (
        <Select 
          value={value.year?.toString() || currentYear.toString()} 
          onValueChange={(year) => onChange({ ...value, year: parseInt(year) })}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {value.type === "custom" && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !value.startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDisplayText()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Calendar
                    mode="single"
                    selected={value.startDate}
                    onSelect={(date) => onChange({ ...value, startDate: date })}
                    initialFocus
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Calendar
                    mode="single"
                    selected={value.endDate}
                    onSelect={(date) => onChange({ ...value, endDate: date })}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-3">
                <Button onClick={() => setIsOpen(false)} size="sm">
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}