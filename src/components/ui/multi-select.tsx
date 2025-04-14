
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
  options = [], // Set default empty array to prevent undefined errors
  selected = [], // Set default empty array to prevent undefined errors
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "") {
          const newSelected = [...selected];
          newSelected.pop();
          onChange(newSelected);
        }
      }
      // This is not a default behavior of the <input /> field
      if (e.key === "Escape") {
        input.blur();
      }
    }
  }, [selected, onChange]);

  // Ensure selectables is always an array, even if options or selected are undefined
  const selectables = Array.isArray(options) && Array.isArray(selected) 
    ? options.filter((item) => !selected.includes(item.value))
    : [];

  return (
    <div
      className={`bg-white flex min-h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${className}`}
      onClick={() => {
        inputRef.current?.focus();
      }}
    >
      <div className="flex flex-wrap gap-1">
        {Array.isArray(selected) && selected.map((item) => {
          const option = Array.isArray(options) ? options.find((o) => o.value === item) : undefined;
          return (
            <Badge
              key={item}
              variant="secondary"
              className="rounded flex items-center gap-1 pr-0.5"
            >
              <span>{option?.label || item}</span>
              <button
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
        <CommandPrimitive onKeyDown={handleKeyDown}>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="placeholder:text-muted-foreground bg-white outline-none flex-1 min-w-32 ml-1"
            placeholder={selected && selected.length === 0 ? placeholder : ""}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
          />
        </CommandPrimitive>
      </div>
      <div className="relative mt-2">
        <Command
          className={`absolute rounded-md border top-0 w-full z-10 bg-white overflow-auto max-h-52 shadow-md ${
            open ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <CommandGroup>
            {selectables.length > 0 ? (
              selectables.map((option) => (
                <CommandItem
                  key={option.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onSelect={() => {
                    onChange([...selected, option.value]);
                    setInputValue("");
                  }}
                  className={"cursor-pointer"}
                >
                  {option.label}
                </CommandItem>
              ))
            ) : (
              <p className="py-2 px-1 text-sm text-center text-muted-foreground">
                No more items to select.
              </p>
            )}
          </CommandGroup>
        </Command>
      </div>
    </div>
  );
}
