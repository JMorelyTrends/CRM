import React, { useEffect, useState } from "react";
import {Suggest} from "../Small comps/Types"
import {  useDispatch } from 'react-redux';
// import { Reseller, RootState } from "@/lib/Resellerstore";
import {addItem,Toggleleadsrenderstep} from '@/lib/features/Newrequest/NewRequestSlice'

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
          dispatch(addItem(item))
          dispatch(Toggleleadsrenderstep(2));
          
        }}
        className="h-10 w-[90%] bg-[#EBEBEB] rounded-xl text-sm font-semibold cursor-pointer">
          Add Request
        </button>
      </div>
    </div>
  );
};


const Requestresult = ({suggesteddata}: {suggesteddata:Suggest[], 
}) => {

  const [resutls,setresult]=useState<Suggest[]>([])
    useEffect(()=>{
      if(suggesteddata.length>0)
      {
        setresult(suggesteddata)
      }
    },[suggesteddata])


  return (
    <div className="lg:h-[82%] md:h-[81%] h-[89%] w-full">
    <div className="w-full h-[10%] bg-back flex items-center px-4"> 
      <span>Result</span>
    </div>
    {/* Scroll container */}
    <div className="w-full h-[90%] overflow-y-auto flex flex-col gap-4 p-2">
    
     
      {
        resutls.map((item:Suggest,key:number)=>{
         return(
          <RCard key={key} item={item}  />
         )

        })
      }
  
    </div>
  </div>
  );
};

export default Requestresult;
