import React, { useEffect, useState } from "react";
import {Suggest} from "../Small comps/Types"
import {  useDispatch } from 'react-redux';
import Addproduct from "./Addproduct";
// import { Reseller, RootState } from "@/lib/Resellerstore";
import {addItem,Toggleleadsrenderstep,Addflow} from '@/lib/features/Newrequest/NewRequestSlice'
const Spinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin" />
  </div>
);


const RCard = ({item}:{item:Suggest}) => {
  const dispatch =useDispatch()
 
  return (
    <div className="w-full bg-white min-h-[90px] rounded-2xl shadow-xl flex gap-4 p-3 mb-3">
     
      <div className="w-[20%] flex justify-center items-center">
        <img src={item.image} alt="Product Logo" className="w-16 h-16 object-contain" />
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-center gap-1">
        <h3 className="text-lg font-bold">{item.name}</h3>
        <h2 className="text-sm font-bold text-[#b3b2b2]">2002 | HP5347</h2>
      </div>

      {/* Button */}
      <div className="w-[30%] flex justify-center items-center">
        <button
        onClick={()=>{
          dispatch(Addflow("stockx"))
          dispatch(addItem(item))
          // getprices(item)
          dispatch(Toggleleadsrenderstep(2));
          
        }}
        className="h-10 w-[90%] bg-[#EBEBEB] rounded-xl text-sm font-semibold cursor-pointer">
          Add Request
        </button>
      </div>
    </div>
  );
};


const Requestresult = ({suggesteddata,spin}: {suggesteddata:Suggest[], spin:boolean
}) => {
  const [resutls,setresult]=useState<Suggest[]>([])
  const [notfound,setnotfound]=useState<boolean>(false);
    useEffect(()=>{
      if(suggesteddata.length>0)
      {
        setresult(suggesteddata)
      }
    },[suggesteddata])


  return (
    <div className="lg:h-[82%] md:h-[81%] h-[89%] w-full">
    <div className="w-full h-[10%] bg-back flex justify-between items-center px-4"> 
    <div className=""><span>Result</span></div>  

    <div className=" text-sm font-light underline cursor-pointer"
    onClick={()=>{
             //here the flow is changing
      setnotfound(!notfound); 
    }}
    ><span>Product Not Found</span></div>  
    </div>
    
    <div className="w-full h-[90%] overflow-y-auto flex flex-col gap-4 p-2">
    
    
      {
        spin?<Spinner/>:
        resutls.map((item:Suggest,key:number)=>{
         return(
          <RCard key={key} item={item}  />
         )

        })
      }
  
    </div>

    <Addproduct notfound={notfound} setnotfound={setnotfound}/>
  </div>
  );
};

export default Requestresult;
