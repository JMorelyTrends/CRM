"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react"; // Assuming you use lucide-react for icons

import { 
  isToday, 
  isYesterday, 
  subDays, 
  startOfWeek, 
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  isEqual,
} from "date-fns";

function getDateRangeLabel(start: Date, end: Date): string {
  const now = new Date();

  if (start > end) [start, end] = [end, start];

  if (isToday(start) && isToday(end)) return "Today";
  if (isYesterday(start) && isYesterday(end)) return "Yesterday";

  
  return `${start.toLocaleDateString('en-GB')} - ${end.toLocaleDateString('en-GB')}`;
}

// Utility to convert a date to UTC midnight
function toUTCMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
}

export default function CustomDateRangePicker({
  active,
  setActive,
  range,
  setRange,
}: {
  active: string;
  setActive: React.Dispatch<React.SetStateAction<string>>;
  range: DateRange | undefined;
  setRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}) {
  const [localRange, setLocalRange] = useState<[Date | null, Date | null]>([null, null]);

  useEffect(() => {
    if (range?.from || range?.to) {
      setLocalRange([range.from ? new Date(range.from) : null, range.to ? new Date(range.to) : null]);
    } else {
      setLocalRange([null, null]);
    }
  }, [range]);

  const handleChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setLocalRange(dates);
    setRange({
      from: start ? toUTCMidnight(start) : undefined,
      to: end ? toUTCMidnight(end) : undefined,
    });
  };

  let displayValue = "Select a date range";
  if (localRange[0] && localRange[1]) {
   displayValue=getDateRangeLabel(localRange[0],localRange[1])
  } 
  else if (localRange[0]) {
    displayValue = format(localRange[0], "PPP");
  }

  const CustomInput = React.forwardRef<HTMLButtonElement, { label?: string; onClick?: () => void }>(
    ({ label, onClick }, ref) => {
    
  
      return (
        <button
          onClick={onClick}
          ref={ref}
          className="flex items-center justify-between w-full min-w-[250px] text-left px-4 py-2 bg-transparent text-black focus:outline-none"
        >
          <span>{label}</span>
          <CalendarIcon className="h-4 w-4 text-gray-500" />
        </button>
      );
    }
  );
  
  CustomInput.displayName = 'CustomInput';
  
  return (
    <DatePicker
      selectsRange
      startDate={localRange[0]}
      endDate={localRange[1]}
      onChange={handleChange}
      isClearable
      placeholderText="Select Date Range"
      popperPlacement="bottom-start"
      onCalendarOpen={() => setActive("Range")}
      customInput={<CustomInput label={displayValue}/>}
      calendarClassName="rounded-lg border border-gray-300 bg-white shadow-lg"
      wrapperClassName="w-full"
      maxDate={new Date()}
    />
  );
}
