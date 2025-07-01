"use client";
import React, { useState,useEffect } from "react";
import { useIsSmallScreen } from "./Components/Small comps/Issmall";
import Dashboardheader from "./Components/Small comps/Dashboardheader";
import DashboardCharts from "./Components/Dashboard/DashboardCharts";
import CustomDateRangePicker from "./Components/Dashboard/CustomDateRangePicker";
import {DateRange } from "react-day-picker";
import { Dashstats } from "./Components/Small comps/Types";
const Page: React.FC = () => {
  const isSmallScreen = useIsSmallScreen();
  const [internval, setinternval] = useState<string>("");
  const [active, setactive] = useState<string>("year");
  const [range, setRange] = React.useState<DateRange | undefined>();
  const [otherdetails,setotherdetails]=useState<Dashstats>({
newOrders: 0,
  needToSource: 0,
  liveRequests: 0,
  wonOrders: 0,
  wonRevenue: 0,
  wonProfit: 0
  });
  const [isClient, setIsClient] = useState(false);
useEffect(() => setIsClient(true), []);

  return (

    <>
    {isClient&&(
    <div className="w-[80vw] h-full">
      {!isSmallScreen && <Dashboardheader />}

      {/* Top Section: Buttons + Cards */}
      <div className="w-full h-[20vh] mt-3 flex flex-col gap-2">
        {/* Buttons */}
        <div className="w-full h-[40%]   flex items-center  overflow-hidden text-black gap-3 px-3 font-semibold">
         
          <select
            className="h-[80%] w-[20%] cursor-pointer rounded-2xl shadow-md border px-2"
            value={active}
            onChange={e => {
              const val = e.target.value;
              setactive(val);
              setinternval(val);
            }}
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="year">This year</option>
          </select>
           <CustomDateRangePicker
           active={active}
           setactive={setactive}
            range={range}
            setRange={setRange}
          />
        </div>

        {/* Info Cards */}
        <div className="w-full h-[60%] flex items-center gap-4 px-4 font-semibold">
          {[
            ["Live Request", otherdetails.liveRequests],
            ["Need to Source", otherdetails.needToSource],
            ["New Orders", otherdetails.newOrders],
            ["Live vs Won", `${otherdetails.liveRequests}:${otherdetails.wonOrders} `],
            ["Won profit", `${otherdetails.wonProfit} £`],
            ["Won Revenue", `${otherdetails.wonRevenue} £`],
           
          ].map(([title, value], i) => (
            <div
              key={i}
              className="w-[15%] h-[85%] border shadow-md text-black rounded-2xl flex flex-col"
            >
              <div className="w-full h-[40%] flex justify-center items-center">
                {title}
              </div>
              <div className="w-full h-[60%] flex justify-center items-center">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <DashboardCharts internval={internval} range={range} setotherdetails={setotherdetails}  />
    </div>
    )}
    </>
  );
};

export default Page;
