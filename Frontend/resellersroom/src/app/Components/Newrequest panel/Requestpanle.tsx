import React, { useState,useCallback } from 'react'
import axios from 'axios'
import Requestserch from './Requestserch'
import Requestresult from './Requestresult'
import {Suggest} from '../Small comps/Types'
//import { motion } from "motion/react"

// type Props = {
//     sideopen:boolean,
//     suggesteddata:Suggest[],
//     setsuggesteddata:React.Dispatch<React.SetStateAction<Suggest>>
// }

function Requestpanle({sideopen,suggesteddata,setsuggesteddata}: 
  {sideopen:boolean,suggesteddata:Suggest[],setsuggesteddata:React.Dispatch<React.SetStateAction<Suggest[]>>}) {
  const [spin,setspin]=useState<boolean>(false);
  const Getdata=async(msg:string)=>{
    setspin(true);
   const data= await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Stockx/getstockstore`,{
    search:msg
   })
 
   setsuggesteddata(data.data.message)
   setspin(false)
  }
  const debounce = <T extends unknown[]>( func: (...args: T) => void,delay: number ) => {
    let timer: ReturnType< typeof setTimeout>;
    return (...args: T) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => { func.call(null, ...args) }, delay);
    };
}
  const prepopulate= debounce(async (msg: string)=> {
   const query = msg.trim();
    if (!query) return;
    const data= await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Stockx/Getprepopulate`,{
      q:msg
     });
     
      setsuggesteddata(data.data.message)
     
  },700)
  
  // const [mcom,setmcom]=useState<boolean>(false)
  // const Requestmade=()=>{
  // console.log("hello")
  // }
  // const variants ={
  // }
  return (
    <div
   
    className={`${sideopen ? "lg:w-[80%]" : "lg:w-[70%]"} 
      h-[75vh] bg-[#EBEBEB] flex flex-col text-black`}>
      <Requestserch   Getdata={Getdata} prepopulate={prepopulate}/>
     { 
      <Requestresult suggesteddata={suggesteddata} spin={spin}
      // Requestmade={Requestmade}
      />}
    </div>
  )
}

export default Requestpanle