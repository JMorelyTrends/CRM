"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/Resellerstore";
import { Toogle_Newcus } from "../../../lib/features/CustomerCrm/CustomerCrmslice"; // Adjust this if your toggle action differs
import axios from "axios";
import { toast } from "sonner";
import { Toggleleadsrenderstep, Addselectedcusotmer, ADD_Matched_cutomer, Toogleshopifypopup, Tooglemongopopup, AddSubmitingCustomer } from "@/lib/features/Newrequest/NewRequestSlice";

export default function NewCust() {
  const dispatch = useDispatch();
  const open = useSelector((state: RootState) => state.Cus.opennewcus); // adjust the slice name if needed

  const close = () => {
    dispatch(Toogle_Newcus());
  };

  const [name, setName] = useState<string>('');
  const [number, setNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [userid, setUserid] = useState<string | null>('');
  const [social, setSocial] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('tempcred');
      setUserid(id);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (number.length > 0 && number.length < 11) {
      toast("Number should be 11 characters long");
      return;
    }

    if (name === '' && number === '' && email === '' && social === '') {
      toast.error('Please fill in at least one field.');
      return;
    }

    const newCustomer = { name, number, email, userid, social };

    try {
      const newc = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/customers/createCustomer`, {
        newCustomer
      });

      if (newc.data?.alert === "Exists in Shopify database") {
        dispatch(ADD_Matched_cutomer(newc.data.customer));
        dispatch(Toogleshopifypopup());
        toast.error(newc.data?.alert);
      } else if (newc.data?.alert === "Exists in database") {
        const submittedData = {
          name,
          Number: number,
          email,
          userid,
          socialhandel: social
        };
        dispatch(ADD_Matched_cutomer(newc.data.customer));
        dispatch(AddSubmitingCustomer(submittedData));
        dispatch(Tooglemongopopup());
        toast.error(newc.data?.alert);
      } else {
        dispatch(Addselectedcusotmer(newc.data?.customer));
        setName('');
        setNumber('');
        setEmail('');
        setSocial('');
        dispatch(Toggleleadsrenderstep(2));
        dispatch(Toogle_Newcus());
      }
    } catch  {
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md p-6 rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Customer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Social Media Handle</label>
            <input
              type="text"
              value={social}
              onChange={(e) => setSocial(e.target.value)}
              className="p-2 rounded-md border border-gray-300"
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-black text-white py-2 px-4 rounded-md hover:bg-opacity-80 transition"
          >
            Submit
          </button>

          <div
            onClick={() => {
              dispatch(Toggleleadsrenderstep(2));
              dispatch(Toogle_Newcus());
            }}
            className="mt-2 bg-[#817F7F] text-center cursor-pointer text-white py-2 px-4 rounded-md hover:bg-opacity-80 transition"
          >
            Back
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
