import { createSlice } from '@reduxjs/toolkit';

interface ExampleState {
  userid:string,
}

const initialState: ExampleState = {
userid:""
};

const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    Adduserid:((state,action)=>{
        state.userid=action.payload
    })
  },
});
export const {Adduserid} = exampleSlice.actions;
export default exampleSlice.reducer;