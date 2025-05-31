import React, { useState } from 'react'
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
   const data= await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Stockx/getstock`,{
    search:msg
   })
 
   setsuggesteddata(data.data.message)
   setspin(false)
  }
  const prepopulate=async(msg:string)=>{
   
    const data= await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Stockx/Getprepopulate`,{
      q:msg
     });
     
      setsuggesteddata(data.data.message)
     
  }
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