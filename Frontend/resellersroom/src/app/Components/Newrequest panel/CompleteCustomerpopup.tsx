import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogPortal,
    DialogOverlay
} from "@/components/ui/dialog";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "@/lib/Resellerstore";
import { ToogleCustomerComplete } from '@/lib/features/Newrequest/NewRequestSlice';
import { toast } from 'sonner';



const CompleteCustomerpopup = ( ) => {
    const dispatch=useDispatch()
    const isOpen = useSelector((state: RootState) => state.NewReq.completeCustomer);
    const customer=useSelector((state:RootState)=>state.NewReq.MatchedCustomer);
   
 const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [socialhandel,setsocial]=useState<string>('')
    
    // const [address, setAddress] = useState<string>('');


    useEffect(()=>{
      
      
        if(customer)
        {
            setFirstName(customer.first_name&&customer.first_name||'')
       setLastName( customer.last_name && customer.last_name||'')
       setEmail( customer.email &&  customer.email||'')
       setPhone( customer?.Number &&  customer?.Number||'') 
       setsocial(customer.socialhandel&&customer.socialhandel||'')
        }

 
    },[customer])

    const Submit=()=>{
        if( email )
        {
           
        }
        else{
          toast("enter email")            
        }
    }

  return (
      <Dialog open={isOpen} onOpenChange={() => dispatch((ToogleCustomerComplete()))}>
            <DialogPortal>
                <DialogOverlay className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <DialogContent className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-in fade-in zoom-in-90">
                        <DialogHeader>
                            <DialogTitle className="text-center text-2xl font-bold mb-4 text-blue-800">
                                Update  Customer
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-2">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                                `}/>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                                        `}
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-1">socialhandel</label>
                                <input
                                    type="text"
                                    value={socialhandel}
                                    onChange={(e) => setsocial(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                            onClick={()=>Submit()}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                            >
                                Update
                            </button>
                        </div>
                    </DialogContent>
                </DialogOverlay>
            </DialogPortal>
        </Dialog>
  )
}

export default CompleteCustomerpopup