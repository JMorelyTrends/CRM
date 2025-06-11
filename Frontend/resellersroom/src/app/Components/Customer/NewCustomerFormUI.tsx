"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/Resellerstore";
import { AddSelectedCustomer, Toogle_Editopen,Toogle_Newcuscrm } from "../../../lib/features/CustomerCrm/CustomerCrmslice";
import { AddSubmitingCustomer,ADD_Matched_cutomer,Toogleshopifypopup, Addselectedcusotmer, Addshopifycustomer } from "@/lib/features/Newrequest/NewRequestSlice";
import {Toggleleadsrenderstep} from '@/lib/features/Newrequest/NewRequestSlice'
import Shopifyupdatepopup from "../Newrequest panel/Shopifyupdatepopup";
import Shopifymatch from "../Newrequest panel/Shopifymatch";

export default function NewCustomerFormUI() {
  const dispatch = useDispatch();
  const open = useSelector((state: RootState) => state.Cus.Newcuscrm);
  const customer=useSelector((state:RootState)=>state.NewReq.Selectedonecustomer)
  const [firstname, setfirstname] = useState<string>('');
  const [lastname,setlastname]=useState<string>('')
  const [number, setNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [socialHandle,setSocialHandle]=useState<string>("")
  const [userid, setUserid] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('tempcred');
      setUserid(id);
    }
  }, []);


  const submit=async()=>{
   if(userid!=="")
    {
       
        if(firstname==="" && lastname==""&&number==""&&email=="")
        {
         toast("fill atleast one field")   
        }
        else{
          const newCustomer = {
            first_name:firstname,
            last_name:lastname,
            number,
            email,
            userid,
            social: socialHandle
          };
      
     
        const newc=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/customers/createCustomer`, {
          newCustomer
      });

      if(newc.data?.alert==="Exists in Shopify database")
        {
          const submitteddata = {
            name,
            Number:number,
            email,
           
          };
          dispatch(Addselectedcusotmer(null))
          dispatch(AddSubmitingCustomer(submitteddata))
          dispatch(ADD_Matched_cutomer(newc.data.customer))
          dispatch(Toogleshopifypopup())
          toast.error(`${newc.data?.alert}`)
        }
      else
      {
        toast.success("Customer updated succesfully")
        setfirstname("")
        setlastname("")
        setEmail("")
        setNumber("")
        dispatch(AddSelectedCustomer(null))
        dispatch(Toogle_Newcuscrm())
      }
        }
        
    } 
  }

  useEffect(()=>{
    console.log(customer)
   if(customer)
   {
    setfirstname(customer.first_name);
    setlastname(customer.last_name)
    setEmail(customer.email)
    setNumber(customer?.Number||"")
    setSocialHandle(customer.socialhandel||"")
   }
  },[customer])

  const close = () => {
    setfirstname("")
    setlastname("")
    setEmail("")
    setNumber("")
    dispatch((Toogle_Newcuscrm()));
    dispatch(Addselectedcusotmer(null))
    dispatch(Toggleleadsrenderstep(0))
    dispatch(Addshopifycustomer(null))
    
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto p-6 rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Customer</DialogTitle>
        </DialogHeader>
        <Shopifyupdatepopup />
        <Shopifymatch from="leads" getcustomers={()=>Promise.resolve()} />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="mb-1 font-medium">First Name</label>
            <input
              type="text"
              value={firstname}
              onChange={(e) => setfirstname(e.target.value)}
              className="p-2 rounded-md border border-gray-300"
            />
          </div>

           <div className="flex flex-col">
            <label className="mb-1 font-medium">Last Name</label>
            <input
              type="text"
              value={lastname}
              onChange={(e) => setlastname(e.target.value)}
              className="p-2 rounded-md border border-gray-300"
            />
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
            <label className="mb-1 font-medium">Number</label>
            <input
              type="tel"
              pattern="[0-9]*"
              inputMode="numeric"
              value={number}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val) && val.length <= 11) {
                  setNumber(val);
                }
                else if(number==null)
                {
                    setNumber("0")
                }
              }}
              className="p-2 rounded-md border border-gray-300"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Social handel</label>
            <input
              type="text"
              value={socialHandle}
              onChange={(e) => setSocialHandle(e.target.value)}
              className="p-2 rounded-md border border-gray-300"
            /> 
          </div>
         

          

          <button
            type="button"
            className="mt-4 bg-black text-white py-2 px-4 rounded-md hover:bg-opacity-80 transition"
            onClick={()=>submit()}
          >
            Submit
          </button>

          <div
            onClick={close}
            className="mt-2 bg-[#817F7F] text-center cursor-pointer text-white py-2 px-4 rounded-md hover:bg-opacity-80 transition"
          >
            Back
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
