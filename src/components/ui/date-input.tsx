
import * as React from "react";
import { format, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateInputProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  format?: string;
  disabled?: boolean;
}

export function DateInput({
  date,
  onDateChange,
  label,
  placeholder = "Select date",
  className,
  required = false,
  format: dateFormat = "yyyy-MM-dd",
  disabled = false,
}: DateInputProps) {
  const [inputValue, setInputValue] = React.useState(
    date ? format(date, dateFormat) : ""
  );
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  // Update input when date prop changes
  React.useEffect(() => {
    setInputValue(date ? format(date, dateFormat) : "");
  }, [date, dateFormat]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Try to parse the date from input
    try {
      if (value) {
        const parsedDate = parse(value, dateFormat, new Date());
        if (!isNaN(parsedDate.getTime())) {
          onDateChange(parsedDate);
        }
      } else {
        onDateChange(undefined);
      }
    } catch (error) {
      // Invalid date format, don't update the date
    }
  };

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate);
    setCalendarOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-baseline">
          <label className="text-sm font-medium">{label}</label>
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      <div className="relative flex w-full">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pr-10"
          disabled={disabled}
          required={required}
        />
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full rounded-l-none"
              disabled={disabled}
              type="button"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleCalendarSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
