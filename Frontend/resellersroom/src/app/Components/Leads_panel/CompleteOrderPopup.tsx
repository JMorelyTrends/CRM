// components/DealDialog.tsx
'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Task, labeltype } from "../Small comps/Types";
import { Supplier } from "../Small comps/Types";
import { TaskPanel } from "./TaskPanel";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/Resellerstore";
import axios from "axios";
import { toast } from "sonner";
export function CompleteOrderPopup({
  open,
  setOpen,
  task,
  fetchallorders
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  task: Task;
  fetchallorders: () => void;
}) {
  const [productName, setProductName] = useState(task.Name);
  const [size, setSize] = useState(task.size);
  const [costPrice, setCostPrice] = useState<string>(task.stockxitem?.[0]?.last_sale_price?.toString() ||task.items?.[0]?.price.toString() ||'');
  const [shippingFee, setShippingFee] = useState<string>(task.Shippingfee?task.Shippingfee:'');
  const [processingFee, setProcessingFee] = useState<string>(task.processingfee?task.processingfee:'');
  const [supplierUsed, setSupplierUsed] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<string>(task.shippingaddress?task.shippingaddress:'');
  const [dealOwner, setDealOwner] = useState<string>(task.DealOwner?task.DealOwner:'');
  const [sourceOfTruth, setSourceOfTruth] = useState<string>(task.Sourceofthruth?task.Sourceofthruth:'');
  const [paymentMethod, setPaymentMethod] = useState<string>(task.paymentmethod?task.paymentmethod:'');
 
//usestates for feautres
  const [selectedLabels, setSelectedLabels] = useState<labeltype[]>(task.labels);
  const [LabelDialogOpen,setLabelDialogOpen]=useState<boolean>(false)
  const [createLabelOpen, setCreateLabelOpen] = useState(false);
  const [availableLabels, setavailableLabels] = useState<labeltype[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState("bg-blue-500");

  const [availsuppliers,setavailsuppliers]=useState<Supplier[]>()
  let item:any=task&& task.stockxitem.length>0?task.stockxitem[0]: task.items&&task.items?.length>0?task.items[0]:{};//change this 


  useEffect(()=>{
    const getsuppliers=async()=>{
     const sup=await axios.get(  `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/supplier/getallsuppliers`);
     console.log(sup.data.supps)
      setavailsuppliers(sup.data.supps)
    }
    getsuppliers();

  },[])

  useEffect(() => {
    if (open && task) {
      setProductName(task.Name);
      setSize(task.size);
      setCostPrice(task.stockxitem?.[0]?.last_sale_price?.toString() ||task.items?.[0]?.price.toString() ||'');
      setShippingFee(task.Shippingfee?task.Shippingfee:'');
      setProcessingFee(task.processingfee?task.processingfee:'');
      setSupplierUsed((task.Supplierid&&task.Supplierid?._id)?task.Supplierid._id:'');
      setShippingAddress(task.shippingaddress?task.shippingaddress:'');
      setDealOwner(task.DealOwner?task.DealOwner:'');
      setSourceOfTruth(task.Sourceofthruth?task.Sourceofthruth:'');
      setPaymentMethod(task.paymentmethod?task.paymentmethod:'');
      setSelectedLabels(task.labels);
 


      //
    
      if(task.stockxitem.length>0)
      {
        item=task.stockxitem[0]
      }
      else if(task.items){
        item=task.items[0];
      }

     
    }
    
  }, [task, open]);




  const AddnewLabel = async (color: string, label: string) => {
    try {
      const userid = localStorage.getItem("tempcred");
      if (!userid) return;

      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/features/addlabel`,
        {
          color,
          name: label,
          userid,
        }
      );

      setCreateLabelOpen(false);
      const availtags = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/features/getlabels`,
        {
          id: userid,
        }
      );

      setavailableLabels(availtags.data.data || []);
      setLabelDialogOpen(true);
    } catch (err) {
      console.error("Failed to add label", err);
    }
  };

  const Labeltoggle = async (label: labeltype) => {
    if (!task?._id) return;
  
     console.log(label)
    const isAlreadySelected = selectedLabels.some((l) => l._id === label._id);
    const updatedLabels = isAlreadySelected
      ? selectedLabels.filter((l) => l._id !== label._id)
      : [...selectedLabels, label];

    setSelectedLabels(updatedLabels);

    try {
      const cleanlabel =  updatedLabels.map(({ _id }) => _id);;
       await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/updatelabels`, {
        newlabels: cleanlabel,
        orderid: task._id
      });

      fetchallorders();
    } catch (err) {
      console.error("Failed to update labels", err);
    }
  };
  const handleDeleteLabel=async(id:string)=>{
    try{
       await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/features/dellabel`,{
          id:id
         })
       setavailableLabels(  availableLabels.filter((label:labeltype)=> id!==label._id))
     
    }
    catch{

    }
  }

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const userid = localStorage.getItem("tempcred");
        if (!userid) return;

        const availtags = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/features/getlabels`,
          {
            id: userid,
          }
        );

        setavailableLabels(availtags.data.data || []);
      } catch (err) {
        console.error("Failed to fetch labels", err);
      }
    };

    fetchLabels();
  }, [createLabelOpen, LabelDialogOpen]);


  const colors = [
    "bg-red-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-yellow-400",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-lime-500",
    "bg-emerald-500",
    "bg-cyan-500",
    "bg-rose-500",
    "bg-violet-500",
    "bg-fuchsia-500",
    "bg-sky-500",
    "bg-amber-500",
    "bg-gray-500",
    "bg-zinc-500",
    "bg-neutral-500",
    "bg-stone-500",
    "bg-blue-400",
    "bg-green-400",
    "bg-red-400",
    "bg-pink-400",
    "bg-purple-400",
    "bg-yellow-300",
    "bg-orange-400",
    "bg-teal-400",
    "bg-indigo-400",
  ];
const Orderreview =()=>{

}
  const Submit=async()=>{
   

    if(productName &&size&&costPrice&&shippingFee&&processingFee&&supplierUsed&&shippingAddress&&dealOwner&&sourceOfTruth&&paymentMethod)
    {
     
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/Confrimorder`,
        {
         _id:task._id,
         price:costPrice,
         Name:productName,
         size:size,
         Supplierid:supplierUsed,
         Shippingfee:shippingFee,
         processingfee:processingFee,
         shippingaddress:shippingAddress,
         Sourceofthruth:sourceOfTruth,
         paymentmethod:paymentMethod,
         DealOwner:dealOwner,
        }
      );
      fetchallorders()
       setOpen(false)

    }
    else{
      toast("Fill all fields")
    }
  }
 
  return (

    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Complete Order Details</DialogTitle>
        </DialogHeader>

        {/* Image + Name */}
        <div className="flex items-center gap-4 mb-6">
         <div className=" w-[40%] h-full"> <img
            src={task?.stockxitem?.[0]?.image ||task.items&&task.items[0].itempics[0]|| '/placeholder.jpg'}
            alt={task.Name}
            className="w-[150px] h-[150px] object-contain rounded "
          />
          </div>
          <div className="  w-[60%] h-full flex gap-4   flex-col justify-center items-center text-center">
                       <div className="text-lg font-semibold">{task.Name} </div>
                       <div className="text-sm font-semibold text-[#4774B1]">{task.email}</div>
                       <div className="text-sm font-semibold text-[#4774B1]">{task.phone}</div>
          </div>
        </div>

             {/* Inputs in 2 balanced columns */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium">Confirm Product Name</label>
      <input type="text" className="w-full border rounded px-3 py-2 mt-1"
        value={productName} onChange={(e) => setProductName(e.target.value)} />
    </div>
    <div>
      <label className="block text-sm font-medium">Confirm Size</label>
      <input type="text" className="w-full border rounded px-3 py-2 mt-1"
        value={size} onChange={(e) => setSize(e.target.value)} />
    </div>
    <div>
      <label className="block text-sm font-medium">Cost Price</label>
      <input type="string" className="w-full border rounded px-3 py-2 mt-1"
        value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
    </div>
<div>
  <label className="block text-sm font-medium">Supplier Used</label>
  <select
    className="w-full border rounded px-3 py-2 mt-1"
    value={supplierUsed}
    onChange={(e) => setSupplierUsed(e.target.value)}
  >
    <option value="">Select Supplier</option>
    {availsuppliers&&availsuppliers?.map((supplier) => (
      <option key={supplier._id} value={supplier._id}>
        {supplier.Name || "Unnamed Supplier"}
      </option>
    ))}
  </select>
</div>
    <div>
      <label className="block text-sm font-medium">Deal Owner</label>
      <select className="w-full border rounded px-3 py-2 mt-1"
        value={dealOwner} onChange={(e) => setDealOwner(e.target.value)}>
        <option value="">Select Deal Owner</option>
        <option value="Owner A">Alfy</option>
        <option value="Owner B">Fran</option>
      
      </select>
    </div>
  </div>

  <div className="space-y-5 ">
    <div>
      <label className="block text-sm font-medium">Shipping Fee</label>
      <input type="string" className="w-full border rounded px-3 py-2 mt-1"
        value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} />
    </div>
    <div>
      <label className="block text-sm font-medium">Processing Fee</label>
      <input type="string" className="w-full border rounded px-3 py-2 mt-1"
        value={processingFee} onChange={(e) => setProcessingFee(e.target.value)} />
    </div>
    <div>
      <label className="block text-sm font-medium">Confirm Shipping Address</label>
      <textarea rows={3} className="w-full border rounded px-3 py-2 mt-1"
        value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
    </div>
    <div>
      <label className="block text-sm font-medium">Source of Truth</label>
      <select className="w-full border rounded px-3 py-2 mt-1"
        value={sourceOfTruth} onChange={(e) => setSourceOfTruth(e.target.value)}>
        <option value="">Select Source</option>
        <option value="Source A">Source A</option>
        <option value="Source B">Source B</option>
        <option value="Source C">Source C</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium mt-10">Confirm Payment Method</label>
      <select className="w-full border rounded px-3 py-2 mt-1"
        value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
        <option value="">Select Payment Method</option>
        <option value="Bank Transfer">Bank Transfer</option>
        <option value="PayPal">PayPal</option>
        <option value="Cash">Cash</option>
      </select>
    </div>
  </div>
             </div>
             
             
             {/* Labels */}
             <div className="mb-6">
               <h3 className="text-sm font-semibold mb-2">Labels</h3>
               <div className="flex gap-2 flex-wrap">
                {selectedLabels?.map((label) => (
                  <div
                    key={label._id}
                    className={`px-3 py-1 text-sm rounded-full text-white flex items-center gap-1 ${label.label.col}`}
                  >
                    {label.label.name}
                    <button
                      onClick={() => Labeltoggle(label)}
                      className="text-white hover:text-gray-200"
                      title="Remove label"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <Button size="icon" variant="outline" onClick={() => setLabelDialogOpen(true)}>
                  <Plus size={16} />
                </Button>
              </div>
             </div>
             
             {/* Submit Button */}
            { task.confirm==false?<div className="flex justify-end">
               <Button onClick={() =>Submit()}>Submit</Button>
             </div>:<div className="flex justify-end">
               <Button onClick={() =>Orderreview()}>Order review</Button>
             </div>}
      </DialogContent>
    </Dialog>

    <Dialog open={LabelDialogOpen} onOpenChange={() => setLabelDialogOpen(false)}>
   <DialogContent className="sm:max-w-sm p-4">
    <DialogHeader>
      <DialogTitle>Select a Label</DialogTitle>
    </DialogHeader>
    <div className="grid grid-cols-2 gap-2 my-4">
            {availableLabels?.map((label) => (
              <div
                key={label._id}
                className="flex items-center justify-between gap-2 border p-2 rounded-md"
              >
                <Button
                  variant="ghost"
                  onClick={() => Labeltoggle(label)}
                  className="flex-grow justify-start gap-2"
                >
                  <span className={`w-3 h-3 rounded-full ${label.label.col}`} />
                  {label.label.name}
                  {selectedLabels?.find((l) => l._id === label._id) && (
                    <Check size={16} />
                  )}
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteLabel(label._id)}
                  className="ml-2 w-5 h-5 cursor-pointer"
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setLabelDialogOpen(false);
              setCreateLabelOpen(true);
            }}
          >
            Create New Label
          </Button>
  </DialogContent>
    </Dialog>

    <Dialog open={createLabelOpen} onOpenChange={setCreateLabelOpen}>
        <DialogContent className="sm:max-w-sm p-4">
          <DialogHeader>
            <DialogTitle>Create a Label</DialogTitle>
          </DialogHeader>
          <input
            className="w-full p-2 border rounded mb-4"
            placeholder="Label Name"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap mb-4">
            {colors.map((color) => (
              <div
                key={color}
                className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                  selectedColor === color ? "border-black" : "border-transparent"
                } ${color}`}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
          <Button onClick={() => AddnewLabel(selectedColor, newLabel)}>Add</Button>
        </DialogContent>
      </Dialog>

     
    </>
  );
}
