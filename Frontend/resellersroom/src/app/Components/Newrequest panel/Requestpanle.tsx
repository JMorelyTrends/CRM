import React from 'react'
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
  // const [search,setsearch]=useState<string>("")
  const Getdata=async(msg:string)=>{
    console.log("click",msg)
   const data= await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Stockx/getstockstore`,{
    search:msg
   })
 
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
      <Requestserch   Getdata={Getdata}/>
     { 
      <Requestresult suggesteddata={suggesteddata}
      // Requestmade={Requestmade}
      />}
    </div>
  )
}

export default Requestpanle