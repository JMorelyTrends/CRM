 import { configureStore} from "@reduxjs/toolkit"
 import  NewRequestSlice  from "./features/Newrequest/NewRequestSlice"
 import leadsSlice from "./features/Leads/LeadsSlice"
 import SupplierSlice from "./features/Supplier/SupplierSlice"
 import CustomerCrmslice from "./features/CustomerCrm/CustomerCrmslice"
 import OrderReivewSlice from "./features/OrederReview/OrderReviewSlice"
 export const makeStore=()=>{
    return configureStore({
        reducer:{
           NewReq : NewRequestSlice,
           Leads:leadsSlice,
           Sup:SupplierSlice,
           Cus:CustomerCrmslice,
           Rew:OrderReivewSlice
        }
    })
 }
 export type Reseller= ReturnType<typeof makeStore>

 export type RootState= ReturnType<Reseller['getState']>

 export type AppDispatch=Reseller['dispatch']