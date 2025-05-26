"use client"

import React, { useState, useEffect } from 'react';
import { Funnel, ArrowUpNarrowWide } from "lucide-react";
import axios from 'axios';
import { Toggleleadsrenderstep } from "@/lib/features/Newrequest/NewRequestSlice";
import { statetype, Task } from "../../Components/Small comps/Types";
import {CompleteOrderPopup } from "../../Components/Leads_panel/CompleteOrderPopup"
import { useIsSmallScreen } from "../../Components/Small comps/Issmall";
import { useDispatch } from "react-redux";
const OrdersPage = () => {
    const dispatch=useDispatch()
  const [search, setSearch] = useState('');
  const [userid,setuserid]=useState<string|null>("")
  
  //functions
const getwons=()=>{
    
}

    
  
  //useeefects

  useEffect(() => {
    dispatch(Toggleleadsrenderstep(0));
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("tempcred");
      setuserid(id);
    }
  }, []);
  useEffect(()=>{
    getwons()
  },[userid])
  return (
    <div className='w-[80vw]'>
      {/* Header */}
      <div className="w-full flex flex-col h-[10vh] lg:flex-row justify-between items-center gap-2 p-4 bg-white sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-[40px] h-[40px]">
            <img src="/images/Crm.png" className="w-full h-full" />
          </div>
          <h1 className="text-3xl font-semibold text-[#888888] dark:text-[#888888]">Orders</h1>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders"
          className="w-full lg:w-54 px-4 py-2 border-2 text-xs p-4 text-black border-gray-300 rounded-lg"
        />
      </div>

      {/* Filters and Summary */}
      <div className="w-full h-[12vh] mt-[3vh] gap-2 flex items-start text-black">
        <div className="w-[35%] h-full flex flex-col justify-around items-start ml-4">
          <div className="flex w-full h-[40%]">
            <div className="text-2xl font-bold">All Orders</div>
            <div className="text-[10px] font-extralight flex items-end ml-2">(0)</div>
          </div>
          <div className="flex  justify-start gap-8 w-full h-[60%]">
            <div className="w-[25%] h-full flex items-end">
              <div className="text-sm mb-0.5">Sort by</div>
              <ArrowUpNarrowWide />
            </div>
            <div className="w-[50%] h-full flex items-end gap-1.5">
              <div className="text-sm mb-0.5">Filter</div>
              <Funnel />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="w-full h-[71vh] overflow-auto mt-6 overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
        <table className="w-[1500px] table-auto text-sm text-left text-black border-collapse">
          <thead className="bg-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2">Order Id</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Customer Name</th>
              <th className="px-4 py-2">Order Overview</th>
              <th className="px-4 py-2">Payment Method</th>
              <th className="px-4 py-2">Revenue</th>
              <th className="px-4 py-2">Cost</th>
              <th className="px-4 py-2">Shipping Fee</th>
              <th className="px-4 py-2">Processing Fees</th>
              <th className="px-4 py-2">Profit</th>
              <th className="px-4 py-2">Traffic Source</th>
              <th className="px-4 py-2">Source of Truth</th>
              <th className="px-4 py-2">Supplier Name</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Edit</th>
            </tr>
          </thead>
          <tbody>
            {/* Dummy rows (replace with mapped data later) */}
            <tr className="border-b border-black">
              <td className="px-4 py-2">#0001</td>
              <td className="px-4 py-2">2025-01-01</td>
              <td className="px-4 py-2">John Doe</td>
              <td className="px-4 py-2">Sneakers x1</td>
              <td className="px-4 py-2">
                <span className="bg-gray-200 px-2 py-1 rounded-full">Card</span>
              </td>
              <td className="px-4 py-2">$120</td>
              <td className="px-4 py-2">$80</td>
              <td className="px-4 py-2">$10</td>
              <td className="px-4 py-2">$5</td>
              <td className="px-4 py-2">$25</td>
              <td className="px-4 py-2">Instagram</td>
              <td className="px-4 py-2">Shopify</td>
              <td className="px-4 py-2">Nike</td>
              <td className="px-4 py-2">
                <span className="bg-green-200 px-2 py-1 rounded-full">Approved</span>
              </td>
              <td className="px-4 py-2">
                <button className="bg-blue-500 text-white px-4 py-1 rounded-full">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPage;