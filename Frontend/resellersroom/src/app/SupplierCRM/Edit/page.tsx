"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/Resellerstore";
import { Pencil,Store } from "lucide-react"
import { Supplier, Task } from "@/app/Components/Small comps/Types";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { format, toZonedTime } from 'date-fns-tz';
import UpSup from "@/app/Components/Suppliers/UpSup";
import {  useDispatch} from 'react-redux';
import {AddselectedSup} from '@/lib/features/Supplier/SupplierSlice'
import { Toggleleadsrenderstep } from "@/lib/features/Newrequest/NewRequestSlice";

const Header = () => {
  return (
    <>
      <div className="w-full flex flex-col h-[10vh] lg:flex-row justify-between items-center gap-2 p-4 bg-white  sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-[40px] h-[40px]">
            <img src="/images/supplier.png" className=" w-full h-full" />
          </div>
          <h1 className=" text-3xl font-semibold text-[#888888] dark:text-[#888888]">
            Supplier CRM
          </h1>
        </div>
      </div>
    </>
  );
};
function useIsSmallScreen() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isSmallScreen;
}

function Page() {
  const dispatch=useDispatch()
  const router=useRouter()
  const isSmallScreen = useIsSmallScreen();
  const [orders,setorders]=useState<Task[]>()
  const [total_spent,settotal_spent]=useState<number>(0)
  const [Newopen,setNewopen]=useState<boolean>(false)
  const [supplier,setsupplier]=useState<Supplier>()
  const [userid,setuserid]=useState<string|null>("")

  useEffect(() => {
    dispatch(Toggleleadsrenderstep(0));
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("tempcred");
      setuserid(id);
    }
  }, []);
  const s = useSelector(
    (state: RootState) => state.Sup.SelectedSupplier
  );

  useEffect(()=>{
     if(s)
     {
      setsupplier(s)
     }
  },[s])

  const getorders=async()=>{
    if(supplier&&supplier._id)
    { const o=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/Getorderofsuppliers`,{
      name:supplier._id
      
     })
   
     setorders(o.data.data)
     settotal_spent(o.data.spend)}
  }
  useEffect(()=>{
   
    if(supplier&& supplier.Email=="" && supplier.Number=="")
    {
      router.push("/SupplierCRM")
    }
    else{
       getorders()
    }
  },[supplier])
 const formatDate = (dateString: string) => {
  const timeZone = 'Europe/London'; // or your desired timezone
  const zonedDate = toZonedTime(dateString, timeZone);
  return format(zonedDate, "d MMM 'at' h:mm a");
};

  return (
    <div className="w-[80vw] h-[100vh]  flex flex-col items-center ">
      {!isSmallScreen && <Header />}

     <UpSup
      open={Newopen}
     setOpen={setNewopen}

     />
      <div className="w-[95%] border-2 border-black h-[90vh] overflow-hidden  flex flex-col items-center gap-1 ">
        {/*first part */}
        <div className="flex w-full h-[25vh]">
          {/**pic and info */}
          <div className="flex-1 flex ">
            <div className="w-[50%] h-full ">
              <img
                src={supplier&&supplier.image?supplier.image : "/images/Logo.png"}
                className="w-full h-full object-contain p-2"
              />
            </div>
            <div className="w-[50%] h-full flex justify-center  items-start flex-col gap-0">
              <p className="font-bold text-2xl truncate text-black">
                {supplier&&supplier.Name}
              </p>
              {supplier&&supplier.Email && (
                <p className="text-sm font-semibold  text-[#4774B1] truncate">
                  {supplier&&supplier.Email}
                </p>
              )}
              {supplier&&supplier.Number && (
                <p className="text-sm font-semibold text-[#4774B1] truncate">
                  {supplier&&supplier.Number}
                </p>
              )}
              {supplier&&supplier.Website && (
                <p className="text-sm font-semibold text-[#4774B1] truncate">
                  {supplier&&supplier.Website}
                </p>
              )}
              <button
              onClick={()=>setNewopen(true)}
              className=" w-[34%] h-[15%] bg-[#4774B1] flex justify-around items-center rounded-lg mt-2 cursor-pointer">
                <div className="text-white text-sm">Edit</div>
                <Pencil size={12} />
              </button>
            </div>
          </div>

          {/**Total Orders */}
          <div className="flex-1 flex flex-col  justify-center items-center ">
          
            <div className="w-[60%] h-[45%] rounded-2xl bg-[#F3F3F3] text-xl font-bold text-black flex flex-col justify-center items-center">

                <div className="text-lg font-semibold">Orders</div>
             <div className=""> {orders&&orders?.length>0?orders?.length:0}</div>
            </div>
          </div>
          {/**Total spen */}
          <div className="flex-1 flex flex-col  justify-center items-center ">
          
            <div className="w-[60%] h-[45%] rounded-2xl bg-[#F3F3F3] text-xl font-bold text-black flex flex-col justify-center items-center">

                <div className="text-lg font-semibold">Total Spend</div>
             <div className=""> £ {total_spent}</div>
            </div>
          </div>


        </div>

        
        {/**Brands */}
        <div className="w-full h-[10vh]   ">
          <div className=" w-[40%]  h-[4vh] text-xl text-black ml-3 flex justify-start items-center gap-4">
            <div className="">Brand</div>
            
          </div>
          <div className="w-full h-[6vh] overflow-x-auto flex items-center gap-2 px-2 whitespace-nowrap">
            {supplier &&
              supplier?.Brand &&
              supplier?.Brand.map((brand, index) => (
                <span
                  key={index}
                  className="bg-gray-300 text-black text-xs px-3 py-1 rounded-full"
                >
                  {brand}
                </span>
              ))}
          </div>
        </div>

        


       
{/* Orders section */}
<div className="w-full flex flex-col gap-2 px-4 py-4 flex-1 min-h-0">
  <h2 className="text-xl font-bold text-black">Orders</h2>

  <div className="w-full flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 rounded-lg p-3">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10 w-full">
      {orders && orders.length > 0 ? (
        orders.map((order) => (
          <div
            key={order._id}
            className="bg-white shadow-md rounded-lg border border-gray-200 flex flex-col gap-2"
            style={{ width: "100%", height: "200px" }}
          >
            <div className="text-black px-4 py-2.5 text-sm flex items-center justify-between border-b border-gray-100">
              <div className="text-gray-600 whitespace-nowrap">
                {formatDate(order.createdAt)}
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 whitespace-nowrap">
                from <Store size={14} strokeWidth={0.75} /> online store
              </div>
            </div>

            <div className="flex px-4 gap-4 flex-1 overflow-hidden">
              <div className="w-[120px] h-[120px] shrink-0">
                <img
                 src={
                     order?.stockxitem?.[0]?.image ??
                     order?.items?.[0]?.itempics ??
                     "/images/Logo.png"
                   }
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 flex flex-col justify-around min-w-0 overflow-hidden">
                <div className="text-xl font-bold text-black line-clamp-2 break-words">
                  {order.Name ? order.Name : "N/A"}
                </div>
                <div className="text-sm text-gray-600 line-clamp-2">
                  {order.shippingaddress ? order.shippingaddress : "N/A"}
                </div>
                <div className="font-bold text-lg text-[#4774B1]">
                  £ {order.price && order.sellprice && order.Shippingfee && order.processingfee ?  order.sellprice-order.price - parseFloat (order.Shippingfee )- parseFloat(order.processingfee)  : "N/A"} Profits
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No orders available.</p>
      )}
    </div>
  </div>
</div>










      </div>
    </div>
  );
}

export default Page;
