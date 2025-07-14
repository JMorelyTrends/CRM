 import { configureStore} from "@reduxjs/toolkit"
 import  NewRequestSlice  from "./features/Newrequest/NewRequestSlice"
 import leadsSlice from "./features/Leads/LeadsSlice"
 import SupplierSlice from "./features/Supplier/SupplierSlice"
 import CustomerCrmslice from "./features/CustomerCrm/CustomerCrmslice"
 import OrderReivewSlice from "./features/OrederReview/OrderReviewSlice"
 import Mainslice from "./features/Main/Mainslice"
 import {mergeLeadsReducer} from "./features/Leads/LeadsSlice"
 export const makeStore=()=>{
    return configureStore({
        reducer:{
           NewReq : NewRequestSlice,
           Merge:mergeLeadsReducer,
           Leads:leadsSlice,
           Sup:SupplierSlice,
           Cus:CustomerCrmslice,
           Rew:OrderReivewSlice,
           Main:Mainslice
        }
    })
 }
 export type Reseller= ReturnType<typeof makeStore>

 export type RootState= ReturnType<Reseller['getState']>

 export type AppDispatch=Reseller['dispatch']