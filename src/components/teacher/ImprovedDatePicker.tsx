
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface ImprovedDatePickerProps {
  id: string;
  value: Date | string | undefined;
  onChange: (date: Date | undefined) => void;
  label: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export function ImprovedDatePicker({
  id,
  value,
  onChange,
  label,
  required = false,
  className,
  placeholder = "Select date"
}: ImprovedDatePickerProps) {
  // Convert string dates to Date objects
  const dateValue = value ? (typeof value === 'string' ? new Date(value) : value) : undefined;
  
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateValue && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue ? format(dateValue, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
