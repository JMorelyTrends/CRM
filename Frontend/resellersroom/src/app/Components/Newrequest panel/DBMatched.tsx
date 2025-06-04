"use client"
import React, { useState ,useEffect} from 'react'
import axios from 'axios';
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
import { Tooglemongopopup,AddSubmitingCustomer,ADD_Matched_cutomer,Addselectedcusotmer,Toggleleadsrenderstep } from '@/lib/features/Newrequest/NewRequestSlice';
import { Custprop } from '../Small comps/Types';
import { toast } from 'sonner';

const DBMatched = () => {
        const dispatch = useDispatch();
        const flag = useSelector((state: RootState) => state.NewReq.OpenMongomatch);
        const customer:Custprop|null = useSelector((state: RootState) => state.NewReq.MatchedCustomer);
        const formcusotmer:Custprop|null=useSelector((state:RootState)=>state.NewReq.SubmitingCustomer);
     
        //const [formcusotmer, setformcusotmer]     = useState<Custprop|null>();
        const [name, setName]     = useState<string>("");
        const [email, setEmail]   = useState<string>("");
        const [number, setNumber] = useState<string>("");
        const [social, setSocial] = useState<string>("");

        const [ff,setff]=useState<boolean>(false)
        useEffect(() => {
         if (formcusotmer !== null && !ff) {
           
           setName(formcusotmer.Name );
           setEmail(formcusotmer.email || "");
           setNumber(formcusotmer.Number || "");
           setSocial(formcusotmer.socialhandel || "");
           setff(true)
         }
       }, [formcusotmer]);

           const updateField = async (fieldName: string, updatedValue: string, customerId: string) => {
        try {
          const res = await  axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/customers/Updatecusnewreq`, {
            customerId,
            fieldName,
            updatedValue
          });
          if(res.data?.alert)
          {
            toast.error(res.data.alert)
          }
         
          return res.data.customer; // updated customer
        } catch (err: unknown) {
 if (axios.isAxiosError(err)) {
    if (err.response?.status === 409) {
      toast.error(err.response.data.message);
    } else {
      toast.error("Error updating field");
    }
  } else {
    toast.error("An unexpected error occurred");
  }
  return null;
        }
      };
      
  
        
  return (
       <>
               <Dialog open={flag} onOpenChange={() =>{
                setName("")
                setEmail("")
                setNumber("")
                setSocial("")
                dispatch(Tooglemongopopup())}}>
                   <DialogPortal>
                       <DialogOverlay className="fixed inset-0 bg-black/50 z-50">
                           <DialogContent className="sm:max-w-[600px] bg-[#EDEDED] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-90 z-50">
                               <DialogHeader>
                                   <DialogTitle className="w-full text-center text-2xl">
                                        Customer Information Matched
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

  <div className= {` flex gap-2 items-center `} >
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Update Name"
      className="flex-grow border border-gray-300 rounded px-3 py-2"
    />
    <button
   onClick={async() => {  
   if(name) {const trimmedName = name.trim();
    if (!customer || trimmedName === '' || trimmedName === customer.Name) return;
  
    const updated = await updateField("Name", trimmedName, customer._id);
    if (updated) {
      const updateformdata = {
        ...formcusotmer,
        Name: trimmedName,
      };
      dispatch(ADD_Matched_cutomer(updated));
      dispatch(AddSubmitingCustomer(updateformdata));
      setName("")
    }
    }
  }

}
    className="bg-[#B7CBAF] text-black px-4 py-2 rounded hover:bg-blue-700 transition">
      Update
    </button>
  </div>

  
  <div className= {` flex gap-2 items-center `}>
    <input
      type="text"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Update Email"
      className="flex-grow border border-gray-300 rounded px-3 py-2"
    />
    <button
       onClick={async() => {
   
      if(email) { const trimmedEmail = email.trim();
        if (!customer || trimmedEmail === '' || trimmedEmail === customer.email) return;
      
        const updated = await updateField("email", trimmedEmail, customer._id);
        if (updated) {
          const updateformdata = {
            ...formcusotmer,
            email: trimmedEmail,
          };
          dispatch(ADD_Matched_cutomer(updated));
          dispatch(AddSubmitingCustomer(updateformdata));
          setEmail("")
        }
        
      }
    }
    }
    className="bg-[#B7CBAF] text-black px-4 py-2 rounded hover:bg-blue-700 transition">
      Update
    </button>
  </div>


  <div className= {` flex gap-2 items-center `}>
    <input
      type="text"
      value={number}
      onChange={(e) => {
        const val = e.target.value;
        if (/^\d*$/.test(val) && val.length <= 11) {
          setNumber(val);
        }
      }}
      placeholder="Update Phone"
      className="flex-grow border border-gray-300 rounded px-3 py-2"
    />
    <button
      onClick={async() => {
      if(number){  const trimmedNumber = number.trim();
        if (!customer || trimmedNumber === '' || trimmedNumber === customer.Number ) return;
        if( trimmedNumber.length>0&& trimmedNumber.length<11) { return toast.error("Number should be 11 characters long")     }
        const updated = await updateField("Number", trimmedNumber, customer._id);
        if (updated) {
          const updateformdata = {
            ...formcusotmer,
            Number: trimmedNumber,
          };
          dispatch(ADD_Matched_cutomer(updated));
          dispatch(AddSubmitingCustomer(updateformdata));
          setNumber("")
        }
        }
      }}
    className="bg-[#B7CBAF] text-black px-4 py-2 rounded hover:bg-blue-700 transition">
      Update
    </button>
  </div>


  <div className= {` flex gap-2 items-center `}>
    <input
      type="text"
      value={social}
      onChange={(e) => setSocial(e.target.value)}
      placeholder="Update Social Handle"
      className="flex-grow border border-gray-300 rounded px-3 py-2"
    />
    <button 
    onClick={async() => {
   if(social){
      const trimmedSocial = social.trim();
      if (!customer || trimmedSocial === '' || trimmedSocial === customer.socialhandel) return;
    
      const updated = await updateField("socialhandel", trimmedSocial, customer._id);
      if (updated) {
        const updateformdata = {
          ...formcusotmer,
          socialhandel: trimmedSocial,
        };
        dispatch(ADD_Matched_cutomer(updated));
        dispatch(AddSubmitingCustomer(updateformdata));
        setSocial("")
      }
      }
    }}
    className="bg-[#B7CBAF] text-black px-4 py-2 rounded hover:bg-blue-700 transition">
      Update
    </button>
  </div>
</div>


  </div>
)}                    
  {/* Update Button */}
                            <div className="flex justify-center mt-4">
                                <button
                                    className="px-6 py-2 bg-[#454545] text-white rounded-lg"
                                    onClick={() => {
                                        dispatch(Tooglemongopopup())
                                         dispatch(Addselectedcusotmer(customer))
                                      
                                         dispatch(Toggleleadsrenderstep(2));
                                        console.log('Update button clicked');
                                    }}
                                >
                                    Use
                                </button>
                            </div>
                           </DialogContent>
                       </DialogOverlay>
                   </DialogPortal>
               </Dialog>
           </>
  )
}

export default DBMatched