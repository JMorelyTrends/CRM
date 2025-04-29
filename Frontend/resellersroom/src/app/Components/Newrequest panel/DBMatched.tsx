"use client"
import React, { useState ,useEffect} from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogPortal,
    DialogOverlay
} from "@/components/ui/dialog";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from "@/lib/Resellerstore";
import { Tooglemongopopup,AddSubmitingCustomer,ADD_Matched_cutomer } from '@/lib/features/Newrequest/NewRequestSlice';
import { Custprop } from '../Small comps/Types';
type Props = {}

const DBMatched = (props: Props) => {
        const dispatch = useDispatch();
        const flag = useSelector((state: RootState) => state.NewReq.OpenMongomatch);
        const customer:Custprop|null = useSelector((state: RootState) => state.NewReq.MatchedCustomer);
        const formcusotmer:Custprop|null=useSelector((state:RootState)=>state.NewReq.SubmitingCustomer);
     
        //const [formcusotmer, setformcusotmer]     = useState<Custprop|null>();
        const [name, setName]     = useState<string>(" ");
        const [email, setEmail]   = useState<string>(" ");
        const [number, setNumber] = useState<string>(" ");
        const [social, setSocial] = useState<string>(" ");

        useEffect(() => {
         if (formcusotmer !== null) {
           
           setName(formcusotmer.Name );
           setEmail(formcusotmer.email || "");
           setNumber(formcusotmer.Number || "");
           setSocial(formcusotmer.socialhandel || "");
         }
       }, [formcusotmer]);
  
        
  return (
       <>
               <Dialog open={flag} onOpenChange={() => dispatch(Tooglemongopopup())}>
                   <DialogPortal>
                       <DialogOverlay className="fixed inset-0 bg-black/50 z-50">
                           <DialogContent className="sm:max-w-[600px] bg-[#EDEDED] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-90 z-50">
                               <DialogHeader>
                                   <DialogTitle className="w-full text-center text-2xl">
                                       DB Customer Information Matched
                                   </DialogTitle>
                               </DialogHeader>
                               {customer && (
  <div className="flex flex-col gap-4 p-4">

    {customer.Name && (
      <div className={`font-semibold ${ formcusotmer&&(formcusotmer.Name===customer.Name?"text-blue-300":" text-black")}`}>
        <span  className='text-black' >Name:</span> {customer.Name}
      </div>
    )}
 
    {customer.email && (
      <div  className={`font-semibold ${ formcusotmer&&(formcusotmer.email===customer.email?"text-blue-300":" text-black")}`}>
        <span className='text-black'>Email:</span> {customer.email}
      </div>
    )}

    {customer.Number && (
      <div  className={`font-semibold ${ formcusotmer&&(formcusotmer.Number===customer.Number?"text-blue-300":" text-black")}`}>
        <span  className='text-black' >Phone:</span> {customer.Number}
      </div>
    )}

    {customer.socialhandel && (
      <div  className={`font-semibold ${ formcusotmer&&(formcusotmer.socialhandel===customer.socialhandel?"text-blue-300":" text-black")}`}>
        <span  className='text-black' >Social Handle:</span> {customer.socialhandel}
      </div>
    )}

<div className="mt-6 flex flex-col gap-4">

  <div className= {` flex gap-2 items-center ${ formcusotmer&&(((formcusotmer.Name===customer.Name)&&(formcusotmer.Name!=""&&customer.Name!=""))?" hidden":" visible")}`} >
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Update Name"
      className="flex-grow border border-gray-300 rounded px-3 py-2"
    />
    <button
   onClick={() => {
   
    const trimmedName = name.trim();
    if (!customer || trimmedName === '') return;
    
    const updatedCustomer = {
      ...customer,
      Name: trimmedName,
    };
    const updateformdata = {
      ...formcusotmer,
      Name: trimmedName,
    };
    dispatch(ADD_Matched_cutomer(updatedCustomer));
    dispatch(AddSubmitingCustomer(updateformdata));
    
  }

}
    className="bg-[#B7CBAF] text-black px-4 py-2 rounded hover:bg-blue-700 transition">
      Update
    </button>
  </div>

  
  <div className= {` flex gap-2 items-center ${ formcusotmer&&(((formcusotmer.email===customer.email)&&(formcusotmer.email!=""&&customer.email!=""))?" hidden":" visible")}`}>
    <input
      type="text"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Update Email"
      className="flex-grow border border-gray-300 rounded px-3 py-2"
    />
    <button
       onClick={() => {
   
        const trimmedEmail = email.trim();
        if (!customer || trimmedEmail === '') return;
        
        const updatedCustomer = {
          ...customer,
          email: trimmedEmail,
        };
        const updateformdata = {
          ...formcusotmer,
          email: trimmedEmail,
        };
        dispatch(ADD_Matched_cutomer(updatedCustomer));
        dispatch(AddSubmitingCustomer(updateformdata));
        
      }
    
    }
    className="bg-[#B7CBAF] text-black px-4 py-2 rounded hover:bg-blue-700 transition">
      Update
    </button>
  </div>


  <div className= {` flex gap-2 items-center ${ formcusotmer&&(((formcusotmer.Number===customer.Number)&&(formcusotmer.Number!=""&&customer.Number!=""))?" hidden":" visible")}`}>
    <input
      type="text"
      value={number}
      onChange={(e) => setNumber(e.target.value)}
      placeholder="Update Phone"
      className="flex-grow border border-gray-300 rounded px-3 py-2"
    />
    <button
     onClick={() => {
   
        const trimmedNumber = number.trim();
        if (!customer || trimmedNumber === '') return;
        
        const updatedCustomer = {
          ...customer,
          Number: trimmedNumber,
        };
        const updateformdata = {
          ...formcusotmer,
          Number: trimmedNumber,
        };
        dispatch(ADD_Matched_cutomer(updatedCustomer));
        dispatch(AddSubmitingCustomer(updateformdata));
        
      }}
    className="bg-[#B7CBAF] text-black px-4 py-2 rounded hover:bg-blue-700 transition">
      Update
    </button>
  </div>


  <div className= {` flex gap-2 items-center ${ formcusotmer&&(((formcusotmer.socialhandel===customer.socialhandel)&&(formcusotmer.socialhandel!=""&&customer.socialhandel!=""))?" hidden":" visible")}`}>
    <input
      type="text"
      value={social}
      onChange={(e) => setSocial(e.target.value)}
      placeholder="Update Social Handle"
      className="flex-grow border border-gray-300 rounded px-3 py-2"
    />
    <button 
    onClick={() => {
   
        const trimmedsocial = social.trim();
        if (!customer || trimmedsocial === '') return;
        
        const updatedCustomer = {
          ...customer,
          socialhandel: trimmedsocial,
        };
        const updateformdata = {
          ...formcusotmer,
          socialhandel: trimmedsocial,
        };
        dispatch(ADD_Matched_cutomer(updatedCustomer));
        dispatch(AddSubmitingCustomer(updateformdata));
        
      }}
    className="bg-[#B7CBAF] text-black px-4 py-2 rounded hover:bg-blue-700 transition">
      Update
    </button>
  </div>
</div>


  </div>
)}                    
                           </DialogContent>
                       </DialogOverlay>
                   </DialogPortal>
               </Dialog>
           </>
  )
}

export default DBMatched