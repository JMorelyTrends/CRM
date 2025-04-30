"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Custprop, dCustomerArray } from "../Small comps/Types";
import { redirect } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/Resellerstore";
import { Toggleleadsrenderstep, Addshopifycustomer,Addmongodbcustomer, Addselectedcusotmer } from "@/lib/features/Newrequest/NewRequestSlice";

function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

interface FirstHalfProps {
  sugbox: boolean;
  setsugbox: React.Dispatch<React.SetStateAction<boolean>>;
  selectedcustomer: Custprop | null;
  setselectedcustomer: React.Dispatch<React.SetStateAction<Custprop | null>>;
  searchclient: string;
  setsearchclient: React.Dispatch<React.SetStateAction<string>>;
}

const Firsthalf = ({
  sugbox,
  setsugbox,
  selectedcustomer,
  setselectedcustomer,
  searchclient,
  setsearchclient,
}: FirstHalfProps) => {
  const dispatch = useDispatch();
  const selectedItems = useSelector((state: RootState) => state.NewReq.selectedItems);
  
  const [shopifyCustomers, setShopifyCustomers] = useState<dCustomerArray>([]);
  const [mongoCustomers, setMongoCustomers] = useState<dCustomerArray>([]);
  const [userId, setUserId] = useState<string | null>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("tempcred");
      setUserId(id);
    }
  }, []);

  const searchCustomer = debounce(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.trim();
    if (!query) return;

    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/customers/getCustomersbyboth`, {
        search: query,
        id: userId,
      });

      setMongoCustomers(data.dm);
      setShopifyCustomers(data.d);
      dispatch(Addshopifycustomer(data.d));
      dispatch(Addmongodbcustomer(data.d));

    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  }, 700);

  return (
    <div className="w-full h-[45%] flex flex-col gap-0.5">
      {/* Selected Product Name */}
      <div className="h-[20%] w-full flex justify-center items-center text-md font-bold">
        {selectedItems?.name}
      </div>

      {/* Product Image */}
      <div className="h-[50%] flex justify-center items-center">
        <div className="h-full lg:w-[60%] md:w-[50%] w-[90%] bg-white flex justify-center items-center rounded-xl overflow-auto">
          <img
            src={selectedItems?.image || "/images/placeholder.png"}
            alt="Product"
            className="object-contain w-[70%] h-[90%]"
          />
        </div>
      </div>

      {/* Customer Search or Selected Customer */}
      <div className="h-[30%] flex flex-col">
        {selectedcustomer ? (
          <div className="w-full h-full flex justify-center items-center">
            <div className="flex flex-col w-[80%] h-[90%] bg-white rounded-2xl p-2 text-sm text-black">
              <div className="font-semibold">
              
                {
                selectedcustomer.customerfrom === "shopify"
                  ? "Name : "+`${selectedcustomer.first_name} ${selectedcustomer.last_name}`
                  : selectedcustomer.Name!=''?"Name : "+selectedcustomer.Name:selectedcustomer.socialhandel!=''?"Socials : "+selectedcustomer.socialhandel:""
                  
                  }
              </div>
              <div className="text-gray-600">{
              
              selectedcustomer.email!=''?
              "Email: "+ selectedcustomer.email:
              selectedcustomer.Number!=''?"Phone :"+selectedcustomer.Number:""
              
              }</div>
              <div className="text-gray-600">
              {
              selectedcustomer.email!=''&& selectedcustomer.Number!=''?
              "Phone: "+ selectedcustomer.Number : ""
              
              }</div>
            </div>
          </div>
        ) : (
          <div className="w-full flex-2 flex justify-center items-center relative">
            <div className="lg:w-[65%] md:w-[60%] w-[90%] h-[50%] flex items-center border border-black bg-white rounded-xl shadow-md">
              <div className="cursor-pointer w-[10%] h-[80%] flex justify-center items-center">
                <img src="/images/search.png" alt="Search" className="h-5 w-5" />
              </div>

              <input
                type="text"
                list="data"
                placeholder="Search for client..."
                className="w-[80%] h-full p-2 outline-none text-gray-700"
                value={searchclient}
                onChange={(e) => {
                  setsearchclient(e.target.value);
                  searchCustomer(e);
                  setsugbox(true);
                }}
                onClick={() => setsugbox(true)}
              />

              {((shopifyCustomers.length > 0 || mongoCustomers.length > 0) && sugbox) && (
                <div className="absolute top-14 right-10 w-[20vw] max-h-60 overflow-y-auto bg-white rounded-xl border-2 border-black shadow-md p-2 z-10">
                  {shopifyCustomers.length > 0 && (
                    <>
                      <div className="font-semibold text-sm text-gray-600 px-2 py-1">Shopify Customers</div>
                      {shopifyCustomers.map((customer, index) => (
                        <div
                          key={`shopify-${index}`}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => {
                            setsearchclient(`${customer.first_name} ${customer.last_name}`);
                            setselectedcustomer(customer);
                            setsugbox(false);
                          }}
                        >
                          <div className="font-medium">{customer.first_name} {customer.last_name}</div>
                          <div className="text-gray-500 text-xs">{customer.email}</div>
                        </div>
                      ))}
                    </>
                  )}

                  {mongoCustomers.length > 0 && (
                    <>
                      <div className="font-semibold text-sm text-gray-600 px-2 py-1 mt-2">MongoDB Customers</div>
                      {mongoCustomers.map((customer, index) => (
                        <div
                          key={`mongo-${index}`}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => {
                            setsearchclient(customer.Name);
                            setselectedcustomer(customer);
                            setsugbox(false);
                          }}
                        >
                          <div className="font-medium">{
                        
                             customer.Name!=''?customer.Name:customer.socialhandel!=''?customer.socialhandel:customer.Number?customer.Number:""

                        
                        }</div>
                          <div className="text-gray-500 text-xs">{customer.email !==''?customer.email:(customer.Number && customer.Name!='' ||customer.socialhandel!='' )?customer.Number:""}</div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              <div
                className="cursor-pointer w-[10%] h-[80%] flex justify-center items-center"
                onClick={() => {
                  setsugbox(false);
                  setsearchclient("");
                }}
              >
                <img src="/images/cross.png" alt="Clear" className="p-1.5" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface SecondHalfProps {
  size: string;
  setsize: React.Dispatch<React.SetStateAction<string>>;
  selectedCondition: string;
  setSelectedCondition: React.Dispatch<React.SetStateAction<string>>;
  selectedcustomer: Custprop | null;
  setselectedcustomer: React.Dispatch<React.SetStateAction<Custprop | null>>;
  Submit_Request: (size: string, selectedCondition: string, customer: Custprop | null) => void;
  searchclient: string;
  setsearchclient: React.Dispatch<React.SetStateAction<string>>;
}

const Secondhalf = ({
  size,
  setsize,
  selectedCondition,
  setSelectedCondition,
  selectedcustomer,
  setselectedcustomer,
  Submit_Request,
  searchclient,
  setsearchclient,
}: SecondHalfProps) => {
  const dispatch = useDispatch();

  return (
    <div className="w-full h-[55%] flex flex-col gap-3 px-4 py-4">
      <div className="text-xs text-center underline underline-offset-2">
        {selectedcustomer ? (
          <span
            className="cursor-pointer"
            onClick={() => {
              setselectedcustomer(null);
              setsearchclient("");
            }}
          >
            Change Customer
          </span>
        ) : (
          <span
            className="cursor-pointer"
            onClick={() => dispatch(Toggleleadsrenderstep(3))}
          >
            No result? Add new client
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-1">
        <label className="text-sm font-semibold text-black">Size</label>
        <input
          type="text"
          value={size}
          onChange={(e) => setsize(e.target.value)}
          placeholder="Enter size"
          className="bg-gray-50 border border-black text-black text-sm rounded-lg w-full p-2"
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <label htmlFor="condition" className="text-sm font-semibold text-black">
          Product Condition
        </label>
        <select
          id="condition"
          value={selectedCondition}
          onChange={(e) => setSelectedCondition(e.target.value)}
          className="bg-gray-50 border border-black text-gray-900 text-sm rounded-lg w-full p-2.5"
        >
          <option value="">Choose Condition</option>
          <option value="new"> New</option>
          <option value="used">Pre Loved</option>
          <option value="both">Any Condition</option>
        </select>
      </div>

      <div className="flex justify-center items-center mt-auto">
        <button
          onClick={() => Submit_Request(size, selectedCondition, selectedcustomer)}
          className="bg-gray-700 text-white w-[60%] py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
        >
          Submit Request
        </button>
      </div>
    </div>
  );
};

export default function Reqsubmit({ sideopen }: { sideopen: boolean }) {
  const dispatch=useDispatch()
  const selectedItems = useSelector((state: RootState) => state.NewReq.selectedItems);
  const t=useSelector((state: RootState) => state.NewReq.Selectedonecustomer)
    console.log(t)
  const [selectedCondition, setSelectedCondition] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [searchclient, setSearchclient] = useState<string>("");
  
  const [selectedcustomer, setSelectedcustomer] = useState<Custprop | null>( t);
  const [sugbox, setsugbox] = useState<boolean>(false);
  const [userid, setUserid] = useState<string | null>("");

 
  useEffect(()=>{
    setSelectedcustomer(t)
  },[t])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserid(localStorage.getItem("tempcred"));
  
    }
    
  }, []);

  const submitRequest=async(size:string,Selectcondition:string,customer:Custprop|null)=>{
    console.log("seleted customer :",customer)
    console.log("size             :",size)
    console.log("condition        : ",Selectcondition)
    let Name;
    if(customer?.customerfrom=='shopify')
    {
    
        Name=customer.first_name +" "+ customer.last_name
    }
    else if(customer?.customerfrom=='mongodb')
    {
     

       Name=customer.Name!=''?customer.Name:customer.socialhandel!=''?customer.socialhandel:customer.email!=''?customer.email:customer.Number!=''?customer.Number:"N/a"


    }
    if(customer!=null && selectedItems )
    {
      const newOrder={
        customerid:customer._id,
        Name:Name,
        Stockxid:selectedItems._id,
        clientFrom:customer.customerfrom?customer.customerfrom:null,
        size,
        Condition:Selectcondition,
        userid,
      }
   const result=await   axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/CreateOrders`,{
        newOrder:newOrder
      })
   
     
      dispatch(Addselectedcusotmer(null))
      redirect('/Leads')
      
    }
    
  

  }



  return (
    <div
      className={`${
        sideopen ? "lg:w-[30%] md:w-[35%]" : "lg:w-[30%] md:w-[70%]"
      } w-[90%] h-[96vh] bg-[#EBEBEB] flex flex-col text-black rounded-xl overflow-hidden`}
      onClick={() => sugbox && setsugbox(false)}
    >
      <Firsthalf
        sugbox={sugbox}
        setsugbox={setsugbox}
        selectedcustomer={selectedcustomer}
        setselectedcustomer={setSelectedcustomer}
        searchclient={searchclient}
        setsearchclient={setSearchclient}
      />
      <Secondhalf
        size={size}
        setsize={setSize}
        selectedCondition={selectedCondition}
        setSelectedCondition={setSelectedCondition}
        selectedcustomer={selectedcustomer}
        setselectedcustomer={setSelectedcustomer}
        Submit_Request={submitRequest}
        searchclient={searchclient}
        setsearchclient={setSearchclient}
      />
    </div>
  );
}
