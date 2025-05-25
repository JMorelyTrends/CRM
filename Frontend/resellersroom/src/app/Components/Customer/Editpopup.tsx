'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/Resellerstore";
import { Toogle_Editopen } from "../../../lib/features/CustomerCrm/CustomerCrmslice";
import axios from "axios";
import { toast } from "sonner";
export default function EditPopup() {
  const dispatch = useDispatch();
  const open = useSelector((state: RootState) => state.Cus.openedit);
  const customer = useSelector((state: RootState) => state.Cus.Selected_customer);
   
  const close = () => {
    dispatch(Toogle_Editopen());
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
      setName(customer.Name || "");
      if(customer.Custoemrfrom!=="Mongodb")
      {
        setFirstName(customer?.Name?.split(' ')[0]||"");
        setLastName(customer?.Name?.split(' ')[1]||"")
      }
      setEmail(customer.Email || "");
      setPhone(customer.Phone || "");
      setSocialHandle(customer.SocialHandle || "");
      setEmailMarketingConsent(customer.emailMarketingConsent || "");
    }
  }, [customer, ]);
console.log(customer)
  const handleSubmit = async() => {
    const data =
      customer.Custoemrfrom === "Mongodb"
        ? { id:customer.id, Name:name, email, Number:phone, socialhandel:socialHandle, Custoemrfrom:'Mongodb' }
        : {id:customer.id, firstName, lastName, email, phone, emailMarketingConsent, Custoemrfrom:'shopify' };
         
        try{
               const re= await axios.post( `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/customers/update_Customer_Crm`,
          {
            Cust:data,
          })
          if(re.data)
          {
            toast.success("Customer updated succesfully")
            setEmail("")
            setFirstName("");
            setLastName("")
            setPhone("")
            setName("")
            dispatch(Toogle_Editopen())

          }
        }
        catch(err:any)
        {
          if(err.response)
          {
          console.log(err.response.data.error)
          toast.error(err.response.data.error)
                
          }

        }
  
      
  };

  const isMongo = customer?.Custoemrfrom === "Mongodb";

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className={`${isMongo ? "max-w-xl" : "max-w-md"} p-6 rounded-xl shadow-lg`}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Customer Details</DialogTitle>
        </DialogHeader>

        <div className="mt-5 grid grid-cols-1 gap-4">
          {isMongo ? (
            <>
              <div className="flex flex-col gap-1">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Social Handle</Label>
                <Input value={socialHandle} onChange={(e) => setSocialHandle(e.target.value)} />
              </div>
            </>
          ) : (
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
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            
            </>
          )}

          <div className="pt-4 flex justify-center">
            <Button onClick={handleSubmit} className="w-28">Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
