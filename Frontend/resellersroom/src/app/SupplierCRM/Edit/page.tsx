"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/Resellerstore";
import { AddselectedSup } from "@/lib/features/Supplier/SupplierSlice";
import { Pencil } from "lucide-react";
import { Task } from "@/app/Components/Small comps/Types";
import axios from "axios";
import { useRouter } from 'next/navigation';
type Props = {};

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

function Page({}: Props) {
  const router=useRouter()
  const isSmallScreen = useIsSmallScreen();
  const [orders,setorders]=useState<Task[]>()
  const supplier = useSelector(
    (state: RootState) => state.Sup.SelectedSupplier
  );

  const getorders=async()=>{
     const o=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/Getorderofsuppliers`,{
      name:supplier.Name
     })
     console.log(o.data.data)
     setorders(o.data.data)
  }
  useEffect(()=>{
    getorders()
    if(supplier.Email=="" && supplier.Number=="")
    {
      router.push("/SupplierCRM")
    }
  },[])

  return (
    <div className="w-full h-[100vh]  flex flex-col items-center">
      {!isSmallScreen && <Header />}

      <div className="w-[95%] border-2 border-black h-[90vh] overflow-hidden  flex flex-col items-center gap-3 ">
        {/*first part */}
        <div className="flex w-full h-[25vh]">
          {/**pic and info */}
          <div className="flex-1 flex ">
            <div className="w-[50%] h-full ">
              <img
                src={supplier.image ?? "/images/Logo.png"}
                className="w-full h-full object-contain p-2"
              />
            </div>
            <div className="w-[50%] h-full flex justify-center items-center flex-col gap-2">
              <p className="font-bold text-2xl truncate text-black">
                {supplier.Name}
              </p>
              {supplier.Email && (
                <p className="text-xs text-[#4774B1] truncate">
                  {supplier.Email}
                </p>
              )}
              {supplier.Number && (
                <p className="text-xs text-[#4774B1] truncate">
                  {supplier.Number}
                </p>
              )}
              {supplier.Website && (
                <p className="text-xs text-[#4774B1] truncate">
                  {supplier.Website}
                </p>
              )}
              <button className=" w-[34%] h-[15%] bg-[#4774B1] flex justify-around items-center rounded-lg cursor-pointer">
                <div className="text-white text-sm">Edit</div>
                <Pencil size={12} />
              </button>
            </div>
          </div>

          {/**Total Orders */}
          <div className="flex-1 flex justify-center items-center t">
            <div className="w-[60%] h-[45%] rounded-2xl bg-[#F3F3F3] text-2xl font-bold text-black flex justify-center items-center">
              50
            </div>
          </div>
          {/**Total spen */}
          <div className="flex-1 flex justify-center items-center s">
            <div className="w-[60%] h-[45%] rounded-2xl bg-[#F3F3F3] text-2xl text-black font-bold flex justify-center items-center">
              £ 1500
            </div>
          </div>
        </div>

        {/**divider */}
        <div className="w-[80%] h-[3px]  bg-gray-300"></div>

        {/**Brands */}
        <div className="w-full h-[10vh]   ">
          <div className=" w-[40%]  h-[4vh] text-xl text-black ml-3 flex justify-start items-center gap-4">
            <div className="">Brand</div>
            <button className=" w-[15%] h-[95%] bg-[#4774B1] flex justify-around items-center rounded-lg cursor-pointer">
              <div className="text-white text-sm">Edit</div>
              <Pencil size={12} className=" text-white" />
            </button>
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

         {/**divider */}
        <div className="w-[80%] h-[3px]  bg-gray-300"></div>


       
{/* Orders section */}
<div className="w-full h-[] flex flex-col gap-2 px-4 py-9">
  <h2 className="text-xl font-bold text-black">Orders</h2>

  <div className="w-full h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 rounded-lg p-3">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
      {orders && orders.length > 0 ? (
        orders.map((order) => (
          <div
            key={order._id}
            className="bg-white shadow-md rounded-lg border border-gray-200 p-4 flex flex-col gap-2"
          >
            <h3 className="text-lg font-semibold text-[#4774B1] truncate">
              {order.Name}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              Condition: {order.condition}
            </p>
            <p className="text-sm text-gray-600 truncate">
              Size: {order.size}
            </p>
            <p className="text-sm text-gray-600 truncate">
              Stage: {order.stage}
            </p>
            <p className="text-sm text-gray-600 truncate">
              Created: {new Date(order.createdAt).toLocaleDateString()}
            </p>
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
