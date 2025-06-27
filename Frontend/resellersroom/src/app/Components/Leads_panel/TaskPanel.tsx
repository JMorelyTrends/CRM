"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Check, X } from "lucide-react";
import axios from "axios";
import { labeltype,Task } from "../Small comps/Types";

import {  useDispatch  } from 'react-redux';
import {addLabel}from "../../../lib/features/Leads/LeadsSlice"
import { toast } from "sonner";



export function TaskPanel({
  open,
  setOpen,
  task,
  fetchallorders,
  openlabeldialog,
  setopenlabeldialog
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  task: Task | null;
  fetchallorders: () => void;
  openlabeldialog:boolean,
  setopenlabeldialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const dispatch=useDispatch();
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [createLabelOpen, setCreateLabelOpen] = useState(false);
  const [Description, setDescription] = useState<string>(task?.Description ?? "");
  const [selectedLabels, setSelectedLabels] = useState<labeltype[]>(task?.labels ?? []);
  const [newLabel, setNewLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState("bg-blue-500");
  const [availableLabels, setavailableLabels] = useState<labeltype[]>([]);
  const [costPrice, setCostPrice] = useState<string>(task?.price?.toString()||"");
  

  useEffect(()=>{
    if(task)
    {
    const cc=  (task?.stockxitem?.length > 0 && task?.stockxitem[0]?.last_sale_price
      ? (task.price === 0 
          ? task.stockxitem[0].last_sale_price 
          : task.price || 0)
      :task?.items&& task?.items?.length > 0
        ? (task.price === 0 
            ? task.items?.[0]?.price || 0
            : task.price || 0)
        : task.price || 0 )
        
        setCostPrice(cc.toString()||"0")
    }
   
  },[])


  const handleCostPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === "" || /^\d*$/.test(value)) {
      setCostPrice(value);
    }
  };

  const AddnewLabel = async (color: string, label: string) => {
    try {
      const userid = localStorage.getItem("tempcred");
      if (!userid) return;

      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/features/addlabel`, {
        color: color,
        name: label,
        userid: userid
      });

      setCreateLabelOpen(false);
      const availtags = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/features/getlabels`, {
        id: userid
      });

      setavailableLabels(availtags.data.data || []);
      dispatch(addLabel(availtags.data.data||[]))
      setLabelDialogOpen(true);
    } catch (err) {
      console.error("Failed to add label", err);
    }
  };

  const toggleLabel = async (label: labeltype) => {
    if (!task?._id) return;
  
     console.log(selectedLabels)
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

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const userid = localStorage.getItem("tempcred");
        if (!userid) return;

        const availtags = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/features/getlabels`, {
          id: userid
        });

        setavailableLabels(availtags.data.data || []);
        dispatch(addLabel(availtags.data.data||[]))
      } catch (err) {
        console.error("Failed to fetch labels", err);
      }
    };

    fetchLabels();
  }, [createLabelOpen, labelDialogOpen]);

  const SupmitDesription = async () => {
    if (!task?._id) return;
    setOpen(false);
    
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/UpdateDescription`, {
        Description: Description,
        orderid: task._id,
        price:costPrice
      });
      fetchallorders();
    } catch (err) {
      console.error("Failed to update description", err);
    }
  };
  const handleDeleteLabel=async(id:string)=>{
    try{
       await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/features/dellabel`,{
          id:id
         })
       setavailableLabels(  availableLabels.filter((label:labeltype)=> id!==label._id))
       dispatch(addLabel(availableLabels.filter((label:labeltype)=> id!==label._id)))
    }
    catch{

    }
  }

  const colors = [
    "bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-400",
    "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
    "bg-orange-500", "bg-lime-500", "bg-emerald-500", "bg-cyan-500",
    "bg-rose-500", "bg-violet-500", "bg-fuchsia-500", "bg-sky-500",
    "bg-amber-500", "bg-gray-500", "bg-zinc-500", "bg-neutral-500",
    "bg-stone-500", "bg-blue-400", "bg-green-400", "bg-red-400",
    "bg-pink-400", "bg-purple-400", "bg-yellow-300", "bg-orange-400",
    "bg-teal-400", "bg-indigo-400"
  ];

  // Add this function for deleting the task
  const handleDeleteTask = async () => {
    if (!task?._id) return;
     try{
        await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/deleteorders`,{
          data: { id:task._id }
        })
        fetchallorders();
     }
     catch{
      toast.error("error occur while deleting a lead")
     }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => SupmitDesription()}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-90 z-50">
            <DialogHeader>
              <DialogTitle className="w-full text-center text-2xl">
                {task?.Name ?? "Unnamed Task"}
              </DialogTitle>
            </DialogHeader>

            {/* Image + Info Section */}
            <div className="flex items-center gap-4 mb-6">
              {/* Left side - Info */}
              <div className="w-[60%] h-full flex gap-4 flex-col justify-center items-center text-center">
                {task?.stockxitem?.[0]?.name && (
                  <div className="text-lg font-semibold text-wrap">
                    {task.stockxitem[0].name}
                  </div>
                )}
                {task?.items?.[0]?.Name && (
                  <div className="text-lg font-semibold">
                    {task.items[0].Name}
                  </div>
                )}
                <div className="text-lg font-semibold">
                  {task?.Name}
                </div>
                {task?.email && (
                  <div className="text-sm font-semibold text-[#4774B1]">
                    {task.email}
                  </div>
                )}
                {task?.phone && (
                  <div className="text-sm font-semibold text-[#4774B1]">
                    {task.phone}
                  </div>
                )}
                {task?.Description && (
                  <div className="text-sm text-gray-600">
                    {task.Description}
                  </div>
                )}
              </div>

              {/* Right side - Image */}
              <div className="w-[40%] h-full">
                {task?.stockxitem?.[0]?.image && (
                  <img
                    src={task.stockxitem[0].image}
                    alt="Product"
                    className="w-[150px] h-[150px] object-contain rounded"
                  />
                )}
                {task?.items?.[0]?.itempics && (
                  <img
                    src={task.items[0].itempics[0]}
                    alt="Product"
                    className="w-[150px] h-[150px] object-contain rounded"
                  />
                )}
              </div>
            </div>

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
                      onClick={() => toggleLabel(label)}
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
              <div className="mt-4 flex items-center gap-3">
  <span className="text-sm font-medium">Cost Price :</span>
  
  <div className="relative w-[18%]">
    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">£</span>
    <input
      type="text"
      value={costPrice}
      onChange={handleCostPriceChange}
      placeholder="Enter cost price"
      className="w-full text-center pl-6 pr-2 py-2 border rounded-md text-sm"
    />
  </div>
</div>

            </div>

            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea
                value={Description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full rounded-md border p-2 text-sm resize-none"
                placeholder="Add task description..."
              />
            </div>
            {/* Delete Task Button */}
            <div className="flex justify-center my-4">
              <Button variant="destructive" onClick={handleDeleteTask}>
                Delete Task
              </Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <Dialog open={labelDialogOpen||openlabeldialog} onOpenChange={() => {setLabelDialogOpen(false)
        setopenlabeldialog(false)
      }}>
        <DialogContent className="sm:max-w-sm p-4">
          <DialogHeader>
            <DialogTitle>Select a Label</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 my-4">
          {availableLabels?.map((label) => (
  <div key={label._id} className="flex items-center justify-between gap-2 border p-2 rounded-md">
    <Button
      variant="ghost"
      onClick={() => toggleLabel(label)}
      className="flex-grow justify-start gap-2"
    >
      <span className={`w-3 h-3 rounded-full ${label.label.col}`} />
      {label.label.name}
      {selectedLabels?.find((l) => l._id === label._id) && <Check size={16} />}
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
