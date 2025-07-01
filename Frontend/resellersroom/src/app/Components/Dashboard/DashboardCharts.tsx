"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DateRange } from "react-day-picker";
import { Dashstats } from "../Small comps/Types";

// --- Helper Components ---

// A reusable wrapper for each chart to standardize titles and spacing
const ChartWrapper = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="w-full bg-white rounded-xl p-4 flex flex-col items-center">
    <h2 className="text-lg font-bold text-gray-800 mb-4">{title}</h2>
    <div className="w-full h-[300px]">{children}</div>
  </div>
);

// New component for the "Y" divs to display a label and a value
const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-gray-100 p-4 rounded-lg w-full">
    {/* "up" div for the label */}
    <div className="text-sm text-gray-600">{label}</div>
    {/* "down" div for the value */}
    <div className="text-2xl font-bold text-gray-900">£{value.toLocaleString()}</div>
  </div>
);

// New component for the "X" div which contains the 5 "Y" divs (StatCards)
const StatsGrid = () => {
  // Placeholder data - you can replace this with your actual data
  const statsData = [
    { label: "Total Revenue", value: 45231 },
    { label: "Total Profit", value: 12532 },
    { label: "Ad Spend", value: 5400 },
    { label: "New Clients", value: 89 },
    { label: "Avg. Order Value", value: 508 },
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">Key Metrics</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {/* The first 4 "Y" divs in a 2x2 grid */}
        {statsData.slice(0, 4).map((stat, index) => (
          <div key={index} className="w-full sm:w-[calc(50%-0.5rem)]">
            <StatCard label={stat.label} value={stat.value} />
          </div>
        ))}
      </div>
      {/* The 5th "Y" div, centered below */}
      <div className="flex justify-center mt-4">
        <div className="w-full sm:w-[calc(50%-0.5rem)]">
          <StatCard label={statsData[4].label} value={statsData[4].value} />
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

const DashboardCharts = ({ internval, range, setotherdetails }: { internval: string; range: DateRange | undefined; setotherdetails: React.Dispatch<React.SetStateAction<Dashstats>> }) => {
  // --- State Management ---
  const [splitPerShopperData, setSplitPerShopperData] = useState([
    { name: "Alfie", revenue: 500, profit: 3200 },
    { name: "Fran", revenue: 5200, profit: 3800 },
    { name: "Lauren", revenue: 3400, profit: 2100 },
    { name: "Shania", revenue: 600, profit: 4500 },
  ]);
  const [sourceoftruth, setsourceoftruth] = useState([
    { name: "Returing client", revenue: 8500, profit: 3200 },
    { name: "B2B", revenue: 5200, profit: 3800 },
    { name: "Word of Mouth", revenue: 3400, profit: 2100 },
    { name: "Organic", revenue: 6100, profit: 4500 },
  ]);
  const [splitPerChannelData, setSplitPerChannelData] = useState([
    { name: "Shopify", revenue: 8500, profit: 3200 },
    { name: "Shoppers", revenue: 5200, profit: 3800 },
  ]);
  const [MarketingS, setMarketingS] = useState([
    { name: "Google", Conversion_Revenue: 8500, True_Profit: 3200, Conversion_Profit: 2000, total_adspend: 1000 },
    { name: "meta", Conversion_Revenue: 5200, True_Profit: 3800, Conversion_Profit: 2000, total_adspend: 1000 },
  ]);
  const [userId, setUserId] = useState<string | null>(null);

  // --- Data Fetching ---
  const fetchChartData = async (endpoint: string, params: object) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/${endpoint}`, params);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching data for ${endpoint}:`, error);
      return [];
    }
  };

  // --- Effects ---
  useEffect(() => {
    const id = localStorage.getItem("tempcred");
    setUserId(id);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchAllData = async () => {
      let params: any = { userid: userId };

      if (range?.from) {
        params.startdate = range.from;
        params.enddate = range.to || range.from;
      } else {
        params.interval = internval || "year";
      }

      const [shopperData, wonLost, other, reqWon] = await Promise.all([
        fetchChartData("splitPerShopper", params),
        fetchChartData("wonloastdata", params),
        fetchChartData("otherdetails", params),
        fetchChartData("reqwondata", params),
      ]);
      setSplitPerShopperData(shopperData);
      setMarketingS(wonLost);
      setotherdetails(other);
      setsourceoftruth(reqWon);
    };
    // fetchAllData(); // You can uncomment this when you want to fetch data
  }, [userId, internval, range, setotherdetails]);

  // --- Render Logic ---
  return (
    <div className="w-full h-auto flex flex-col lg:flex-row gap-0">
      {/* Left Column */}
      <div
        className={`w-full lg:w-1/2 h-[85vh] bg-white rounded-2xl shadow-lg overflow-y-auto 
          [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300
          dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500`}
      >
        <div className="px-1 pb-12 lg:pb-24 xl:pb-45 flex flex-col gap-8">
          <ChartWrapper title="Split per shopper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={splitPerShopperData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `£${value}`} />
                <Tooltip formatter={(value: number) => `£${value}`} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#D9D9D9" />
                <Bar dataKey="profit" name="Profit" fill="#3798A1" />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>

          <ChartWrapper title="Source of Truth">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceoftruth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#D9D9D9" />
                <Bar dataKey="profit" name="Profit" fill="#3798A1" />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>

          {/* This is the "X" div with the 5 "Y" divs inside */}
          <StatsGrid />
        </div>
      </div>

      {/* Right Column */}
      <div
        className={`w-full lg:w-1/2 h-[85vh] bg-white rounded-2xl shadow-lg overflow-y-auto
          [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300
          dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500`}
      >
        <div className="px-1 pb-12 lg:pb-24 xl:pb-45 flex flex-col gap-8">
          <ChartWrapper title="Split per Channel">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={splitPerChannelData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#D9D9D9" />
                <Bar dataKey="profit" name="Profit" fill="#3798A1" />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>

          <ChartWrapper title="Marketing Spend">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MarketingS} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Conversion_Revenue" fill="#D9D9D9" />
                <Bar dataKey="True_Profit" fill="#3798A1" />
                <Bar dataKey="Conversion_Profit" fill="#073C41" />
                <Bar dataKey="total_adspend" fill="#5A8C90" />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>

          {/* This is the "X" div with the 5 "Y" divs inside */}
          <StatsGrid />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;