"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toggleleadsrenderstep } from "@/lib/features/Newrequest/NewRequestSlice";
import { useDispatch } from "react-redux";
import { OrderRpr } from '../Components/Small comps/Types';
import { Slinedata } from '../Components/Small comps/Types';
import ReviewEdits from '@/app/Components/OrderReview/ReviewEdits';
import { ToogleEdit,AddSelectedOrder } from '@/lib/features/OrederReview/OrderReviewSlice';
import FilterSort from '../Components/fillters/FilterSort';

const OrdersPage = () => {
    const dispatch=useDispatch()
    const [search, setSearch] = useState('');
    const [userid,setuserid]=useState<string|null>("")
    const [Orders,setOrders]=useState<OrderRpr[]|null>(null);
    const [sortBy, setSortBy] = useState<string>("");
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    const filterOptions = [
      { label: "Approved Orders", value: "approved" },
      { label: "Review Needed", value: "review" },
      { label: "Has Supplier", value: "hasSupplier" },
      { label: "Has Traffic Source", value: "hasTrafficSource" },
      { label: "Has Source of Truth", value: "hasSourceOfTruth" },
      { label: "Profitable Orders", value: "profitable" },
      { label: "Non-Profitable Orders", value: "nonProfitable" },
    ];

    const sortOptions = [
      { label: "Date (Newest)", value: "dateDesc" },
      { label: "Date (Oldest)", value: "dateAsc" },
      { label: "Highest Revenue", value: "revenueDesc" },
      { label: "Lowest Revenue", value: "revenueAsc" },
      { label: "Highest Profit", value: "profitDesc" },
      { label: "Lowest Profit", value: "profitAsc" },
    ];

    const handleFilterChange = (filters: string[]) => {
      setActiveFilters(filters);
    };

    const handleSortChange = (sort: string) => {
      setSortBy(sort);
    };

    //functions
    const getwons=async()=>{
      const re=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Review/getshopifyorders`,{
        userid:userid,
      });
     
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

    const filteredAndSortedOrders = Orders?.filter((order: OrderRpr) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = 
        order.name?.toLowerCase().includes(searchTerm) ||
        `${order.firstName} ${order.lastName}`.toLowerCase().includes(searchTerm) ||
        order.Supplier_Name?.Name?.toLowerCase().includes(searchTerm) ||
        order.Source_of_truth?.toLowerCase().includes(searchTerm) ||
        order.linedata?.some((item: Slinedata) =>
          item.title?.toLowerCase().includes(searchTerm)
        );

      const matchesFilters = activeFilters.every(filter => {
        switch (filter) {
          case "approved":
            return (order.profit ?? 0) !== 0;
          case "review":
            return (order.profit ?? 0) === 0;
          case "hasSupplier":
            return !!order.Supplier_Name?.Name;
          case "hasTrafficSource":
            return !!order.Traffic_Source;
          case "hasSourceOfTruth":
            return !!order.Source_of_truth;
          case "profitable":
            return (order.profit ?? 0) > 0;
          case "nonProfitable":
            return (order.profit ?? 0) <= 0;
          default:
            return true;
        }
      });

      return matchesSearch && matchesFilters;
    }).sort((a, b) => {
      switch (sortBy) {
        case "dateDesc":
          return new Date(b.shopifycreatedat || 0).getTime() - new Date(a.shopifycreatedat || 0).getTime();
        case "dateAsc":
          return new Date(a.shopifycreatedat || 0).getTime() - new Date(b.shopifycreatedat || 0).getTime();
        case "revenueDesc":
          return (b.Revenue || 0) - (a.Revenue || 0);
        case "revenueAsc":
          return (a.Revenue || 0) - (b.Revenue || 0);
        case "profitDesc":
          return (b.profit || 0) - (a.profit || 0);
        case "profitAsc":
          return (a.profit || 0) - (b.profit || 0);
        default:
          return 0;
      }
    });

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
        <div className="w-full h-[15vh] mt-[3vh] gap-2 flex items-start text-black">
          <div className="w-[35%] h-full flex flex-col justify-around items-start ml-4">
            <FilterSort
              title="All Orders"
              count={filteredAndSortedOrders?.length || 0}
              filterOptions={filterOptions}
              sortOptions={sortOptions}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="w-full h-[65vh] overflow-auto mt-6 overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
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
              {filteredAndSortedOrders && filteredAndSortedOrders.length > 0 && 
                filteredAndSortedOrders.map((order: OrderRpr, index: number) => (
                  <tr key={index} className={`border-b ${order.profit!=0?"text-black":"text-red-800"}  border-black align-top`}>
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
                        <div key={i} className="mb-1">£{item.costprice?.toFixed(2)}</div>
                      ))}
                    </td>

                    <td className="px-4 py-2">£{order.Revenue?.toFixed(2)}</td>
                    <td className="px-4 py-2">£{order.shipingfee?.toFixed(2)}</td>
                    <td className="px-4 py-2">£{order.processingfee?.toFixed(2)}</td>
                    <td className="px-4 py-2">£{order.profit||0}</td>
                    <td className="px-4 py-2">{order.Traffic_Source||""}</td>
                    <td className="px-4 py-2">{order.Source_of_truth||""}</td>
                    <td className="px-4 py-2">{order.Supplier_Name?.Name||""}</td>
                    <td className="px-4 py-2">
                      <span className=   {`  ${order.profit!=0?"bg-[#B7CBAF]":"text-black bg-[#D79A58]"}   px-2 py-1 rounded-full`}>
                        
                        {
                       order.profit!=0?"Approved":"Review"
                        }</span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                      onClick={()=>{
                        dispatch(AddSelectedOrder(order))
                        dispatch(ToogleEdit())
                      }}
                      className="bg-blue-500 cursor-pointer text-white px-4 py-1 rounded-full">Edit</button>
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