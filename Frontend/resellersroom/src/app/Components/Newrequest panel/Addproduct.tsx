import React from "react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { CloudDownload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {  useDispatch  } from 'react-redux';
import {addItem,Toggleleadsrenderstep,Addflow} from '@/lib/features/Newrequest/NewRequestSlice'
import axios from "axios";
import { toast } from "sonner";

type Props = {
  notfound: boolean;
  setnotfound: React.Dispatch<React.SetStateAction<boolean>>;
};

const Addproduct = (props: Props) => {
    const dispatch=useDispatch()
  const [dragActive, setDragActive] = useState(false);
  const [filedata, setfiledata] = useState<File |null>(null);
  const [Name, setName] = useState<string>("");
  const [price, setprice] = useState<string>("");
  const [userid,setuserid]=useState<string|null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  useEffect(()=>{
    const id = localStorage.getItem("tempcred");
    setuserid(id)
  },[])

  const Submit=async()=>{

    if(Name && price && filedata)
    {
     const re=   await  axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/S3/presignedurl`,{
          filename:Name,
          filetype:"png"
          })

          const uploadre = await axios.put(re.data.url, filedata, {
            headers: {
              'Content-Type': "multipart/form-data"
            }
          });
      
          if(uploadre.config.url){
   
     
       const newitem=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/item/createItem`,{
        Name:Name
        ,price:price
        ,url:uploadre.config.url.split('?')[0]
        ,userid:userid
       })
       if(newitem)
       {
        const dispatchitem={
          _id: newitem.data._id,
          
          
           name:Name,
           
           
           image:   newitem.data.itempics[0] ,
          
          
           price:price
          
        }
        dispatch(addItem(dispatchitem))
        dispatch(Addflow("manual"))         
        dispatch(Toggleleadsrenderstep(2))
       
       }
       }
    }
    else{
      toast.error("fill all fields")
    }




    // dispatch(addItem({
    //     ...initial,
    //     name: Name,
    //     image: filedata,
    //     price:price
    //   }));
    // dispatch(Toggleleadsrenderstep(2));
  }

  return (
    <Dialog open={props.notfound} onOpenChange={() => {props.setnotfound(false)
      setfiledata(null);
      setPreviewUrl("")
    }}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
        <DialogContent className="sm:max-w-[500px] bg-[#EDEDED] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-90 z-50">
          <DialogHeader>
            <DialogTitle className="w-full text-center ">
              Add Product
            </DialogTitle>
          </DialogHeader>
          <div className="w-full flex flex-col justify-around">
            <div className=" w-full h-[70px]  flex justify-center items-center">
              <input
                type="text"
                placeholder="Enter Product Name"
                className="w-[90%] h-[80%] bg-white  "
                value={Name}
                onChange={(e)=>setName(e.target.value)}
              />
            </div>
            <div className=" w-full h-[70px]  flex justify-center items-center">
              <input
                type="text"
                placeholder="Enter Price"
                className="w-[90%] h-[80%] bg-white  "
                value={price}
                onChange={(e)=>
                {
                    const x=e.target.value;
                    if (x === "" || /^[0-9]+$/.test(x))
                    {
                         setprice(x)
                    } 
                }
                }
              />
            </div>
            {/*drag and drop section */}
            <div className=" w-full h-[170px]  flex justify-center items-center">
              {  previewUrl? 
              <div className="w-[40%] h-full bg-white flex"> 
                      <img src={previewUrl} alt="upploaded img" className="w-full h-full bg-contain" />
              </div>:
              <div
                className={`w-[90%] h-[80%] bg-white flex flex-col justify-center items-center cursor-pointer border-2 border-dashed ${
                  dragActive ? "bg-blue-100 border-blue-500" : "border-gray-400"
                }`}
                onDragOver={(e:React.DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e:React.DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDrop={(e:React.DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  setDragActive(false);
                  const file = e.dataTransfer.files[0];
                  if (
                    file &&
                    (file.type === "image/jpeg" || file.type === "image/png")
                  ) {
                    setfiledata(file)
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
                  onChange={(e:React.ChangeEvent<HTMLInputElement>) => {
                   if(e.target.files){ const file = e.target.files[0];
                    if (
                      file &&
                      (file.type === "image/jpeg" || file.type === "image/png")
                    ) {
                    setfiledata(file)
                    setPreviewUrl(URL.createObjectURL(file));
                    } else {
                      alert("Only JPG and PNG files are allowed");
                    }}
                  }}
                />
                <div className="flex-1">Drag and drop your files</div>
                <div className="flex-2 flex justify-center items-center">
                  <CloudDownload />
                </div>
                <div className="w-full flex-1 text-center text-xs font-light">
                  only jpg , png files.
                </div>
              </div>}
            </div>
                {/*Buttons section */}
            <div className=" w-full h-[70px]  flex justify-around items-center">
              <Button
              onClick={()=>{
                Submit()
              }}
              className="w-[30%] bg-[#454545] text-xl cursor-pointer">
                Add
              </Button>
              <Button
              onClick={()=>{
                setfiledata(null)
                props.setnotfound(false)
              }}
              className="w-[30%] bg-[#817F7F] text-xl cursor-pointer">
                Back
              </Button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default Addproduct;
