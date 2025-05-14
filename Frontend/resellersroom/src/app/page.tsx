"use client";
import React from "react";
import { useIsSmallScreen } from "./Components/Small comps/Issmall";
import Dashboardheader from "./Components/Small comps/Dashboardheader";

import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const pieData = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const lineData1 = [
  { name: "Jan", uv: 400, pv: 240 },
  { name: "Feb", uv: 300, pv: 139 },
  { name: "Mar", uv: 200, pv: 980 },
  { name: "Apr", uv: 278, pv: 390 },
];
const lineData2 = [
  { name: "May", uv: 100, pv: 400 },
  { name: "Jun", uv: 500, pv: 300 },
  { name: "Jul", uv: 700, pv: 200 },
  { name: "Aug", uv: 250, pv: 600 },
];

const Page: React.FC = () => {
  const isSmallScreen = useIsSmallScreen();

  return (
    <div className="w-full h-full">
      {!isSmallScreen && <Dashboardheader />}

      {/* Top Section: Buttons + Cards */}
      <div className="w-full h-[20vh] mt-3 flex flex-col gap-2">
        {/* Buttons */}
        <div className="w-full h-[30%] flex items-center text-black gap-3 px-3 font-semibold">
          <button className="h-[80%] w-[20%] rounded-2xl shadow-md border border-black">Date Picker</button>
          <button className="h-[80%] w-[10%] rounded-2xl shadow-md border border-black">This Year</button>
          <button className="h-[80%] w-[10%] rounded-2xl shadow-md border border-black">This Month</button>
          <button className="h-[80%] w-[10%] rounded-2xl shadow-md border border-black">This Day</button>
          <button className="h-[80%] w-[10%] rounded-2xl shadow-md border border-black">Last Quarter</button>
        </div>

        {/* Info Cards */}
        <div className="w-full h-[70%] flex items-center gap-4 px-4 font-semibold">
          {[
            ["Live Update", "1234"],
            ["Live Users", "87"],
            ["New Orders", "12"],
            ["Revenue", "$1.2k"],
            ["Support Tickets", "5"],
          ].map(([title, value], i) => (
            <div key={i} className="w-[15%] h-[85%] border shadow-md text-black rounded-2xl flex flex-col">
              <div className="w-full h-[40%] flex justify-center items-center">{title}</div>
              <div className="w-full h-[60%] flex justify-center items-center">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Charts */}
      <div className="w-full h-[76vh] flex gap-4 px-4 mt-2">
        {/* Pie Chart Left */}
        <div className="w-1/2 h-full bg-white rounded-2xl flex justify-center items-center">
          <PieChart width={300} height={300}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label
              outerRadius={100}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        {/* Line Charts Right */}
        <div className="w-1/2 h-full bg-white rounded-2xl overflow-y-auto p-4">
          {[lineData1, lineData2].map((data, idx) => (
            <div key={idx} className="mb-6">
              <LineChart width={400} height={200} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="uv" stroke="#8884d8" />
                <Line type="monotone" dataKey="pv" stroke="#82ca9d" />
              </LineChart>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
