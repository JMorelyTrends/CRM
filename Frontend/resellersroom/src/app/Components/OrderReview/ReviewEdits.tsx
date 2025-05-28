'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useDispatch, UseDispatch,useSelector } from 'react-redux';
import { RootState } from '@/lib/Resellerstore';
import { ToogleEdit,AddSelectedOrder } from '@/lib/features/OrederReview/OrderReviewSlice';
import { Slinedata,OrderRpr } from "../Small comps/Types";
import axios from "axios";
export default function ReviewEdits() {
    const dispatch=useDispatch()
    const open=useSelector((state:RootState)=>state.Rew.isOpen)
    const order=useSelector((state:RootState)=>state.Rew.selectedOrder)
  const [dummyLinedata, setDummyLinedata] = useState<Slinedata[]|null>(null);
  const [shipingfee,setshippingfee]=useState<string>("");
  const [processingfee,setprocessingfee]=useState<string>("");
  const [Source,setSource]=useState<string>("")
  const [Supplier,setSupplier]=useState<string>("");
  const [Traffic,setTraffic]=useState<string>("")
  const close=()=>{
    dispatch(ToogleEdit())
  }
  let f=false;
  useEffect(()=>{
  console.log(order)
  if(order && order.linedata && !f){
    
  setDummyLinedata(order?.linedata)
  setTraffic(order.Traffic_Source?order?.Traffic_Source:"");
  setSource(order?.Source_of_truth?order?.Source_of_truth:"");
  setSupplier(order?.Supplier_Name?order.Supplier_Name:"");
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

  console.log("🛠 Final payload to send:", payload);

 const t=await axios.post( `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Review/UpdateReview`,{
    payload
  })
  console.log(t.data)
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
            <Label>Traffic Source</Label>
            <Input value={Traffic} onChange={(e)=>{setTraffic(e.target.value)}} />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Source of Truth</Label>
            <Input value={Source} onChange={(e)=>{setSource(e.target.value)}} />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Supplier Name</Label>
            <Input value={Supplier} onChange={(e)=>{setSupplier(e.target.value)}} />
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
                        const updateline=[...order?.linedata!];
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
