import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = React.useState(today.getMonth());
  const [selectedYear, setSelectedYear] = React.useState(today.getFullYear());

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(Number(e.target.value));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value));
  };

  return (
    <div className="p-3 pointer-events-auto">
      <div className="flex justify-center space-x-2 mb-4">
        {/* Year Selector */}
        <select
          className="border rounded-md p-1 text-sm"
          value={selectedYear}
          onChange={handleYearChange}
        >
          {Array.from({ length: 50 }, (_, i) => today.getFullYear() - 25 + i).map(
            (year) => (
              <option key={year} value={year}>
                {year}
              </option>
            )
          )}
        </select>

        {/* Month Selector */}
        <select
          className="border rounded-md p-1 text-sm"
          value={selectedMonth}
          onChange={handleMonthChange}
        >
          {Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString("default", { month: "long" })).map(
            (month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            )
          )}
        </select>
      </div>

      <DayPicker
        showOutsideDays={showOutsideDays}
        month={new Date(selectedYear, selectedMonth)}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "hidden", // Hide default caption since we use custom selectors
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          ...classNames,
        }}
        components={{
          IconLeft: () => <ChevronLeft className="hidden" />,
          IconRight: () => <ChevronRight className="hidden" />,
        }}
        {...props}
      />
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
