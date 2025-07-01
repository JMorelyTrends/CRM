"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

export default function CustomDateRangePicker({active, setactive, range, setRange}:{active:string, setactive:React.Dispatch<React.SetStateAction<string>>, range:DateRange|undefined, setRange:React.Dispatch<React.SetStateAction<DateRange|undefined>>}) {
  // Convert incoming range to local state for react-datepicker
  const [localRange, setLocalRange] = useState<[Date|null, Date|null]>([null, null]);

  useEffect(() => {
    if (range?.from || range?.to) {
      setLocalRange([
        range?.from ? new Date(range.from) : null,
        range?.to ? new Date(range.to) : null
      ]);
    } else {
      setLocalRange([null, null]);
    }
  }, [range]);

  // When user picks a range, update parent state
  const handleChange = (dates: [Date|null, Date|null]) => {
    setLocalRange(dates);
    const [start, end] = dates;
    if (start || end) {
      setRange({ from: start ?? undefined, to: end ?? undefined });
    } else {
      setRange(undefined);
    }
  };

  // Format for today
  const today = new Date();
  const todayFormatted = format(today, "EEEE, MMMM d, yyyy");

  // Format for range
  let displayValue = "";
  if (localRange[0] && localRange[1]) {
    displayValue = `${format(localRange[0], "PPP")} - ${format(localRange[1], "PPP")}`;
  } else if (localRange[0]) {
    displayValue = format(localRange[0], "PPP");
  } else {
    displayValue = todayFormatted;
  }

  return (
    <div className="flex-1 min-w-[180px] py-2 rounded-2xl shadow-md border p-2 h-[80%] bg-black overflow-hidden flex items-center w-full">
      <DatePicker
        selectsRange
        startDate={localRange[0]}
        endDate={localRange[1]}
        onChange={handleChange}
        className="rounded-2xl border-none outline-none ring-0 focus:ring-0 focus:border-none focus:outline-none active:border-none active:outline-none text-black bg-white px-3 py-2 w-full"
        placeholderText="Select a range"
        isClearable
        calendarClassName="rounded-lg border border-black bg-white"
        popperPlacement="bottom-start"
        onCalendarOpen={() => setactive("Range")}
        customInput={<input value={displayValue} readOnly className="rounded-2xl border-none outline-none ring-0 focus:ring-0 focus:border-none focus:outline-none active:border-none active:outline-none text-black bg-white px-3 py-2 w-full" />}
      />
    </div>
  );
}
