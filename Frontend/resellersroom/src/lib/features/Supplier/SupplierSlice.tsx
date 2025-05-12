import {createSlice} from '@reduxjs/toolkit'
import { Sup } from '../../../app/Components/Small comps/Types'
type NewReqState ={
SelectedSupplier:Sup
}
export  const initialState: NewReqState ={
  SelectedSupplier:{
     Name:'',
    Number:'',
    Email:'',
    Website:'',
    Brand:[],
    image:''
  }
}


export const SupplierSlice=createSlice({
name:'Sup',
initialState,
reducers:{
    AddselectedSup:((state,action)=>{
        state.SelectedSupplier=action.payload
    })
}
})
export const{AddselectedSup}=SupplierSlice.actions;
export default SupplierSlice.reducer