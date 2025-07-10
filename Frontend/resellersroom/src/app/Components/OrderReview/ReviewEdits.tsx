'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/Resellerstore';
import { ToogleEdit } from '@/lib/features/OrederReview/OrderReviewSlice';
import { Slinedata ,Supplier} from "../Small comps/Types";
import axios from "axios";
import { Toggleleadsrenderstep } from "@/lib/features/Newrequest/NewRequestSlice";
import SupplierDropdown from "../Leads_panel/SupplierDropdown";
export default function ReviewEdits({getwons}:{getwons:React.Dispatch<React.SetStateAction<void>>}) {
    const dispatch=useDispatch()
    const open=useSelector((state:RootState)=>state.Rew.isOpen)
    const order=useSelector((state:RootState)=>state.Rew.selectedOrder)
    const [dummyLinedata, setDummyLinedata] = useState<Slinedata[]|null>(null);
    const [shipingfee,setshippingfee]=useState<string>("");
    const [processingfee,setprocessingfee]=useState<string>("");
    const [Source,setSource]=useState<string>("")
    const [Supplier,setSupplier]=useState<string>("");
    const [Traffic,setTraffic]=useState<string>("shopify")
  const [userid,setuserid]=useState<string|null>("")
    const [availsuppliers,setavailsuppliers]=useState<Supplier[]>()
    const close=()=>{
       setshippingfee("0") 
   setprocessingfee("0")
  setDummyLinedata(null)
  setTraffic("shopify");
  setSource("");
  setSupplier("");
  getwons()
    dispatch(ToogleEdit())
  }
  let f=false;
const getsuppliers=async()=>{
     const sup=await axios.post(  `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/supplier/getallsuppliers`,{
      userid
     });
      setavailsuppliers(sup.data.supps)
    }

  useEffect(()=>{
   if(userid!==""&&userid)
   {

    getsuppliers();
   }
   
  },[userid])

 useEffect(() => {
    dispatch(Toggleleadsrenderstep(0));
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("tempcred");
      setuserid(id);
    }
  }, []);
  useEffect(()=>{
 
  if(order && order.linedata && !f){
   setshippingfee(order.shipingfee?order.shipingfee?.toString():"0") 
   setprocessingfee(order.processingfee?order.processingfee.toString():"0")
  setDummyLinedata(order?.linedata)
  setTraffic("shopify");
  setSource(order?.Source_of_truth?order?.Source_of_truth:"");
  setSupplier(order.Supplier_Name?._id||"");
  f=true
}
  },[order])

  const Submit=async()=>{
     if (!order || !dummyLinedata) return;

     let AcutalCog=0;
     dummyLinedata.map((d)=>{
        if(d.costprice){
      AcutalCog+=d.costprice;}
     })
  // Build metadata array
  const metadata = [
    { name: "Shipping Fee", value: shipingfee },
    { name: "Processing Fee", value: processingfee },
    {name:'Custom',value:AcutalCog},
  ];

  // Final payload for updating MongoDB and using in metadata
  const payload = {
    _id: order._id, // MongoDB document ID
    shipingfee,
    processingfee,
    Revenue:order.Revenue,
    Traffic_Source: Traffic,
    Source_of_truth: Source,
    Supplier_Name: Supplier,
    linedata: dummyLinedata,
    AcutalCog,
    metadata,
  };

try
 {await axios.post( `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Review/UpdateReview`,{
    payload
})
close()
}

  catch(err)
  {
    console.log(err,"error updating order")
  }
  }

  return (
    <Dialog open={open} onOpenChange={() => {close()}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Order Details</DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-1 gap-4">
          {/* General Inputs */}
          <div className="flex flex-col gap-1">
            <Label>Shipping Fee</Label>
            <Input value={shipingfee} onChange={(e)=>{
                    const val = e.target.value;
                      if (/^\d*$/.test(val)) {
                        setshippingfee(val);
                      }
                      }} />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Processing Fee</Label>
            <Input value={processingfee} onChange={(e)=>{
                const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    setprocessingfee(val);
                  }
                  }} />
          </div>

     <div className="flex flex-col gap-1">
  
 <Label>Source of Truth</Label>
  <select
    value={Source}
    onChange={(e) => setSource(e.target.value)}
    className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Select  Source</option>
    <option value="Whatsapp broadcast">Whatsapp broadcast</option>
    <option value="B2B client">B2B client</option>
    <option value="IG organic">IG organic</option>
    <option value="Meta paid">Meta paid</option>
    <option value="Google paid">Google paid</option>
    <option value="Organic search">Organic search</option>
    <option value="Word of mouth referral">Word of mouth referral</option>
    <option value="Returning client">Returning client</option>
    <option value="Email marketing">Email marketing</option>
    <option value="Website">Website</option>
  </select>
</div>

        

          <div className="flex flex-col gap-1">
            <Label>Supplier Name</Label>
              {
    availsuppliers && availsuppliers.length>0 && <SupplierDropdown availsuppliers={availsuppliers}  supplierUsed={Supplier} setSupplierUsed={setSupplier} getsuppliers={getsuppliers} />
  }
          </div>

          {/* Line Item Costs */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Line Item Costs</h3>
            <div className="space-y-4">
              {dummyLinedata &&dummyLinedata.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-1">{item.title} x{item.quantity}</div>
                  <Input
                    className="w-32"
                    defaultValue={item.costprice}
                    onChange={(e)=>{
                        const updateline=[...order?.linedata??[]];
                        updateline[i]={
                            ...updateline[i],
                            costprice:parseFloat(e.target.value)
                        }
                       setDummyLinedata(updateline)
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 flex justify-center">
            <Button className="w-32"
            onClick={()=>{
                Submit()
            }}
            >Save</Button>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}
