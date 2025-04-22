 import { configureStore} from "@reduxjs/toolkit"
 import  NewRequestSlice  from "./features/Newrequest/NewRequestSlice"
 export const makeStore=()=>{
    return configureStore({
        reducer:{
           NewReq : NewRequestSlice,
        }
    })
 }
 export type Reseller= ReturnType<typeof makeStore>

 export type RootState= ReturnType<Reseller['getState']>

 export type AppDispatch=Reseller['dispatch']