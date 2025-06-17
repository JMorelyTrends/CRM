"use client"
import React,{useState,useEffect} from 'react';
import axios from 'axios';
import { toast } from "sonner"
import { useSelector, useDispatch } from 'react-redux';
import {  RootState } from "@/lib/Resellerstore";
import {Toggleleadsrenderstep,Addselectedcusotmer,ADD_Matched_cutomer,Toogleshopifypopup,Tooglemongopopup,AddSubmitingCustomer} from '@/lib/features/Newrequest/NewRequestSlice'
import Shopifymatch from './Shopifymatch';
import DBMatched from './DBMatched';
import Shopifyupdatepopup from './Shopifyupdatepopup';
import PhoneInput from '../Small comps/PhoneInput';
type Props = {
  sideopen: boolean;
};

const Newcustomer = (props: Props) => {
  const dispatch =useDispatch();
  const selectedItems=useSelector((state:RootState)=>state.NewReq.selectedItems)
 
  const [name, setName] = useState<string>('');
  const [first_name,setfirst_name]=useState<string>('');
  const [last_name,setlast_name]=useState<string>('')
  const [number, setNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>("");
  const [fullNumber, setFullNumber] = useState<string>("");
  //const [address, setAddress] = useState<string>('');
  //const [postcode, setPostcode] = useState<string>('');
  //const [city,setcity]=useState<string>('');
  const [userid,setuserid]=useState<string|null>('')
  const [social,setsocial]=useState<string>('')
  useEffect(()=>{
    if (typeof window !== 'undefined'){
     const id=localStorage.getItem('tempcred');
     setuserid(id);
    
    }
  },[])

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

   
   
    if(number.length>0&& number.length<11)
    {
      toast("Number should be 11 character long");
      return;
    }
    console.log(userid)
    
    if (name =='' && number=='' && email=='' && social=='' ) {
      toast.error('Please fill any one fields.');
      return;
    }

    const newCustomer = {
      first_name,
      last_name,
      number,
      email,
      userid,
      social
    };

  const newc=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/customers/createCustomer`,
      {
        newCustomer:newCustomer
      }
    )
    if(newc.data?.alert==="Exists in Shopify database")
    {
      
      const submitteddata = {
        name,
        Number:number,
        email,
        userid,
        socialhandel:social
      };

      dispatch(AddSubmitingCustomer(submitteddata))
      dispatch(ADD_Matched_cutomer(newc.data.customer))
      dispatch(Toogleshopifypopup())
      toast.error(`${newc.data?.alert}`)
    }
    else if(newc.data?.alert=== "Exists in database")
    {
      const submitteddata = {
        name,
        Number:number,
        email,
        userid,
        socialhandel:social
      };
      dispatch(ADD_Matched_cutomer(newc.data.customer))
      dispatch(AddSubmitingCustomer(submitteddata))
      dispatch(Tooglemongopopup())
      toast.error(`${newc.data?.alert}`)
    }
    else{
      dispatch(Addselectedcusotmer(newc.data?.customer))
      setName('');
      setfirst_name('');
      setlast_name('')
      setNumber('');
      setEmail('');
    //  setAddress('');
      //setPostcode('');
      //setcity('')
      dispatch(Toggleleadsrenderstep(2));
    }
  };

  return (
    <div
      className={`${
        props.sideopen
          ? 'lg:w-[40%] md:w-[55%] w-[90%]'
          : 'lg:w-[40%] md:w-[70%] w-[90%]'
      } h-[85vh] bg-white flex flex-col text-black rounded-xl overflow-hidden`}
    >
      <Shopifyupdatepopup/>
      <Shopifymatch from='newcustomer' getcustomers={async () => {}}/>
      <DBMatched />
      
      <div className="w-full flex items-center gap-4 p-4 border-b">
        <div className="w-[100px] h-[100px] flex-shrink-0">
          <img
            src={selectedItems?.image}
            alt="Selected"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        <div className="text-xl md:text-2xl font-medium text-black">
          {selectedItems?.name}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full flex-1 bg-[#EBEBEB] rounded-xl overflow-auto p-6 flex flex-col gap-4"
      >
        <div className="flex flex-col">
          <label className="mb-1 font-medium">first Name</label>
          <input
            type="text"
            value={first_name}
            onChange={(e) => setfirst_name(e.target.value)}
            className="p-2 rounded-md border border-gray-300"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Last Name</label>
          <input
            type="text"
           
            value={last_name}
            onChange={(e) => setlast_name(e.target.value)}
            className="p-2 rounded-md border border-gray-300"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Number</label>
          <PhoneInput number={number} setNumber={setNumber} />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Email</label>
          <input
            type="email"
         
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 rounded-md border border-gray-300"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Social Media handel</label>
          <input
            type="text"
           
            value={social}
            onChange={(e) => setsocial(e.target.value)}
            className="p-2 rounded-md border border-gray-300"
          />
        </div>
   

        <button
          type="submit"
          className="mt-4 bg-black cursor-pointer text-white py-2 px-4 rounded-md hover:bg-opacity-80 transition">
          Submit
        </button>
        <div
           
          onClick={()=>dispatch(Toggleleadsrenderstep(2))}
          className="mt-4 bg-[#817F7F] text-center cursor-pointer text-white py-2 px-4 rounded-md hover:bg-opacity-80 transition"
        >
          Back
        </div>
      </form>


    </div>
  );
};

export default Newcustomer;