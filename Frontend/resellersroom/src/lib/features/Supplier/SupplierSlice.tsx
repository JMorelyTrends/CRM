import {createSlice} from '@reduxjs/toolkit'
import { Supplier } from '../../../app/Components/Small comps/Types'
type NewReqState ={
SelectedSupplier:Supplier
}
export  const initialState: NewReqState ={
  SelectedSupplier:{
    _id:'',
     Name:'',
    Number:'',
    Email:'',
    Website:'',
    Brand:[],
    image:'',
      createdAt: '',
  updatedAt: '',
  __v: 0
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