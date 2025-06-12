"use client"
import React,{useState,useEffect} from 'react'
import {ArrowUpNarrowWide,Funnel } from "lucide-react"
import axios from 'axios'
import { Customerprop } from '../Components/Small comps/Types'
import EditPopup from '../Components/Customer/Editpopup'
import { useDispatch } from "react-redux";
import {AddCustomers,AddSelectedCustomer,Toogle_Editopen,Toogle_Newcus, Toogle_Newcuscrm} from "../../lib/features/CustomerCrm/CustomerCrmslice"
import NewCustomerFormUI from '../Components/Customer/NewCustomerFormUI'
import { IShopifyCustomer } from '../Components/Small comps/Types'
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Addselectedcusotmer, Toggleleadsrenderstep } from '@/lib/features/Newrequest/NewRequestSlice'
import { AddOrderid } from '@/lib/features/OrederReview/OrderReviewSlice'

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
                            <img src="/images/Crm.png" className=" w-full h-full" />
                        </div>
                       <h1 className=" text-3xl font-semibold text-[#888888] dark:text-[#888888]">Customer CRM</h1>
                             
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


const Page = () => {
        const dispatch=useDispatch();
        const isSmallScreen=useIsSmallScreen();

        const [search,setsearch ]=useState<string>("")
        const [userid, setuserid] = useState<string | null>("");
        const [custo,setcusto]=useState<IShopifyCustomer[]|null>(null)
        const [noofcus,setnoofcus]=useState<number>(0);
        const [Klaviyop,setKlaviyop]=useState<number>(0)
      
        //functions
        const getcustomers=async()=>{
        try
          {  const re=await axios.post( `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/customers/getAllCustomers`,
          {
            userid: userid,
          })
          setcusto(re.data.Customers)
          
          setnoofcus(re.data.totalCustomers);
          dispatch(AddCustomers(re.data.customers))
          setKlaviyop(re.data.optin)
        }
        catch(e){
          console.log("something wrong with customer fetching",e)
        }
        }

        //useeffects
        useEffect(() => {
          
            if (typeof window !== "undefined") {
              const id = localStorage.getItem("tempcred");
              setuserid(id);
              dispatch(Addselectedcusotmer(0))
              dispatch(AddOrderid(""))
              dispatch(Toggleleadsrenderstep(0))
            }

          }, []);

        useEffect(()=>{
          if(userid!==""){
          getcustomers()}
        },[userid,search])
        
      useEffect(() => {
  if (userid !== "") {
    getcustomers();
  }
}, []);

  return (
    <div className=' w-[80vw]'>
         { !isSmallScreen&& <Header
             search={search}
             setsearch={setsearch}
        />}

        <EditPopup
        method='crm'
        getcustomers={getcustomers}
        />
        <NewCustomerFormUI getcustomers={getcustomers}/>
                {/*ADD new Supplier */}
        <div className="w-full h-[8vh] mt-[2vh] bg-white flex justify-items-start items-end">
            <button
            className="lg:w-[25%]  h-full ml-5 bg-[#454545] text-white font-bold rounded-2xl cursor-pointer hover:border-black"
            onClick={()=>{
          dispatch(  Toogle_Newcuscrm())
            }}
            >
              Add New Customer
            </button>
        </div>
 
        
          {/*Fillters */}

          <div className="w-full h-[12vh] mt-[3vh] gap-2  flex    items-start text-black">
                  
                  <div className=" w-[15%]  h-full flex ml-13 flex-col justify-around items-start ">
                    <div className="flex w-full h-[40%]">
                    <div className="tex-3xl font-bold">All Customer</div>
                    <div className="text-[10px] font-extralight flex items-end"><div className="">({noofcus})</div></div>
                   </div>

                   <div className="flex justify-start gap-8 w-full h-[60%]   ">

                             <div className="w-[50%] h-full  flex items-end ">
                                   <div className="text-sm mb-0.5">
                                    sortby
                                   </div>
                                   <div className="">
                                   <ArrowUpNarrowWide />
                                   </div>
                                </div>       
                                <div className="w-[50%] h-full  flex items-end gap-1.5 ">
                                   <div className="text-sm mb-0.5">
                                    fillter
                                   </div>
                                   <div className="">
                                   <Funnel />
                                   </div>
                                </div>   
                                            
        
                   </div>
                   
                  </div>

                  <div className="w-[70%] flex justify-around h-full items-center ">

                    <div className="w-[30%] h-[90%] bg-[#F3F3F3] rounded-xl flex flex-col justify-center items-center">
                              <div className="w-full h-[30%] text-center text-xl font-bold">
                                Total Customers
                              </div>
                              <div className="w-full h-[70%] text-xl font-bold text-center flex items-end justify-center ">
                                {noofcus}
                              </div>
                    </div>
 
                    <div className="w-[30%] h-[90%] bg-[#F3F3F3] rounded-xl flex flex-col justify-center items-center">
                              <div className="w-full h-[30%] text-center text-xl font-bold">
                                Klaviyo optin
                              </div>
                              <div className="w-full h-[70%] text-xl font-bold text-center flex items-end justify-center ">
                              {Klaviyop}   %
                              </div>
                    </div>                       
                  
                  </div>

          </div>

          {/**customer tabel */}
          <div className="w-full h-[53vh] overflow-auto mt-6    [&::-webkit-scrollbar]:w-3
    [&::-webkit-scrollbar-track]:bg-gray-100
    [&::-webkit-scrollbar-thumb]:bg-gray-300
    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            <table className="w-full table-auto text-sm text-center text-black border-collapse">
              <thead className="bg-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-center">Customer Name</th>
                  <th className="px-4 py-2 text-center">Number</th>
                  <th className="px-4 py-2 text-center">Email</th>
                  <th className="px-4 py-2 text-center">Social</th>
                  <th className="px-4 py-2 text-center">Total Spend</th>
                  <th className="px-4 py-2 text-center">Total Orders</th>
                  <th className="px-4 py-2 text-center">Tier</th>
                  <th className="px-4 py-2 text-center">Klaviyo</th>
                  <th className="px-4 py-2 text-center">Edit</th>
                </tr>
              </thead>
              <tbody>
                {custo && custo.length > 0 && custo.map((customer, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="px-4 py-2 text-center">{customer.first_name + " " + customer.last_name}</td>
                    <td className="px-4 py-2 text-center">{customer.Number}</td>
                    <td className="px-4 py-2 text-center">{customer.email}</td>
                    <td className="px-4 py-2 text-center">{customer.socialhandel || '-'}</td>
                    <td className="px-4 py-2 text-center">{customer.total_spend}</td>
                    <td className="px-4 py-2 text-center">{customer.orders_count || 0}</td>
                    <td className="px-4 py-2 text-center">
                      <button className="bg-gray-200 px-2 py-1 rounded-full">tier</button>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className={`px-2 py-1 rounded-full text-nowrap cursor-pointer ${customer.emailMarketingConsent.marketingState === 'subscribed' ? 'bg-[#B7CBAF]' : 'bg-[#272626] text-white'} `}
                      >
                        {customer.emailMarketingConsent.marketingState === 'subscribed' ? 'Opt-in' : 'Opt-out'}
                      </button>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => {
                          dispatch(AddSelectedCustomer(customer))
                          dispatch(Toogle_Editopen())
                        }}
                        className="bg-blue-400 cursor-pointer text-white px-4 py-1 rounded-full">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
    </div>

  )

}

export default Page