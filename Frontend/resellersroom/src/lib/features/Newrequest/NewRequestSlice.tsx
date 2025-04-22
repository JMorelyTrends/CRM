import {createSlice} from '@reduxjs/toolkit'
 type Suggest={
    _id: string,
    Stockxid: string,
    sku: string,
    name:string,
    slug: string,
    brand: string,
    image:  string,
    createdAt: string,
    updatedAt: string,
  }
  type NewReqState = {
    renderstep: number;
    direction: number;
    selectedItems: Suggest; 
  };
  
 export  const initialState: NewReqState = {
    renderstep: 0,
    direction: 0,
    selectedItems: {
      _id: '',
      Stockxid: '',
      sku: '',
      name: '',
      slug: '',
      brand: '',
      image: '',
      createdAt: '',
      updatedAt: '',
    },
  };
  
 export const NewRequestSlice= createSlice({
name:'NewReq',
initialState,
reducers:{
    addItem: (state,action)=>{
       state.selectedItems=action.payload
    },
    Toggleleadsrenderstep:(state,action)=>{
        state.renderstep=action.payload
        state.direction=action.payload > state.renderstep ? -1 : 1
    },

}

},
);
export const {addItem,Toggleleadsrenderstep}=NewRequestSlice.actions;
export default NewRequestSlice.reducer