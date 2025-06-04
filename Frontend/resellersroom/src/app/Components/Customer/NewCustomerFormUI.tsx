"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/Resellerstore";
import { Toogle_Newcuscrm } from "@/lib/features/CustomerCrm/CustomerCrmslice";
import { toast } from "sonner";
import axios from "axios";

export default function NewCustomerFormUI() {
  const dispatch = useDispatch();
  const open = useSelector((state: RootState) => state.Cus.Newcuscrm);

  const [firstname, setfirstname] = useState<string>('');
  const [lastname,setlastname]=useState<string>('')
  const [number, setNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
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
        const data={
            first_name:firstname,
            last_name:lastname,
            phone:number,
            email:email
        }
        if(firstname==="" && lastname==""&&number==""&&email=="")
        {
         toast("fill atleast one field")   
        }
        else{
        const d=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/customers/cratenewhsopifycustomer`, {
        data
      });
        }
        
    } 
  }

  const close = () => {
    dispatch((Toogle_Newcuscrm()));
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md p-6 rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Customer</DialogTitle>
        </DialogHeader>

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
            <label className="mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
