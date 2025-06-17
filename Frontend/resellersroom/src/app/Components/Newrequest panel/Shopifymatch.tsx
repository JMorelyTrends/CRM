import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogPortal,
    DialogOverlay
} from "@/components/ui/dialog";
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from "@/lib/Resellerstore";
import { Toogleshopifypopup,Addselectedcusotmer,Toggleleadsrenderstep,Updating_Customer_shopify,ToogleShflag } from '@/lib/features/Newrequest/NewRequestSlice';
import { Custprop } from '../Small comps/Types';
import { isEqualStrings } from '../Small comps/isEqualStrings';
import {  Toogle_Editopen } from "@/lib/features/CustomerCrm/CustomerCrmslice";
const Shopifymatch = ({from,getcustomers}:{from:string,getcustomers:()=>Promise<void>}) => {
    
    const dispatch = useDispatch();
    const orderid=useSelector((state:RootState)=>state.Rew.selectorderid)
    const flag = useSelector((state: RootState) => state.NewReq.Openshopifymatch);
    const customer:Custprop|null = useSelector((state: RootState) => state.NewReq.MatchedCustomer);
    const edata=useSelector((state:RootState)=>state.NewReq.SubmitingCustomer)

    const Use=async()=>{
        if( orderid)
        {
         await axios.post( `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/customers/usethecustomer`,
                {
                  Cust:customer,
                  orderid:orderid
                })
                dispatch(Toogleshopifypopup())
                dispatch(Toogle_Editopen())
                getcustomers()
        }
        else{
            dispatch(Toogleshopifypopup());
            dispatch(Addselectedcusotmer(customer));
            dispatch(Toggleleadsrenderstep(2));
        }
    }
  

    //function too see which fields are equal
    return (
        <>
            <Dialog open={flag} onOpenChange={() => dispatch(Toogleshopifypopup())}>
                <DialogPortal>
                    <DialogOverlay className="fixed inset-0 bg-black/50 z-50">
                        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-90 z-50">
                            <DialogHeader>
                                <DialogTitle className="w-full text-center text-2xl">
                                    Shopify Customer Information
                                </DialogTitle>
                            </DialogHeader>

                           
                       {customer && (
                            <table className="w-full text-left text-gray-700 border border-collapse border-gray-200 rounded">
                                <tbody>
                                    <tr className="border-b border-gray-200">
                                        <td className= {`p-2 font-semibold `} >Name</td>
                                        <td className="p-2">{customer.first_name} {customer.last_name}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="p-2 font-semibold">Email</td>
                                        <td className= {` p-2 ${edata?.email&&isEqualStrings(customer.email,edata?.email)?' text-blue-400':''}`} >{customer.email}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="p-2 font-semibold">Phone</td>
                                        <td className={` p-2 ${edata?.Number&&customer.Number&&isEqualStrings(customer.Number,edata?.Number)?' text-blue-400':''}`} >{customer.Number || "N/A"}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="p-2 font-semibold">Total Spent</td>
                                        <td className="p-2">£{customer.total_spend}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="p-2 font-semibold">Orders Count</td>
                                        <td className="p-2">{customer.orders_count}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="p-2 font-semibold">Address</td>
                                        <td className="p-2">
                                            <div>{customer.address.adress1}</div>
                                            <div>{customer.address.city}, {customer.address.zip}, {customer.address.country}</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        )}

                        <div className= {`mt-6 flex justify-center gap-10 `} >
                           {from!="crm"&& <button
                                className="px-6 py-2 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white rounded-lg font-medium transition"
                                onClick={() => {
                                   Use()
                                }} >
                                Use
                            </button>}
<button
                                className="px-6 py-2 bg-gray-700 cursor-pointer hover:bg-gray-600 text-white rounded-lg font-medium transition"
                                onClick={() => {
                                    dispatch(Updating_Customer_shopify(customer))
                                   dispatch(ToogleShflag())
                                }}
                            >
                               Edit 
                            </button>
                        </div>
                        </DialogContent>
                    </DialogOverlay>
                </DialogPortal>
            </Dialog>
        </>
    );
};

export default Shopifymatch;
