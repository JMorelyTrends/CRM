"use client";
import React from "react";
import { useState ,useEffect} from "react";
import axios from "axios";
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
import {  X } from "lucide-react";
import { CloudDownload } from "lucide-react";
import {AddselectedSup} from '@/lib/features/Supplier/SupplierSlice'
import {  useDispatch} from 'react-redux';
import { useRouter } from 'next/navigation';
import { Toggleleadsrenderstep } from "@/lib/features/Newrequest/NewRequestSlice";
import PhoneInput from "../Small comps/PhoneInput";
type Props = {
  Newopen: boolean;
  setNewopen: React.Dispatch<React.SetStateAction<boolean>>;
  getallsups:  React.Dispatch<React.SetStateAction<void>>; 
};

const NewSup = (props: Props) => {  
  const dispatch=useDispatch()
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [filedata, setfiledata] = useState<File | null>(null);
  const [userid,setuserid]=useState<string|null>("")
  useEffect(() => {
    dispatch(Toggleleadsrenderstep(0));
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("tempcred");
      setuserid(id);
    }
    //move to login
  }, []);

  //inputs states
  const [supplierName, setSupplierName] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  //Brand selection
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const close = () => {
    props.setNewopen(false);
    setfiledata(null);
    setPreviewUrl("");
    setEmail("");
    setWebsite("");
    setNumber("");
    setSupplierName("")
    setSelectedBrands([]);


  };
  const getlastn = (s:string, n:number) => s.slice(-n);
  const Submit = async () => {
   
    if (number) {
      const cleanNumber = number.replace(/^\+/, '');
      const phoneNumber = getlastn(cleanNumber, 10);
      if (phoneNumber.length !== 10) {
        toast.error("Phone number must be 10 digits");
        return;
      }
    }
    if (
      supplierName && userid&&
      ((number && !email) || (!number && email) || (number && email))
    ) {
      let imageUrl = "";

      if (filedata && previewUrl) {
        try {
          const re = await axios.post(
            `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/S3/presignedurl`,
            {
              filename: supplierName,
              filetype: "png",
            }
          );

          const uploadre = await axios.put(re.data.url, filedata, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (uploadre.config.url) {
            imageUrl = uploadre.config.url.split("?")[0];
          }
        } catch (error) {
          console.error("Image upload failed:", error);
          toast.error("Image upload failed. Please try again.");
          return;
        }
      }

      const newSupplier = {
        Name: supplierName,
        ...(number && { Number: number }),
        ...(email && { Email: email }),
        ...(website && { Website: website }),
        ...(selectedBrands && { Brand: selectedBrands }),
        ...(imageUrl && { image: imageUrl }),
        userid

      };
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/supplier/CreateSupplier`,
          {
            newSupplier,
          }
        );
        toast.success("Supplier created successfully!");
        props.getallsups()
        close();
      } catch  {
        toast.error("Supplier creation failed. Please try again.");
      }
    } else {
      toast.error(
        "Please enter Name and either Number OR Email (only one, not both)."
      );
    }
  };

  return (
    <Dialog open={props.Newopen} onOpenChange={() => close()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-90 z-50">
          <DialogHeader>
            <DialogTitle className="w-full text-center text-2xl">
              Add Supplier
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            {/* Drag & Drop Box */}

            <div className=" w-full h-[170px]  flex justify-center items-center">
              {previewUrl ? (
                <div className="w-[40%] h-full bg-white flex">
                  <img
                    src={previewUrl}
                    alt="upploaded img"
                    className="w-full h-full bg-contain"
                  />
                </div>
              ) : (
                <div
                  className={`w-[90%] h-[80%] bg-white flex flex-col justify-center items-center cursor-pointer border-2 border-dashed ${
                    dragActive
                      ? "bg-blue-100 border-blue-500"
                      : "border-gray-400"
                  }`}
                  onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    setDragActive(false);
                  }}
                  onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    setDragActive(false);
                    const file = e.dataTransfer.files[0];
                    if (
                      file &&
                      (file.type === "image/jpeg" || file.type === "image/png")
                    ) {
                      setfiledata(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    } else {
                      alert("Only JPG and PNG files are allowed");
                    }
                  }}
                  onClick={() => document.getElementById("fileInput")?.click()}
                >
                  <input
                    type="file"
                    accept="image/jpeg, image/png"
                    className="hidden"
                    id="fileInput"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files) {
                        const file = e.target.files[0];
                        if (
                          file &&
                          (file.type === "image/jpeg" ||
                            file.type === "image/png")
                        ) {
                          setfiledata(file);
                          setPreviewUrl(URL.createObjectURL(file));
                        } else {
                          alert("Only JPG and PNG files are allowed");
                        }
                      }
                    }}
                  />
                  <div className="flex-1">Drag and drop your files</div>
                  <div className="flex-2 flex justify-center items-center">
                    <CloudDownload />
                  </div>
                  <div className="w-full flex-1 text-center text-xs font-light">
                    only jpg , png files.
                  </div>
                </div>
              )}
            </div>

            {/* Input Fields */}
            <>
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
            </>

            {/* Dropdown */}
            <BrandSelector
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            />

            {/* Buttons */}
            <div className="flex justify-between mt-4">
              <Button
                onClick={() => Submit()}
                className="bg-[#454545] text-white w-[48%] rounded-lg hover:bg-[#333333]"
              >
                Add Supplier
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

export default NewSup;
