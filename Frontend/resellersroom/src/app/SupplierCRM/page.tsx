"use client";
import React,{useEffect,useState} from "react";
import {ArrowUpNarrowWide,Funnel } from "lucide-react"
import NewSup from "../Components/Suppliers/NewSup";
import axios from "axios";
import BrandSelector from "../Components/Suppliers/BrandSelector";
import { Sup } from "../Components/Small comps/Types";
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {  useDispatch, useSelector } from 'react-redux';
import { RootState } from "@/lib/Resellerstore";
import {AddselectedSup} from '@/lib/features/Supplier/SupplierSlice'
  type pageProps = object;
 
  type hprops={
    search:string,
    setsearch:React.Dispatch<React.SetStateAction<string>>
  }


  const Header=(props:hprops)=>{
    
    return(
        < >   
            <div className="w-full flex flex-col h-[10vh] lg:flex-row justify-between items-center gap-2 p-4 bg-white  sticky top-0 z-40">
                <div className="flex items-center gap-2.5">
               
                        <div className="w-[40px] h-[40px]">
                            <img src="/images/supplier.png" className=" w-full h-full" />
                        </div>
                       <h1 className=" text-3xl font-semibold text-[#888888] dark:text-[#888888]">Supplier CRM</h1>
                             
                       </div>
            
               <input
                 type="text"
                 value={props.search}
                 onChange={(e)=>{
                   props.setsearch(e.target.value)
                 }}
                 placeholder="Search by customer and product "
                 className="w-full lg:w-54 px-4 py-2 border-2 text-xs p-4 text-black border-gray-300 rounded-lg "
               />
             </div>
        
        </>
    )
  }



const page: React.FC<pageProps> = () => {
  const dispatch=useDispatch()
  const router = useRouter();
  const [suppliers,setsuppliers]=useState<Sup[]>();

  const getallsups=async()=>{
  const all=await axios.get(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/supplier/getallsuppliers`);
  console.log(all)
  setsuppliers(all.data.supps)
  }
  useEffect(()=>{
    getallsups()
  },[])
    
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
  const isSmallScreen=useIsSmallScreen();
 
  const [search,setsearch ]=useState<string>("")
  const [Newopen,setNewopen]=useState<boolean>(false)

  return (
    <>
      <div className="w-[80vw] h-[100vh]  flex flex-col">
     {/**popups */}

     <NewSup
     Newopen={Newopen}
     setNewopen={setNewopen}
     />

        {/**Header */}

        { !isSmallScreen&& <Header
             search={search}
             setsearch={setsearch}
        />}

        {/*ADD new Supplier */}
        <div className="w-full h-[8vh] mt-[2vh] bg-white flex justify-items-start items-end">
            <button
            className="lg:w-[25%]  h-full ml-5 bg-[#454545] text-white font-bold rounded-2xl cursor-pointer hover:border-black"
            onClick={()=>{
                setNewopen(true)
            }}
            >
              Add New Suplier
            </button>
        </div>
         

          {/*Fillters */}
          <div className="w-full h-[12vh] mt-[3vh]  flex flex-col justify-between items-start text-black">
                  
                  <div className=" w-[40vw] h-full flex ml-13 flex-col justify-around items-start ">
                    <div className="flex w-full h-[40%]">
                    <div className="tex-3xl font-bold">All Suppliers</div>
                    <div className="text-[10px] font-extralight flex items-end"><div className="">(250)</div></div>
                   </div>

                   <div className="flex justify-start gap-8 w-full h-[60%]  ">

                             <div className="w-[10%] h-full  flex items-end gap-1.5 ">
                                   <div className="text-sm mb-0.5">
                                    sortby
                                   </div>
                                   <div className="">
                                   <ArrowUpNarrowWide />
                                   </div>
                                </div>       
                                <div className="w-[10%] h-full  flex items-end gap-1.5 ">
                                   <div className="text-sm mb-0.5">
                                    fillter
                                   </div>
                                   <div className="">
                                   <Funnel />
                                   </div>
                                </div>                          
        
                   </div>
                   
                  </div>

          </div>



{/* Cards Container */}
<div className="w-full h-[65vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 
    [&::-webkit-scrollbar]:w-1
    [&::-webkit-scrollbar-track]:bg-gray-100
    [&::-webkit-scrollbar-thumb]:bg-black
    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
  {
    suppliers && suppliers.length > 0 &&
    suppliers.map((data: Sup, index: number) => {
      return (
        <div key={index} className="relative w-full h-[190px] bg-white rounded-lg flex flex-col p-3 text-black shadow hover:shadow-lg transition">
          <button
            onClick={() => {
              dispatch(AddselectedSup(data))
              router.push('/SupplierCRM/Edit');
            }}
            className="absolute top-2 right-2 p-2 rounded-2xl bg-[#4774B1] hover:bg-gray-600 text-white flex text-sm items-center gap-1"
          >
            <Pencil size={12} />
          </button>
          {/* Upper Half */}
          <div className="w-full h-[65%] flex gap-3">
            {/* Image */}
            <div className="w-1/2 h-full flex items-center justify-center">
              <img
                src={data.image ?? '/images/Logo.png'}
                alt="Supplier"
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>

            {/* Details */}
            <div className="w-1/2 flex flex-col justify-start gap-1 text-lg font-semibold">
              <p className="font-bold text-2xl truncate">{data.Name}</p>
              {data.Email && (
                <p className="text-xs text-[#4774B1] truncate">{data.Email}</p>
              )}
              {data.Number && (
                <p className="text-xs text-[#4774B1] truncate">{data.Number}</p>
              )}
              {data.Website && (
                <p className="text-xs text-[#4774B1] truncate">{data.Website}</p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300 my-1 text-sm">
            key Brands
          </div>

          {/* Brand Capsules */}
          {data.Brand && data.Brand.length > 0 && (
            <div className="w-full flex flex-wrap gap-2">
              {/* Show only the first 3 brands, then show '...more' */}
              {data.Brand.slice(0, 2).map((b, index) => (
                <div
                  key={index}
                  className="bg-gray-300 text-xs px-3 py-1 rounded-full text-black font-medium"
                >
                  {b}
                </div>
              ))}
              {/* Show "more" if there are more than 3 brands */}
              {data.Brand.length > 3 && (
                <div className="bg-gray-300 text-xs px-3 py-1 rounded-full text-black font-medium">
                  ...more
                </div>
              )}
            </div>
          )}
        </div>
      );
    })
  }
</div>





      </div>
    </>
  );
};
export default page;
