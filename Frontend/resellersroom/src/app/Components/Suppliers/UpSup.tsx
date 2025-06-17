"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import BrandSelector from "./BrandSelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/Resellerstore";
import { AddselectedSup } from "@/lib/features/Supplier/SupplierSlice";
import PhoneInput from "../Small comps/PhoneInput";
import axios from "axios";
type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const UpSup = (props: Props) => {
    
    
      const supplier = useSelector(
        (state: RootState) => state.Sup.SelectedSupplier
      );
      const dispatch=useDispatch();


  // Input states
  const [supplierName, setSupplierName] = useState<string>();
  const [number, setNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [website, setWebsite] = useState<string>("");

  // Brand selection
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  //useeffects

  useEffect(()=>{
    if(supplier)
    {
        setSupplierName(supplier.Name?supplier.Name:"");
        setNumber(supplier.Number?supplier.Number:"")
        setEmail(supplier.Email?supplier.Email:"")
        setWebsite(supplier.Website?supplier.Website:"")
        setSelectedBrands(supplier.Brand?supplier.Brand:[])
    }
  },[supplier])

  const close = () => {
    props.setOpen(false);
    // setEmail("");
    // setWebsite("");
    // setNumber("");
    // setSupplierName("");
    // setSelectedBrands([]);
  };
  const getlastn = (s:string, n:number) => s.slice(-n);
  const handleUpdate = async() => {
    if (number) {
      const cleanNumber = number.replace(/^\+/, '');
      const phoneNumber = getlastn(cleanNumber, 10);
      if (phoneNumber.length !== 10) {
        toast.error("Phone number must be 10 digits");
        return;
      }
    }

    if (
      supplierName &&
      ((number && !email) || (!number && email) || (number && email))
    ) {

       const newSupplier = {
     Name: supplierName,
     Number:number,
     Email:email,
     Website:website,
     Brand:selectedBrands
};

        
    try {
      const newupsup=  await axios.post( `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/supplier/updatesupplier`,{
            id:supplier._id,
            newSupplier
         })
         console.log(newupsup.data.data)
         dispatch(AddselectedSup(newupsup.data.data))
          if (newupsup.data.message)
             {
             return toast.error("supllier already exits");
             }
      toast.success("Supplier updated successfully!");
   close()
}
      catch{
        toast.error("Supplier updated unsuccessfully!")
      }
      
    } else {
      toast.error(
        "Please enter Name and either Number OR Email (only one, not both)."
      );
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={() => close()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-90 z-50">
          <DialogHeader>
            <DialogTitle className="w-full text-center text-2xl">
              Update Supplier
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            {/* Input Fields */}
            <input
              type="text"
              placeholder="Supplier Name"
              value={supplierName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSupplierName(e.target.value)
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            {/* <input
              type="text"
              placeholder="Number"
              value={number}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNumber(e.target.value)
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            /> */}
              <PhoneInput number={number} setNumber={setNumber} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <input
              type="text"
              placeholder="Website"
              value={website}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setWebsite(e.target.value)
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />

            {/* Brand Dropdown */}
            <BrandSelector
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
            />

            {/* Buttons */}
            <div className="flex justify-between mt-4">
              <Button
                onClick={() => handleUpdate()}
                className="bg-[#454545] text-white w-[48%] rounded-lg hover:bg-[#333333]"
              >
                Update Supplier
              </Button>
              <Button
                onClick={() => close()}
                variant="outline"
                className="w-[48%] flex items-center gap-2 rounded-lg"
              >
                <X size={16} />
                Back
              </Button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default UpSup;
