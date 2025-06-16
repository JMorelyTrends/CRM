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
import FilterSort from '../Components/fillters/FilterSort';
import { useRouter } from 'next/navigation';

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
        const router = useRouter();
        const dispatch=useDispatch();
        const isSmallScreen=useIsSmallScreen();

        const [search,setsearch]=useState<string>("")
        const [userid, setuserid] = useState<string | null>("");
        const [custo,setcusto]=useState<IShopifyCustomer[]|null>(null)
        const [noofcus,setnoofcus]=useState<number>(0);
        const [Klaviyop,setKlaviyop]=useState<number>(0)
        const [sortBy, setSortBy] = useState<string>("");
        const [activeFilters, setActiveFilters] = useState<string[]>([]);

        const filterOptions = [
          { label: "Has Email", value: "hasEmail" },
          { label: "Has Phone", value: "hasPhone" },
          { label: "Has Social Handle", value: "hasSocial" },
          { label: "Klaviyo Opt-in", value: "klaviyoOptIn" },
          { label: "Klaviyo Opt-out", value: "klaviyoOptOut" },
        ];

        const sortOptions = [
          { label: "Name (A-Z)", value: "nameAsc" },
          { label: "Name (Z-A)", value: "nameDesc" },
          { label: "Highest Spend", value: "spendDesc" },
          { label: "Lowest Spend", value: "spendAsc" },
          { label: "Most Orders", value: "ordersDesc" },
          { label: "Least Orders", value: "ordersAsc" },
        ];

        const handleFilterChange = (filters: string[]) => {
          setActiveFilters(filters);
        };

        const handleSortChange = (sort: string) => {
          setSortBy(sort);
        };

        const getTierInfo = (totalSpend: number, tshopifySpend: number) => {
          const total = totalSpend + tshopifySpend;
          if (total >= 3001) {
            return { tier: 'Platinum', color: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300' };
          } else if (total >= 1251) {
            return { tier: 'Gold', color: 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300' };
          } else if (total >= 501) {
            return { tier: 'Silver', color: 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border border-slate-300' };
          } else {
            return { tier: 'Bronze', color: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300' };
          }
        };
      
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

        const filteredAndSortedCustomers = custo?.filter((customer) => {
          const matchesFilters = activeFilters.every(filter => {
            switch (filter) {
              case "hasEmail":
                return !!customer.email;
              case "hasPhone":
                return !!customer.Number;
              case "hasSocial":
                return !!customer.socialhandel;
              case "hasAddress":
                return !!customer.address;
              case "klaviyoOptIn":
                return customer.emailMarketingConsent?.marketingState === 'subscribed';
              case "klaviyoOptOut":
                return customer.emailMarketingConsent?.marketingState != 'subscribed';
              default:
                return true;
            }
          });

          const searchTerm = search.toLowerCase();
          const matchesSearch = 
            (customer.first_name + " " + customer.last_name).toLowerCase().includes(searchTerm) ||
            customer.email?.toLowerCase().includes(searchTerm) ||
            customer.Number?.toLowerCase().includes(searchTerm) ||
            customer.socialhandel?.toLowerCase().includes(searchTerm);

          return matchesFilters && matchesSearch;
        }).sort((a, b) => {
          switch (sortBy) {
            case "nameAsc":
              return (a.first_name + " " + a.last_name).localeCompare(b.first_name + " " + b.last_name);
            case "nameDesc":
              return (b.first_name + " " + b.last_name).localeCompare(a.first_name + " " + a.last_name);
            case "spendDesc":
              return Number(b.total_spend || 0) - Number(a.total_spend || 0);
            case "spendAsc":
              return Number(a.total_spend || 0) - Number(b.total_spend || 0);
            case "ordersDesc":
              return Number(b.orders_count || 0) - Number(a.orders_count || 0);
            case "ordersAsc":
              return Number(a.orders_count || 0) - Number(b.orders_count || 0);
            default:
              return 0;
          }
        });

  return (
    <div className=' w-[80vw]'>
         { !isSmallScreen&& <Header
             search={search}
             setsearch={setsearch}
        />}

        <NewCustomerFormUI  from='crm' getcustomers={getcustomers}/>
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
          <div className="w-full h-[15vh] mt-[3vh] gap-2 flex items-start text-black">
            <div className="w-[30%] h-full flex flex-col justify-around items-start">
              <FilterSort
                title="All Customers"
                count={noofcus}
                filterOptions={filterOptions}
                sortOptions={sortOptions}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
              />
            </div>

            <div className="w-[70%] flex justify-around h-full items-center">
              <div className="w-[30%] h-[90%] bg-[#F3F3F3] rounded-xl flex flex-col justify-center items-center">
                <div className="w-full h-[30%] text-center text-xl font-bold">
                  Total Customers
                </div>
                <div className="w-full h-[70%] text-xl font-bold text-center flex items-end justify-center">
                  {noofcus}
                </div>
              </div>

              <div className="w-[30%] h-[90%] bg-[#F3F3F3] rounded-xl flex flex-col justify-center items-center">
                <div className="w-full h-[30%] text-center text-xl font-bold">
                  Klaviyo optin
                </div>
                <div className="w-full h-[70%] text-xl font-bold text-center flex items-end justify-center">
                  {Klaviyop}%
                </div>
              </div>
            </div>
          </div>

          {/**customer tabel */}
          <div className="w-full h-[50vh] overflow-auto mt-6    [&::-webkit-scrollbar]:w-3
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
                {filteredAndSortedCustomers && filteredAndSortedCustomers.length > 0 && 
                  filteredAndSortedCustomers.map((customer, idx) => (
                    <tr 
                      key={idx} 
                      className="border-b border-black hover:bg-gray-100"
                    >
                      <td className="px-4 py-2 text-center">{customer.first_name + " " + customer.last_name}</td>
                      <td className="px-4 py-2 text-center">{customer.Number}</td>
                      <td className="px-4 py-2 text-center">{customer.email}</td>
                      <td className="px-4 py-2 text-center">{customer.socialhandel || '-'}</td>
                      <td className="px-4 py-2 text-center">{customer.total_spend}</td>
                      <td className="px-4 py-2 text-center">{customer.orders_count || 0}</td>
                      <td className="px-4 py-2 text-center">
                        {(() => {
                          const totalSpend = Number(customer.total_spend) || 0;
                          const tshopifySpend = Number(customer.tshopifyspent) || 0;
                          const { tier, color } = getTierInfo(totalSpend, tshopifySpend);
                          return (
                            <button className={`px-2 py-1 rounded-full ${color}`}>
                              {tier}
                            </button>
                          );
                        })()}
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
                            router.push('/CustomerCrm/Details')
                          }}
                          className="bg-blue-400 cursor-pointer text-white px-4 py-1 rounded-full">View</button>
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