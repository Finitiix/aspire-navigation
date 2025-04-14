
import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

export type Option = {
  label: string;
  value: string;
};

export type MultiSelectProps = {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
};

export function MultiSelect({
  options = [], // Default to empty array
  selected = [], // Default to empty array
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Safe selected array - ensures we always work with an array
  const safeSelected = React.useMemo(() => {
    return Array.isArray(selected) ? selected : [];
  }, [selected]);

  // Safe options array - ensures we always work with an array
  const safeOptions = React.useMemo(() => {
    return Array.isArray(options) ? options : [];
  }, [options]);

  // Safely compute selectable items
  const selectableItems = React.useMemo(() => {
    return safeOptions.filter((option) => 
      !safeSelected.includes(option.value)
    );
  }, [safeOptions, safeSelected]);

  const handleUnselect = (item: string) => {
    if (!Array.isArray(selected)) {
      onChange([]);
      return;
    }
    onChange(selected.filter((i) => i !== item));
  };

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "" && safeSelected.length > 0) {
          const newSelected = [...safeSelected];
          newSelected.pop();
          onChange(newSelected);
        }
      }
      if (e.key === "Escape") {
        input.blur();
      }
    }
  }, [safeSelected, onChange]);

  return (
    <div
      className={`bg-white flex min-h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${className || ""}`}
      onClick={() => {
        inputRef.current?.focus();
      }}
    >
      <div className="flex flex-wrap gap-1 w-full">
        {safeSelected.map((item) => {
          const option = safeOptions.find((o) => o.value === item);
          return (
            <Badge
              key={item}
              variant="secondary"
              className="rounded flex items-center gap-1 pr-0.5"
            >
              <span>{option?.label || item}</span>
              <button
                type="button"
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnselect(item);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => handleUnselect(item)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          );
        })}
        
        <div className="flex-1">
          <div className="cmdk-input-wrapper">
            <CommandPrimitive onKeyDown={handleKeyDown}>
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="placeholder:text-muted-foreground bg-white outline-none w-full min-w-[60px] ml-1"
                placeholder={safeSelected.length === 0 ? placeholder : ""}
                onFocus={() => setOpen(true)}
                onBlur={() => {
                  setOpen(false);
                  // Reset input value when focus is lost
                  setInputValue("");
                }}
              />
            </CommandPrimitive>
          </div>
        </div>
      </div>
      
      {open && (
        <div className="absolute left-0 top-full mt-2 w-full z-10">
          <Command className="rounded-md border shadow-md w-full bg-white overflow-auto max-h-52">
            <CommandGroup>
              {selectableItems.length > 0 ? (
                selectableItems.map((option) => (
                  <CommandItem
                    key={option.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => {
                      onChange([...safeSelected, option.value]);
                      setInputValue("");
                    }}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </CommandItem>
                ))
              ) : (
                <div className="py-2 px-1 text-sm text-center text-muted-foreground">
                  {safeOptions.length === 0 ? "No items available." : "No more items to select."}
                </div>
              )}
            </CommandGroup>
          </Command>
        </div>
      )}
    </div>
  );
}
