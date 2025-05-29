"use client"

import React, { useState, useEffect } from 'react';
import { Funnel, ArrowUpNarrowWide } from "lucide-react";
import axios from 'axios';
import { Toggleleadsrenderstep } from "@/lib/features/Newrequest/NewRequestSlice";
import { statetype, Task } from "../Components/Small comps/Types";
import {CompleteOrderPopup } from "../Components/Leads_panel/CompleteOrderPopup"
import { useIsSmallScreen } from "../Components/Small comps/Issmall";
import { useDispatch } from "react-redux";
import { OrderRpr } from '../Components/Small comps/Types';
import { Slinedata } from '../Components/Small comps/Types';
import ReviewEdits from '@/app/Components/OrderReview/ReviewEdits';
import { UseDispatch,useSelector } from 'react-redux';
import { RootState } from '@/lib/Resellerstore';
import { ToogleEdit,AddSelectedOrder } from '@/lib/features/OrederReview/OrderReviewSlice';

const OrdersPage = () => {
    const dispatch=useDispatch()
  const [search, setSearch] = useState('');
  const [userid,setuserid]=useState<string|null>("")
  const [Orders,setOrders]=useState<OrderRpr[]|null>(null);

  //functions
const getwons=async()=>{
  const re=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/customers/getshopifyorders`,{
    userid:userid,
  });
  console.log(re)
  setOrders(re.data.data)
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
    if(userid){
    getwons()}
  },[userid])


  return (
    <div className='w-[80vw]'>
      <ReviewEdits getwons={getwons}/>
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
    <div className="flex justify-start gap-8 w-full h-[60%]">
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
              <th className="px-4 py-2">Cost</th>
              <th className="px-4 py-2">Revenue</th>
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
    {Orders && Orders.length > 0 && Orders.map((order: OrderRpr, index: number) => (
  <tr key={index} className="border-b border-black align-top">
    <td className="px-4 py-2">{order.name}</td>
    <td className="px-4 py-2">{order.shopifycreatedat?.toString()?.split("T")[0]}</td>
    <td className="px-4 py-2">{`${order.firstName} ${order.lastName}`}</td>

    {/* Line Items Title */}
    <td className="px-4 py-2">
      {order.linedata?.map((item:Slinedata, i:number) => (
        <div key={i} className="mb-1">{item.title} x{item.quantity}</div>
      ))}
    </td>

    {/* Line Items Cost */}
    <td className="px-4 py-2">
      {order.linedata?.map((item:Slinedata, i:number) => (
        <div key={i} className="mb-1">${item.costprice?.toFixed(2)}</div>
      ))}
    </td>

    <td className="px-4 py-2">${order.Revenue?.toFixed(2)}</td>
    <td className="px-4 py-2">${order.shipingfee?.toFixed(2)}</td>
    <td className="px-4 py-2">${order.processingfee?.toFixed(2)}</td>
    <td className="px-4 py-2">${order.profit||0}</td>
    <td className="px-4 py-2">${order.Traffic_Source||""}</td>
    <td className="px-4 py-2">${order.Source_of_truth||""}</td>
    <td className="px-4 py-2">${order.Supplier_Name||""}</td>
    <td className="px-4 py-2">
      <span className=   {`  ${order.shipingfee!=0 && order.processingfee!=0?"bg-[#B7CBAF]":"bg-[#D79A58]"}   px-2 py-1 rounded-full`}>
        
        {
        order.shipingfee!=0 && order.processingfee!=0?"Approved":"Review"
        }</span>
    </td>
    <td className="px-4 py-2">
      <button
      onClick={()=>{
        dispatch(AddSelectedOrder(order))
        dispatch(ToogleEdit())
      }}
      className="bg-blue-500 text-white px-4 py-1 rounded-full">Edit</button>
    </td>
  </tr>
))}

        
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPage;