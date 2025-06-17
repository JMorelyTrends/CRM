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
import { ToogleShflag,Toogleshopifypopup,Addselectedcusotmer,Toggleleadsrenderstep, ADD_Matched_cutomer } from '@/lib/features/Newrequest/NewRequestSlice';
import { isEqualStrings } from '../Small comps/isEqualStrings';
import axios from 'axios';
import { toast } from 'sonner';
import PhoneInput from '../Small comps/PhoneInput';
import { usePathname } from 'next/navigation';

const Shopifyupdatepopup: React.FC = () => {
    const dispatch = useDispatch();
    const isOpen = useSelector((state: RootState) => state.NewReq.Shflag);
    const customer=useSelector((state:RootState)=>state.NewReq.Custprop);
    const edata=useSelector((state:RootState)=>state.NewReq.SubmitingCustomer)
    const userid=useSelector((state:RootState)=>state.Main.userid)
    // Input states
    const [firstName, setFirstName] = useState<string>(customer?.first_name||"");
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    // const [address, setAddress] = useState<string>('');
    // const [ccode,setccdoe]=useState<string>("")
    const pathname = usePathname();

    useEffect(()=>{
      if(customer)
      {
        setFirstName(customer?.first_name||"");
        setLastName(customer?.last_name||"");
        setEmail(customer?.email||"");
        
        setPhone(customer?.Number||"");
      }
    },[customer])
    const getlastn = (s:string, n:number) => s.slice(-n);
    const Submit=async()=>{
      try{
        if (phone) {
            const cleanNumber = phone.replace(/^\+/, '');
            const phoneNumber = getlastn(cleanNumber, 10);
            if (phoneNumber.length !== 10) {
              toast.error("Phone number must be 10 digits");
              return;
            }
          }
      if(userid)
        { const cus={
        id:customer._id,
        firstName:firstName,
        lastName:lastName,
        phone:phone,
        email:email,
        userid:userid
       }
    const re=   await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/customers/updateshopifycustomer`,{
        customer:cus
       });
          toast.success("Customer updated succesfully")
            setEmail("")
            setFirstName("");
            setLastName("")
            setPhone("")
            dispatch(ToogleShflag())

            if (pathname.startsWith('/NewRequest')) {
              dispatch(Toogleshopifypopup())
            }
            
            dispatch(Addselectedcusotmer(re.data.data));
            dispatch(ADD_Matched_cutomer(re.data.data))
            dispatch(Toggleleadsrenderstep(2));}
            else{
               console.log(userid)
            }
      }
 catch(err:unknown)
        {
            console.log(err)
          if(axios.isAxiosError(err))
          {
           toast.error(err.response?.data?.data || "An error occurred");
          }
        }
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={() => dispatch((ToogleShflag()))}>
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
                                        ${edata?.email&&isEqualStrings(customer.email,edata?.email)?' text-blue-400':''}
                                        `}
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-1">Phone</label>
                                <PhoneInput
                                number={phone}
                                setNumber={setPhone}
                                />
                            </div>

                            {/* <div>
                                <label className="block text-gray-700 font-semibold mb-1">Address</label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div> */}
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
    );
};

export default Shopifyupdatepopup;
