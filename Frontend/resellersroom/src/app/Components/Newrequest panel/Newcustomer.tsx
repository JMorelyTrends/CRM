"use client"
import React,{useState,useEffect} from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import {  RootState } from "@/lib/Resellerstore";
import {Toggleleadsrenderstep} from '@/lib/features/Newrequest/NewRequestSlice'
type Props = {
  sideopen: boolean;
};

const Newcustomer = (props: Props) => {
  const dispatch =useDispatch();
  const selectedItems=useSelector((state:RootState)=>state.NewReq.selectedItems)
 
  const [name, setName] = useState<string>('');
  const [number, setNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [postcode, setPostcode] = useState<string>('');
  const [city,setcity]=useState<string>('');
  const [userid,setuserid]=useState<string|null>('')
  
  useEffect(()=>{
    if (typeof window !== 'undefined'){
     const id=localStorage.getItem('tempcred');
     setuserid(id);
     console.log(localStorage.getItem('tempcred'))
    }
  },[])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(userid)
    
    if (!name || !number || !email || !address || !postcode) {
      alert('Please fill in all fields.');
      return;
    }

    const newCustomer = {
      name,
      number,
      email,
      address,
      city,
      postcode,
      userid,
    };
  const newc=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/customers/createCustomer`,
      {
        newCustomer:newCustomer
      }
    )
    if(newc.data?.alert)
    {
      alert(`Custoemr exits in shopify search by email : ${newc.data?.message}`)
   
    }
    console.log('Submitted Customer:', newc);
    setName('');
    setNumber('');
    setEmail('');
    setAddress('');
    setPostcode('');
    setcity('')
    dispatch(Toggleleadsrenderstep(2));
  };

  return (
    <div
      className={`${
        props.sideopen
          ? 'lg:w-[40%] md:w-[55%] w-[90%]'
          : 'lg:w-[40%] md:w-[70%] w-[90%]'
      } h-[85vh] bg-white flex flex-col text-black rounded-xl overflow-hidden`}
    >
   
      <div className="relative  w-full flex flex-col items-center pt-6  ">
        <div className="absolute top-6  text-opacity-80 text-xl md:text-3xl px-2 text-black bg-opacity-50 rounded-md">
          {selectedItems?.name}
        </div>
        <div className="w-fit h-[120px]  ">
          <img
            src={selectedItems?.image}
            alt="Selected"
            className="w-full h-full object-cover "
          />
        </div>
      </div>

     
      <form
        onSubmit={handleSubmit}
        className="w-full h-full bg-[#EBEBEB] rounded-xl overflow-auto p-4 flex flex-col gap-4"
      >
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 rounded-md border border-gray-300"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Number</label>
          <input
            type="tel"
            required
            pattern="[0-9]*"
            inputMode="numeric"
            value={number}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) {
                setNumber(val);
              }
            }}
            className="p-2 rounded-md border border-gray-300"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 rounded-md border border-gray-300"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Address</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="p-2 rounded-md border border-gray-300"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium">City</label>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setcity(e.target.value)}
            className="p-2 rounded-md border border-gray-300"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Postcode</label>
          <input
            type="text"
            required
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            className="p-2 rounded-md border border-gray-300"
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-black text-white py-2 px-4 rounded-md hover:bg-opacity-80 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Newcustomer;