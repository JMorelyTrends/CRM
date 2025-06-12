'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/Resellerstore";
import { AddSelectedCustomer, Toogle_Editopen } from "../../../lib/features/CustomerCrm/CustomerCrmslice";
import { AddSubmitingCustomer,ADD_Matched_cutomer,Toogleshopifypopup, Addselectedcusotmer } from "@/lib/features/Newrequest/NewRequestSlice";
import Shopifyupdatepopup from "../Newrequest panel/Shopifyupdatepopup";
import Shopifymatch from "../Newrequest panel/Shopifymatch";
import axios, { AxiosResponse } from "axios";
import { toast } from "sonner";
import { Custprop } from "../Small comps/Types";
import PhoneInput from "../Small comps/PhoneInput";

interface CustomerResponse {
  alert?: string;
  customer?: Custprop;
}

export default
 function EditPopup({getcustomers,method}
  :{getcustomers:()=>Promise<void>,method:string}) {


  const dispatch = useDispatch();
  const open = useSelector((state: RootState) => state.Cus.openedit);
  const customer = useSelector((state: RootState) => state.Cus.Selected_customer);
  const orderid=useSelector((state:RootState)=>state.Rew.selectorderid)
  const close = () => {
    dispatch(Toogle_Editopen());
    dispatch(Addselectedcusotmer(null))
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailMarketingConsent, setEmailMarketingConsent] = useState("");

  useEffect(() => {
    
    if (customer) {
     
      setFirstName(customer.first_name)
      setLastName(customer.last_name)
      setEmail(customer.email || "");
      setPhone(customer.Number || "");
      setEmailMarketingConsent(customer.emailMarketingConsent?.marketingState || "");
      setSocialHandle(customer.socialhandel || "");
    }
  }, [customer, ]);
  const getlastn = (s:string, n:number) => s.slice(-n);
  const getfirstn=(s:string, n:number) =>s.slice(0,n)
  const handleSubmit = async() => {
    // Validate phone number
    if (phone) {
      const cleanNumber = phone.replace(/^\+/, '');
      const phoneNumber = getlastn(cleanNumber, 10);
      if (phoneNumber.length !== 10) {
        toast.error("Phone number must be 10 digits");
        return;
      }
    }
    
    const data =
        {_id:customer._id,id:customer.shopifyid, firstName, lastName, email, phone, emailMarketingConsent,social:socialHandle };  
        try{ 
           let newc: AxiosResponse<CustomerResponse>;
        if(  method=="leads"){
         newc = await axios.post( `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/customers/updateCustomer`,
          {
            Cust:data,
            orderid
          })
            if(newc&&newc&&newc.data?.alert==="Exists in Shopify database")
            {
              const submitteddata = {
                name,
                Number:phone=='+0'?"":phone,
                email,
                socialhandel:socialHandle
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
            setEmail("")
            setFirstName("");
            setLastName("")
            setPhone("")
            setName("")
            getcustomers()
            dispatch(AddSelectedCustomer(null))
            dispatch(Toogle_Editopen())
          }
        
        }
          else{
            newc = await axios.post( `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/customers/Cuscrmupdate`,
              {
                Cust:data,
              })
              if(newc&&newc&&newc.data?.alert==="Exists in Shopify database")
                {
                  
               
                  toast.error(`${newc.data?.alert}`)
                }
              else
              {
                toast.success("Customer updated succesfully")
                setEmail("")
                setFirstName("");
                setLastName("")
                setPhone("")
                setName("")
                getcustomers()
                dispatch(AddSelectedCustomer(null))
                dispatch(Toogle_Editopen())
              }
          }
       
      
        }
        catch(err:unknown)
        {
          console.log(err)
          if(axios.isAxiosError(err))
          {
           toast.error(err.response?.data?.data || "An error occurred");
          }
        }
  };

  const isMongo = false;

  return (
    <>
   
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md p-4 rounded-xl shadow-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Customer Details</DialogTitle>
        </DialogHeader>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <Shopifyupdatepopup />
          <Shopifymatch from="leads" getcustomers={getcustomers} />
            <>
              <div className="flex flex-col gap-1">
                <Label>First Name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Last Name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Phone</Label>
                <PhoneInput
                number={phone}
                setNumber={setPhone}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Social Handle</Label>
                <Input value={socialHandle} onChange={(e) => setSocialHandle(e.target.value)} />
              </div>
            </>

          <div className="pt-4 flex justify-center">
            <Button onClick={handleSubmit} className="w-28">Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
