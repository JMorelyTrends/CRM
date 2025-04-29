import React from 'react';
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
import { Toogleshopifypopup,Addselectedcusotmer,Toggleleadsrenderstep } from '@/lib/features/Newrequest/NewRequestSlice';
import { Custprop } from '../Small comps/Types';
type Props = {};

const Shopifymatch = (props: Props) => {
    const dispatch = useDispatch();
    const flag = useSelector((state: RootState) => state.NewReq.Openshopifymatch);
    const customer:Custprop|null = useSelector((state: RootState) => state.NewReq.MatchedCustomer);


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

                            {/* Customer Information */}
                        { customer&&    <div className="p-4">
                                <div className="text-lg font-semibold">Name: {customer.first_name} {customer.last_name}</div>
                             
                                <div className="text-lg font-semibold mt-2">Email: {customer.email}</div>
                            

                                <div className="text-lg font-semibold mt-2">Phone: {customer.Number ? customer.Number : "N/A"}</div>
                              

                                <div className="text-lg font-semibold mt-2">Total Spent: {customer.total_spent}</div>
                              

                                <div className="text-lg font-semibold mt-2">Orders Count: {customer.orders_count}</div>
                             

                                <div className="text-lg font-semibold mt-2">Address:</div>
                                <div>{customer.address.adress1}</div>
                                <div>{customer.address.city}, {customer.address.zip}, {customer.address.country}</div>

                               
                            </div>}

                            {/* Update Button */}
                            <div className="flex justify-center mt-4">
                                <button
                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg"
                                    onClick={() => {
                                        dispatch(Toogleshopifypopup())
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
    );
};

export default Shopifymatch;
