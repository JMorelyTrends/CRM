"use client"
import React,{useEffect,useState} from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import axios from 'axios';
const Slide = ({img, name, link, number}: {img: string, link: string, name: string, number: null|string}) => {
    const pathname = usePathname();
    const [nleads,setnleads]=useState<number>(0)
    useEffect(()=>{
       const fetchleadsnumber=async()=>{
        const n=(await axios.get(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/getnumberofleads`)).data;
        console.log(n.data)
        setnleads(n.data)
       }
       fetchleadsnumber()
    },[])
    return(
                        <Link href={link} passHref legacyBehavior prefetch={true} >

        <div className={`ml-4 w-[90%] h-[14%] ${pathname==link?"text-md font-bold":"text-sm"} hover:bg-background cursor-pointer text-[#454545] flex items-center gap-3`}>
            <div className="flex justify-center items-center w-6 h-6">
                <img  src={img} alt="" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 flex justify-start items-center">
               
                    <a className="w-full">{name}</a>
         
            </div>
            {number && (
                <div className="flex items-center justify-center w-10 h-10">
                    <h3 className="h-[56%] w-full text-center flex items-center justify-center rounded-2xl text-white bg-[#374D71] px-2">
                        {nleads}
                    </h3>
                </div>
            )}
        </div>
        </Link>
    )
}

const Sideoptions = () => {
  return (
    <div className='w-full h-[50%] flex flex-col items-start justify-around'>
        {/* Fixed links - Next.js routes are case-sensitive */}
        <Slide img="/images/Dahboard.png" name="Dashboard" number={null} link="/Dashboard" />
        <Slide img="/images/request.png" name="Add New Request" number={null} link="/NewRequest" />
        <Slide img="/images/Lead.png" name="Lead Management" number={"54"} link="/Leads" />
        <Slide img="/images/supplier.png" name="Supplier CRM" number={null} link="/CRM" />
        <Slide img="/images/Crm.png" name="Customer CRM" number={null} link="/customer-crm" />
    </div>
  )
}

export default Sideoptions