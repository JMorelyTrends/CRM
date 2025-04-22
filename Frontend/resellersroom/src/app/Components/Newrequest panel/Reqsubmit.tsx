"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Custprop ,dCustomerArray} from "../Small comps/Types";
import { redirect } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux';
import {  RootState } from "@/lib/Resellerstore";
import {Toggleleadsrenderstep} from '@/lib/features/Newrequest/NewRequestSlice'
// type Props = {};
const Firsthalf = ({
  sugbox,
  setsugbox,
 // selectedcustomer,
  setselectedcustomer,
}: {
  sugbox: boolean;
  setsugbox: React.Dispatch<React.SetStateAction<boolean>>;
  // selectedcustomer: Custprop|null,
  setselectedcustomer: React.Dispatch<React.SetStateAction<Custprop|null>>; 
}) => {
 
  const selectedItems = useSelector((state:RootState)=>state.NewReq.selectedItems)
  const [searchclient, setsearchclient] = useState<string>("");
  const [getcusdata, setgetcusdata] = useState<dCustomerArray>([]);
  const [getcusmongodata, setgetcusmongodata] = useState<dCustomerArray>([]);
  const [userid,setuserid]=useState<string|null>('');
  useEffect(()=>{
    if (typeof window !== 'undefined'){
      const id=localStorage.getItem('tempcred');
      setuserid(id);
      
     }
  },[])
  const SearchCustomer = async () => {
    const serchresult = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/customers/getCustomersbyboth`,
      {
        search: searchclient,
        id:userid
      }
    );
    console.log(serchresult.data);
    setgetcusmongodata(serchresult.data.dm)
    setgetcusdata(serchresult.data.d);
  };
  return (
    <div className="w-full h-[45%] flex flex-col gap-0.5">
      <div className="h-[20%] w-full flex justify-center text-center  items-center text-md font-bold">
        {selectedItems?.name}
      </div>

      <div className="h-[50%] flex justify-center items-center">
        <div className="h-full lg:w-[60%] md:w-[50%] w-[90%] bg-white flex justify-center items-center rounded-xl overflow-auto">
          <img
            src={selectedItems ? selectedItems.image : ""}
            alt=""
            className="object-contain w-[70%] h-[90%] bg-amber-50"
          />
        </div>
      </div>
      <div className="h-[30%] flex flex-col">
        <div className="w-full flex-1 flex justify-center items-center">
          <h4>client name</h4>
        </div>
        <div className="w-full flex-2 flex justify-center items-center relative">
          <div className="lg:w-[65%] md:w-[60%] w-[90%] px-1 h-[65%] flex items-center border border-black bg-white rounded-xl shadow-md shadow-black">
            <div className="cursor-pointer w-[10%] h-[80%] flex justify-center items-center">
              <img
                src="/images/search.png"
                alt="Search"
                className="lg:h-4 lg:w-4 md:h-3 md:w-3 w-5 h-5"
              />
            </div>
            <input
              type="text"
              list="data"
              placeholder="Search by brand"
              className="w-[80%] h-full p-2 outline-none text-gray-700 relative"
              value={searchclient}
              onChange={(e) => {
                setsearchclient(e.target.value);
              }}
              onClick={() => setsugbox(true)}
              onKeyUp={(event) => {
                if (event.key == "Enter") {
                  SearchCustomer();
                } else {
                  setsugbox(true);
                }
              }}
            />
{(getcusdata?.length > 0 || getcusmongodata?.length > 0) && sugbox && (
  <div className="w-[20vw] max-h-60 overflow-y-auto bg-white rounded-xl border-2 border-black shadow-md shadow-black absolute top-15 right-10 z-10 p-2">
    {/* Shopify Section */}
    {getcusdata?.length > 0 && (
      <>
        <div className="font-semibold text-sm text-gray-600 px-2 py-1">Shopify Customers</div>
        {getcusdata.map((customer: Custprop, index: number) => (
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

    {/* MongoDB Section */}
    {getcusmongodata?.length > 0 && (
      <>
        <div className="font-semibold text-sm text-gray-600 px-2 py-1 mt-2">Mongo Customers</div>
        {getcusmongodata.map((customer: Custprop, index: number) => (
          <div
            key={`mongo-${index}`}
            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
            onClick={() => {
              setsearchclient(`${customer.Name}`);
              setselectedcustomer(customer);
              setsugbox(false);
            }}
          >
            <div className="font-medium">{customer.Name} </div>
            <div className="text-gray-500 text-xs">{customer.email}</div>
          </div>
        ))}
      </>
    )}
  </div>
)}

            <div
              className="cursor-pointer w-[10%] h-[80%]"
              onClick={() => sugbox && setsugbox(false)}
            >
              <img src="/images/cross.png" alt="Search" className="p-1.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const Secondhalf = ({
  size,
  setsize,
  Selectcondition,
  setSelectcondition,
  selectedcustomer,
  // setselectedcustomer,
  Submit_Request,
}: {
  size: string;
  setsize: React.Dispatch<React.SetStateAction<string>>;
  Selectcondition: string;
  setSelectcondition: React.Dispatch<React.SetStateAction<string>>;
  selectedcustomer: Custprop|null,
  // setselectedcustomer: React.Dispatch<React.SetStateAction<Custprop|null>>; 
  Submit_Request:(size:string,Selectcondition:string,customer:Custprop|null)=>void;
}) => {
  const dispatch= useDispatch()
  //const { addItem, selectedItems, Toggleleadsrenderstep } = useSelection();
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectcondition(event.target.value);
  };
  return (
    <div className="w-full h-[55%] flex flex-col gap-3 px-4 py-4 ">
      <div className="text-xs text-center underline underline-offset-2">
        <span
          className=" cursor-pointer"
          onClick={() => {
            dispatch(Toggleleadsrenderstep(3));
          }}
        >
          No result? Add new client
        </span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <label className="text-sm font-semibold text-black">Size</label>
        <input
          type="text"
          value={size}
          onChange={(e) => setsize(e.target.value)}
          placeholder="Type Size"
          className="bg-gray-50 border border-black placeholder:text-black text-black text-sm rounded-lg w-full p-2"
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <label htmlFor="condition" className="text-sm font-semibold text-black">
          Product Condition
        </label>
        <select
          id="condition"
          value={Selectcondition}
          onChange={handleChange}
          className="bg-gray-50 border border-black text-gray-900 text-sm rounded-lg w-full p-2.5">
          <option value="">Choose Condition</option>
          <option value="new">Brand New</option>
          <option value="used">Pre Loved</option>
          <option value="both">Open to Both</option>
        </select>
      </div>

      <div className="flex justify-center items-center mt-auto">
        <button
          onClick={() => {Submit_Request(size,Selectcondition,selectedcustomer)}}
          className="bg-gray-700 text-white w-[60%] py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition cursor-pointer"
          >
          Submit Request
        </button>
      </div>
    </div>
  );
};
export default function Reqsubmit({ sideopen }: { sideopen: boolean }) {
  const selectedItems= useSelector((state:RootState)=>state.NewReq.selectedItems)
  const [Selectcondition, setSelectcondition] = useState<string>("");
  const [size, setsize] = useState("");
  const [selectedcustomer,setselectedcustomer]=useState<Custprop|null>(null);
  //const [complete, setcomplete] = useState<boolean>(false);
  const [sugbox, setsugbox] = useState<boolean>(false);
  const [userid,setuserid]=useState<string|null>('')
  useEffect(()=>{
    if (typeof window !== 'undefined'){
      const id=localStorage.getItem('tempcred');
      setuserid(id);
      
     }
  },[])
  // const transition = {
  //   duration: 0.8,
  //   delay: 0.5,
  //   ease: [0, 0.71, 0.2, 1.01],
  // };
  const Submit=async(size:string,Selectcondition:string,customer:Custprop|null)=>{
    console.log("seleted customer :",customer)
    console.log("size             :",size)
    console.log("condition        : ",Selectcondition)
    let Name;
    if(customer?.customerfrom=='shopify')
    {
      console.log("name from shopify")
        Name=customer.first_name +" "+ customer.last_name
    }
    else if(customer?.customerfrom=='mongodb')
    {
      console.log("name from mongo")

       Name=customer.Name
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
   
      console.log(result);
      redirect('/Leads')
      
    }
    
  

  }

  return (
    <div
      className={`${
        sideopen
          ? "lg:w-[30%] md:w-[35%] w-[90%]"
          : "lg:w-[30%] md:w-[70%] w-[90%]"
      } 
    h-[85vh] bg-[#EBEBEB] flex flex-col text-black rounded-xl`}
      onClick={() => sugbox && setsugbox(false)}
    >
      <Firsthalf
       sugbox={sugbox}
        setsugbox={setsugbox} 
        // selectedcustomer={selectedcustomer}
        setselectedcustomer={setselectedcustomer}/>
      <Secondhalf
        size={size}
        setsize={setsize}
        Selectcondition={Selectcondition}
        setSelectcondition={setSelectcondition}
        selectedcustomer={selectedcustomer}
        // setselectedcustomer={setselectedcustomer}
        Submit_Request={Submit}
      />
    </div>
  );
};