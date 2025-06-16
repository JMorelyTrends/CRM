"use client"

import React, { useState, useEffect } from 'react';
import { Funnel, ArrowUpNarrowWide } from "lucide-react";
import axios from 'axios';
import { Addselectedcusotmer, Toggleleadsrenderstep } from "@/lib/features/Newrequest/NewRequestSlice";
import { Task,StockXItem,additem } from "../../Components/Small comps/Types";
import {CompleteOrderPopup } from "../../Components/Leads_panel/CompleteOrderPopup"
import { TaskPanel } from '@/app/Components/Leads_panel/TaskPanel';
import { useDispatch } from "react-redux";
import CustomDateRangePicker from "../.././Components/Dashboard/CustomDateRangePicker";
import { DateRange } from "react-day-picker";
import { ToogleCompleteorder } from "@/lib/features/OrederReview/OrderReviewSlice";
import FilterSort from '../../Components/fillters/FilterSort';

const OrdersPage = () => {
    const dispatch=useDispatch()
    const [search, setSearch] = useState('');
    const [userid,setuserid]=useState<string|null>("")
    const [Orders,setOrders]=useState<Task[]|null>(null);
    const [active, setactive] = useState<string>("year");
    const [range, setRange] = React.useState<DateRange | undefined>();
    const [internval, setinternval] = useState<string>("");
    const [Unfulfilled,setUnfulfilled]=useState<number>(0)
    const [tprofit,settprofit]=useState<number>(0)
    const [selectedtask,setselectedtask]=useState<Task|null>(null)
    const [wonpopup,setwonpopup]=useState<boolean>(false);
    const [panelopen,setpanelopen]=useState<boolean>(false);
    const [sortBy, setSortBy] = useState<string>("");
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    const filterOptions = [
      { label: "Approved Orders", value: "approved" },
      { label: "In Progress", value: "inProgress" },
      { label: "Has Supplier", value: "hasSupplier" },
      { label: "Has Source of Truth", value: "hasSourceOfTruth" },
      { label: "Has Shipping Fee", value: "hasShippingFee" },
      { label: "Has Processing Fee", value: "hasProcessingFee" },
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
      { label: "Highest Cost", value: "costDesc" },
      { label: "Lowest Cost", value: "costAsc" },
    ];

    const handleFilterChange = (filters: string[]) => {
      setActiveFilters(filters);
    };

    const handleSortChange = (sort: string) => {
      setSortBy(sort);
    };

    const calculateProfit = (order: Task) => {
      if (!order.sellprice || !order.price || !order.Shippingfee || !order.processingfee) return 0;
      return order.sellprice - order.price - parseFloat(order.Shippingfee) - parseFloat(order.processingfee);
    };

    //functions
    const getwons=async()=>{
        if (range && range.from === range.to) {
      const re=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/getordersfortabel`,{
        internval: internval ? internval : "today",
            userid: userid,
      });
      
    console.log(re.data.data)
      setOrders(re.data.data)
      setUnfulfilled(re.data.unfulfilled)
      settprofit(re.data.profit)
    }
    else if (range){
      const re=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/getordersfortabel`,{
        startdate: range.from,
            enddate: range.to,
            userid: userid,
      });
      

      setOrders(re.data.data)
      setUnfulfilled(re.data.unfullfilled)
      settprofit(re.data.profit)
    }
    else{
     const re=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/getordersfortabel`,{
        internval: internval ? internval : "year",
            userid: userid,
      });
      setOrders(re.data.data)
      setUnfulfilled(re.data.unfulfilled)
      settprofit(re.data.profit)
    }
    }
   

    const Editoptions=(order:Task)=>{
      setselectedtask(order)
      dispatch(Addselectedcusotmer(order))

      if(order.confirm){
        setwonpopup(true)
        dispatch(ToogleCompleteorder())
      }
      else{
        setpanelopen(true)
      }
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
    },[userid,internval,range])

    const filteredAndSortedOrders = Orders?.filter((order: Task) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = 
        order._id?.toLowerCase().includes(searchTerm) ||
        order.Name?.toLowerCase().includes(searchTerm) ||
        order.phone?.toLowerCase().includes(searchTerm) ||
        order.Sourceofthruth?.toLowerCase().includes(searchTerm) ||
        order.Supplierid?.Name?.toLowerCase().includes(searchTerm) ||
        order.items?.some((item: additem) => item.Name?.toLowerCase().includes(searchTerm)) ||
        order.stockxitem?.some((item: StockXItem) => item.name?.toLowerCase().includes(searchTerm));

      const matchesFilters = activeFilters.every(filter => {
        switch (filter) {
          case "approved":
            return order.confirm && parseFloat(order.Shippingfee || "0") > 0 && parseFloat(order.processingfee || "0") > 0;
          case "inProgress":
            return !order.confirm || parseFloat(order.Shippingfee || "0") === 0 || parseFloat(order.processingfee || "0") === 0;
          case "hasSupplier":
            return !!order.Supplierid?.Name;
          case "hasSourceOfTruth":
            return !!order.Sourceofthruth;
          case "hasShippingFee":
            return parseFloat(order.Shippingfee || "0") > 0;
          case "hasProcessingFee":
            return parseFloat(order.processingfee || "0") > 0;
          case "profitable":
            return order.sellprice && order.price && order.Shippingfee && order.processingfee && 
                   (order.sellprice - order.price - parseFloat(order.Shippingfee) - parseFloat(order.processingfee)) > 0;
          case "nonProfitable":
            return order.sellprice && order.price && order.Shippingfee && order.processingfee && 
                   (order.sellprice - order.price - parseFloat(order.Shippingfee) - parseFloat(order.processingfee)) <= 0;
          default:
            return true;
        }
      });

      return matchesSearch && matchesFilters;
    }).sort((a, b) => {
      switch (sortBy) {
        case "dateDesc":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "dateAsc":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "revenueDesc":
          return (b.sellprice || 0) - (a.sellprice || 0);
        case "revenueAsc":
          return (a.sellprice || 0) - (b.sellprice || 0);
        case "profitDesc":
          return calculateProfit(b) - calculateProfit(a);
        case "profitAsc":
          return calculateProfit(a) - calculateProfit(b);
        case "costDesc":
          return (b.price || 0) - (a.price || 0);
        case "costAsc":
          return (a.price || 0) - (b.price || 0);
        default:
          return 0;
      }
    });

    return (
      <div className='w-[80vw]'>
        {/* <ReviewEdits getwons={getwons}/>
    */}

      { selectedtask&&<CompleteOrderPopup fetchallorders={getwons} open={wonpopup} setOpen={setwonpopup} task={selectedtask} update={true} />}
      {selectedtask&&<TaskPanel   setopenlabeldialog={()=>false}  openlabeldialog={false} open={panelopen} setOpen={setpanelopen} task={selectedtask} fetchallorders={getwons}  />}
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
      <div className="w-full h-[10vh]  flex items-center  overflow-hidden text-black gap-3 px-3 font-semibold">
            <CustomDateRangePicker
             active={active}
             setactive={setactive}
              range={range}
              setRange={setRange}
            />
            <button
              onClick={() => {
                setactive("year");
                setinternval("year");
              }}
              className={`h-[80%] w-[10%] cursor-pointer rounded-2xl shadow-md border border-black ${
                active === "year" ? "bg-black text-white" : ""
              }`}
            >
              This Year
            </button>

            <button
              onClick={() => {
                setactive("week");
                setinternval("week");
              }}
              className={`h-[80%] w-[10%] cursor-pointer rounded-2xl shadow-md border border-black ${
                active === "week" ? "bg-black text-white" : ""
              }`}
            >
              This Month
            </button>

            <button
              onClick={() => {
                setactive("day");
                setinternval("day");
              }}
              className={`h-[80%] w-[10%] cursor-pointer rounded-2xl shadow-md border border-black ${
                active === "day" ? "bg-black text-white" : ""
              }`}
            >
              This Day
            </button>
            {/* <button onClick={()=>setinternval("year")} className="h-[80%] w-[10%] rounded-2xl shadow-md border border-black">Last Quarter</button> */}
          </div>
        {/* Filters and Summary */}
        <div className="w-full h-[13vh] mt-[3vh] gap-2 flex items-start text-black">
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

          <div className="w-[65%] h-full flex items-center justify-end gap-4 pr-6">
            {/* Capsule 1 */}
            <div className="w-[130px] h-[80%] text-center bg-gray-200 rounded-full flex flex-col justify-between p-2 shadow-sm">
              <div className="text-xs font-semibold text-gray-600">Total Orders</div>
              <div className="text-lg font-bold text-black">{Orders?.length||0}</div>
            </div>

            {/* Capsule 2 */}
            <div className="w-[130px] h-[80%] bg-gray-200 text-center rounded-full flex flex-col justify-between p-2 shadow-sm">
              <div className="text-xs font-semibold text-gray-600">Unfulfilled Orders</div>
              <div className="text-lg font-bold text-black">{Unfulfilled||0}</div>
            </div>

            {/* Capsule 3 */}
            <div className="w-[130px] h-[80%] bg-gray-200 rounded-full text-center flex flex-col justify-between p-2 shadow-sm">
              <div className="text-xs font-semibold text-gray-600">Total Profit</div>
              <div className="text-lg font-bold text-black">${tprofit||0}</div>
            </div>
          </div>
        </div>


         

        {/* Orders Table */}
        <div className="w-full h-[60vh] overflow-auto mt-6 overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
          <table className="w-[1500px] table-auto text-sm text-left text-black border-collapse text-nowrap ">
            <thead className="bg-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2">Order Id</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Customer Name</th>
                <th className="px-4 py-2">Number</th>
                <th className="px-4 py-2">Order Overview</th>
                <th className="px-4 py-2">Cost</th>
                <th className="px-4 py-2">Revenue</th>
               
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
       filteredAndSortedOrders.map((order: Task, index: number) => (
         <tr key={index} className="border-b border-black align-top ">
           <td className="px-4 py-2 truncate max-w-[60px]">{order._id || "N/A"}</td>
           <td className="px-4 py-2 ">{order.createdAt?.split("T")[0] || "N/A"}</td>

           {/* Customer Name */}
           <td className="px-4 py-2 truncate ">
             {order.Name || "Unlinked"}
           </td>
          
           <td  className="px-4 py-2 ">
            {order?.phone||"n/A"}
           </td>

           {/* Order Overview from items or stockxitem */}
           <td className="px-4 py-2 truncate max-w-[100px]">
             {(order.items&&order.items?.length > 0
               ? order.items.map((item: additem, i: number) => (
                   <div key={i} className="mb-1">{item.Name || "Unnamed"} </div>
                 ))
               : order.stockxitem?.length > 0
               ? order.stockxitem.map((item: StockXItem, i: number) => (
                   <div key={i} className="mb-1">{item.name || "Unnamed"} </div>
                 ))
               :<div>No Items</div>
             )}
           </td>

           {/* Cost (price) */}
           <td className="px-4 py-2 truncate ">£{order.price?.toFixed(2) || "0.00"}</td>

           {/* Revenue (assuming calculated from price or not present) */}
           <td className="px-4 py-2">£{order.sellprice?.toFixed(2) || "0.00"}</td>

           {/* Profit (price - fees as an example calculation) */}
           <td className="px-4 py-2">
           £{ order.sellprice && order.price && order.Shippingfee && order.processingfee? ` ${(
               order.sellprice -  //revenue
               order.price-       //cost price
               parseFloat(order.Shippingfee || "0") -  //shipping fee
               parseFloat(order.processingfee || "0") //processing fee
               
             ).toFixed(2)}`:""}
           </td>

          <td className="px-4 py-2">
        <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800 text-xs whitespace-nowrap">
          { "Shopify"}
        </span>
         </td>

    <td className="px-4 py-2">
      <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800 text-xs whitespace-nowrap">
        {order.Sourceofthruth || "N/A"}
      </span>
    </td>

    <td className="px-4 py-2">
      <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800 text-xs whitespace-nowrap">
        {order?.Supplierid?.Name || "N/A"}
      </span>
    </td>

          {/* Status */}
          <td className="px-4 py-2">
            <span className={
              order.confirm
                ? "bg-[#B7CBAF] px-2 py-1 rounded-full"
                : "bg-[#D79A58] px-2 py-1 rounded-full"
            }>
              {parseFloat(order.Shippingfee || "0") > 0 && parseFloat(order.processingfee || "0") > 0
                ? "Approved"
                : "in progress"}
            </span>
          </td>

          {/* Edit Button */}
          <td className="px-4 py-2">
            <button
              onClick={() => {
                Editoptions(order) 
               
              }}
              className="bg-blue-500 text-white px-4 py-1 rounded-full"
            >
              Edit
            </button>
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