"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7244/ingest/93fa6972-1078-4f78-9b1e-cc2f90374789',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'date-picker.tsx:28',message:'DatePicker mounted',data:{date:date?.toISOString(),disabled,open},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }, []);
  // #endregion

  const handleSelect = (selectedDate: Date | undefined) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/93fa6972-1078-4f78-9b1e-cc2f90374789',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'date-picker.tsx:35',message:'handleSelect called',data:{selectedDate:selectedDate?.toISOString(),hasOnDateChange:!!onDateChange},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    onDateChange?.(selectedDate);
    // Close the popover when a date is selected
    setOpen(false);
  };

  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7244/ingest/93fa6972-1078-4f78-9b1e-cc2f90374789',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'date-picker.tsx:42',message:'Popover open state changed',data:{open},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  }, [open]);
  // #endregion

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal hover:bg-[#fafafa]",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
