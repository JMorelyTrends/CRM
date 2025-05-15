"use client";
import React from "react";
import {
  Input,
  Popover,
  PopoverHandler,
  PopoverContent,
} from "@material-tailwind/react";
import { format } from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import "react-day-picker/dist/style.css";

export default function CustomDateRangePicker({active,setactive,range,setRange}:{active:string,setactive:React.Dispatch<React.SetStateAction<string>>,range:DateRange|undefined,setRange:React.Dispatch<React.SetStateAction<DateRange|undefined>>}) {
  
 console.log(active)
  const formattedValue =
    range?.from && range?.to
      ? `${format(range.from, "PPP")} - ${format(range.to, "PPP")}`
      : range?.from
      ? format(range.from, "PPP")
      : "";

  return (
    <div className=" w-full max-w-[20%]   ">
      <Popover placement="bottom-start">
        <PopoverHandler>
          <div className="w-full cursor-pointer ">
            <Input
            placeholder="Select a range"
            className={`rounded-2xl  ${
              active === "Range" ? "shadow-lg" : ""
            }  `}
              value={formattedValue}
              size={"md"}
              readOnly
              crossOrigin="anonymous" 
              onClick={()=>{setactive("Range")}}
              onPointerEnterCapture={() => {alert()}}
              onPointerLeaveCapture={() => {alert()}}
              onChange={() => {alert()}}
              containerProps={{
             className: `min-h-0 h-[34px]   cursor-pointer rounded-2xl shadow-md  border-black  ${
              active === "Range" ? "bg-black text-white" : ""
            }`, // overrides container height
  }}
            />
          </div>
        </PopoverHandler>
        <PopoverContent
          className="z-[999] bg-white shadow-md border p-3 rounded-lg"
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
            placeholder=""
        >
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            showOutsideDays
            className="bg-white"
            classNames={{
              caption: "flex justify-center py-2 mb-4 items-center",
              caption_label: "text-sm font-medium text-gray-900",
              nav: "flex items-center justify-between",
              nav_button:
                "h-6 w-6 bg-transparent hover:bg-gray-200 p-1 rounded-md transition-colors duration-300",
              table: "w-full border-collapse",
              head_row: "flex font-medium text-gray-900",
              head_cell: "m-0.5 w-9 font-normal text-sm",
              row: "flex w-full mt-2",
              cell: "text-gray-600 rounded-md h-9 w-9 text-center text-sm p-0 m-0.5 relative",
              day: "h-9 w-9 p-0 font-normal",
              day_range_start: "bg-black text-white rounded-l-md",
              day_range_end: "bg-black text-white rounded-r-md",
              day_range_middle: "bg-gray-200",
              day_selected: "bg-black text-white",
              day_today: "bg-gray-100 text-black",
              day_outside: "text-gray-400 opacity-50",
              day_disabled: "text-gray-300",
              day_hidden: "invisible",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
