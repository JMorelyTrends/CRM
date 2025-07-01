"use client";
import React, { useState, useEffect } from "react";
import { useIsSmallScreen } from "./Components/Small comps/Issmall";
import Dashboardheader from "./Components/Small comps/Dashboardheader";
import DashboardCharts from "./Components/Dashboard/DashboardCharts";
import CustomDateRangePicker from "./Components/Dashboard/CustomDateRangePicker";
import { DateRange } from "react-day-picker";
import { Dashstats } from "./Components/Small comps/Types";

// A small component for the info cards to reduce repetition
const InfoCard = ({ title, value }: { title: string; value: string | number }) => (
  <div className="flex-1 min-w-[150px] h-[90px] bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center p-2 shadow-sm hover:shadow-md transition-shadow">
    <div className="text-sm text-gray-600 font-medium text-center">{title}</div>
    <div className="text-xl font-bold mt-1 text-gray-800">£{value}</div>
    <div className="text-xs text-[#F48C0D] font-medium text-center">Targe: £{value}</div>
  </div>
);

const Page: React.FC = () => {
  const isSmallScreen = useIsSmallScreen();
  const [internval, setInternval] = useState<string>("year");
  const [active, setActive] = useState<string>("year");
  const [range, setRange] = React.useState<DateRange | undefined>();
  const [otherdetails, setOtherdetails] = useState<Dashstats>({
    newOrders: 0,
    needToSource: 0,
    liveRequests: 0,
    wonOrders: 0,
    wonRevenue: 0,
    wonProfit: 0,
  });
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setActive(val);
    setInternval(val);
    setRange(undefined); // Clear custom range when a preset is selected
  };

  const cardData = [
    { title: "Revenue This Week", value: otherdetails.liveRequests },
    { title: "Profit This Week", value: otherdetails.needToSource },
    { title: "Revenue This Month", value: otherdetails.newOrders },
    { title: "Profit This Month", value: `${otherdetails.liveRequests}:${otherdetails.wonOrders}` },
  ];

  if (!isClient) {
    return null;
  }

  return (
    <div className="w-[80vw] min-h-screen bg-gray-50">
      {!isSmallScreen && <Dashboardheader />}

      <div className="p-4 lg:p-6 flex flex-col gap-6">
        {/* Top Section: Filters + Cards */}
        <div className="w-full flex flex-col gap-4">
          
          {/* Filter Controls - Combined into one component */}
          <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm w-full max-w-lg">
            <CustomDateRangePicker
              active={active}
              setActive={setActive}
              range={range}
              setRange={setRange}
            />
            <div className="h-6 w-px bg-gray-300" />
            <select
              className="h-full bg-transparent text-black focus:outline-none cursor-pointer px-4 py-2"
              value={active}
              onChange={handleIntervalChange}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7">Last 7 days</option>
              <option value="last30">Last 30 days</option>
              <option value="year">This year</option>
            </select>
          </div>

          {/* Info Cards - Using a responsive grid */}
          <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cardData.map((card, i) => (
              <InfoCard key={i} title={card.title} value={card.value} />
            ))}
          </div>
        </div>

        <DashboardCharts internval={internval} range={range} setotherdetails={setOtherdetails} />
      </div>
    </div>
  );
};

export default Page;
