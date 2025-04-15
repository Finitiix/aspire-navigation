
import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export type DepartmentOption = {
  label: string;
  value: string;
};

export interface DepartmentSelectProps {
  options: DepartmentOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  className?: string;
  placeholder?: string;
}

export function DepartmentSelect({
  options,
  selected = [],
  onChange,
  className,
  placeholder = "Select departments...",
}: DepartmentSelectProps) {
  const [open, setOpen] = React.useState(false);
  
  // Ensure we're working with valid arrays
  const safeOptions = Array.isArray(options) ? options : [];
  const safeSelected = Array.isArray(selected) ? selected : [];

  const handleSelect = (value: string) => {
    if (safeSelected.includes(value)) {
      onChange(safeSelected.filter((item) => item !== value));
    } else {
      onChange([...safeSelected, value]);
    }
  };

  const handleRemove = (value: string) => {
    onChange(safeSelected.filter((item) => item !== value));
  };

  const selectedLabels = safeSelected.map(value => {
    const option = safeOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  });

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {safeSelected.length > 0 ? (
              <span className="truncate">
                {`${safeSelected.length} department${safeSelected.length > 1 ? 's' : ''} selected`}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="max-h-60 overflow-auto p-1">
            {safeOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  safeSelected.includes(option.value) ? "bg-accent text-accent-foreground" : ""
                )}
                onClick={() => handleSelect(option.value)}
              >
                <span className="flex items-center justify-between w-full">
                  {option.label}
                  {safeSelected.includes(option.value) && <Check className="h-4 w-4 ml-2" />}
                </span>
              </div>
            ))}
            {safeOptions.length === 0 && (
              <div className="text-sm text-center py-2 text-muted-foreground">
                No departments available
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {safeSelected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {safeSelected.map((value) => {
            const label = safeOptions.find(opt => opt.value === value)?.label || value;
            return (
              <Badge key={value} variant="secondary" className="rounded flex items-center gap-1 pr-0.5">
                <span>{label}</span>
                <button
                  type="button"
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => handleRemove(value)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
