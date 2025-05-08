"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check, X } from "lucide-react";
import { useRouter } from 'next/navigation';
import axios from "axios";
import { labeltype, Task } from "../Small comps/Types";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/Resellerstore";
import {
  Toggleleadsrenderstep,
  Addshopifycustomer,
  Addmongodbcustomer,
  Addselectedcusotmer,
  addItem,
} from "@/lib/features/Newrequest/NewRequestSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
export function AddtagsDes({ sideopen }: { sideopen: boolean }) {
  const dispatch = useDispatch();
  const task = useSelector((state: RootState) => state.NewReq.Ordercreated);
  const router = useRouter();
  const selectedcustomer = useSelector(
    (state: RootState) => state.NewReq.Selectedonecustomer
  );
  const item = useSelector((state: RootState) => state.NewReq.selectedItems);

  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [createLabelOpen, setCreateLabelOpen] = useState(false);
  const [Description, setDescription] = useState<string>(
    task?.Description ?? ""
  );
  const [selectedLabels, setSelectedLabels] = useState<labeltype[]>(
    task?.labels ?? []
  );
  const [newLabel, setNewLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState("bg-blue-500");
  const [availableLabels, setavailableLabels] = useState<labeltype[]>([]);

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

  const toggleLabel = async (label: labeltype) => {
    
    if (!item?._id) return;
    
    const isAlreadySelected = selectedLabels.some((l) => l._id === label._id);
    const updatedLabels = isAlreadySelected
      ? selectedLabels.filter((l) => l._id !== label._id)
      : [...selectedLabels, label];

    setSelectedLabels(updatedLabels);

    try {
      const cleanlabel = updatedLabels.map(({ _id }) => _id);
     task&&( await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/updatelabels`,
        {
          newlabels: cleanlabel,
          orderid: task._id,
        })
      );
    } catch (err) {
      console.error("Failed to update labels", err);
    }
  };

  const handleDeleteLabel = async (id: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/features/dellabel`,
        {
          id,
        }
      );
      setavailableLabels(
        availableLabels.filter((label: labeltype) => id !== label._id)
      );
    } catch (err) {
      console.error("Failed to delete label", err);
    }
  };

  const submitDescription = async () => {
    if (!task?._id) return;

    try {
     
    const r=  await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/UpdateDescription`,
        {
          Description,
          orderid: task._id,
        }
        
      );
     const dummy= {
           _id: '',
           Stockxid: '',
           sku: '',
           name: '',
           slug: '',
           brand: '',
           image: '',
           createdAt: '',
           updatedAt: '',
         }
         dispatch(Addselectedcusotmer(null))
         dispatch(addItem(dummy))
         dispatch(Toggleleadsrenderstep(0))
      router.push('/Leads'); // ✅ correct
    } catch (err) {
      console.error("Failed to update description", err);
    }
  };

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
  }, [createLabelOpen, labelDialogOpen]);

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

  return (
    <>
      {" "}
      <div
        className={`${
          sideopen ? "lg:w-[30%] md:w-[35%]" : "lg:w-[30%] md:w-[70%]"
        } w-[90%] h-[92vh] bg-[#EBEBEB] flex flex-col text-black rounded-xl overflow-hidden `}
      >
        {/* Top Section */}
        <div className="  w-full h-[45%] flex flex-col justify-around items-center">
          {/* product Name */}
          <div className=" h-[15%] w-full  flex justify-center items-center text-lg font-semibold">
            {item?.name}
          </div>

          {/* Image */}
          <div className=" w-full h-[60%] flex justify-center items-center">
            <div className="h-full lg:w-[60%] md:w-[60%] w-[95%] bg-white flex justify-center items-center rounded-xl overflow-auto">
              <img
                src={item?.image || "/images/placeholder.png"}
                alt="Product"
                className="object-contain w-[70%] h-[90%]"
              />
            </div>
          </div>

          {/* Customer Name */}
          <div className="w-full h-[20%]   flex flex-col justify-center items-center text-base font-medium">
            <div>
              {" "}
              {selectedcustomer &&
                (  selectedcustomer.customerfrom === "shopify"
                  ? `${selectedcustomer.first_name} ${selectedcustomer.last_name}`
                  : selectedcustomer.Name!=''?+selectedcustomer.Name:selectedcustomer.socialhandel!=''?+selectedcustomer.socialhandel:"")}
            </div>
            <div className=" flex text-sm  items-end  justify-around font-light   w-full">
              <div className=" ">
                
                {selectedcustomer &&(
                                selectedcustomer.email!=''?
                                 selectedcustomer.email:
                                selectedcustomer.Number!=''?selectedcustomer.Number:""
                )
              }
              </div>
              <div>
                {" "}
                {selectedcustomer &&
                  (selectedcustomer.customerfrom === "shopify"
                    ? `${selectedcustomer.first_name} ${selectedcustomer.last_name}`
                    : selectedcustomer.Name != ""
                    ?  selectedcustomer.Name
                    : selectedcustomer.socialhandel != ""
                    ?  selectedcustomer.socialhandel
                    : "")}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className=" bw-full h-[60%] flex flex-col items-center justify-around">
          {/* Labels + Description */}
          <div className=" w-[90%] h-[60%] bg-white flex flex-col justify-around items-center rounded-lg p-2">
            {/* Labels */}
            <div className="w-full h-[40%]  rounded p-2 overflow-auto">
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
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setLabelDialogOpen(true)}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="w-full h-[60%] bg-white rounded p-2">
              <textarea
                value={Description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full h-full rounded-md border p-2 text-sm resize-none"
                placeholder="Add task description..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className=" w-[90%] h-[30%]  flex justify-around items-center rounded-lg p-2">
            <Button className="w-[45%]" onClick={submitDescription}>
              Save
            </Button>
            <Button
              className="w-[45%]"
              variant="outline"
              onClick={() => {
                setDescription(task?.Description ?? "");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>




      <Dialog
        open={labelDialogOpen}
        onOpenChange={() => setLabelDialogOpen(false)}
      >
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
                  onClick={() => toggleLabel(label)}
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
                  selectedColor === color
                    ? "border-black"
                    : "border-transparent"
                } ${color}`}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
          <Button onClick={() => AddnewLabel(selectedColor, newLabel)}>
            Add
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
