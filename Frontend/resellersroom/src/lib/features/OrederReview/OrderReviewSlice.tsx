import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OrderRpr, Task } from "@/app/Components/Small comps/Types";
type OrderReviewState = {
  selectedOrder: OrderRpr|Task | null;
  isOpen: boolean;
  selectorderid:string,
  completeorder:boolean,
  currentorder:Task|null,
};

const initialState: OrderReviewState = {
  selectedOrder: null,
  isOpen: false,
  selectorderid:'',
  completeorder:false,
  currentorder:null,
  
};

const OrderReviewSlice = createSlice({
  name: "OrderReview",
  initialState,
  reducers: {
      ToogleEdit(state){
        state.isOpen=!state.isOpen
      },
      AddSelectedOrder(state,action:PayloadAction<OrderRpr|Task>)
      {
        state.selectedOrder=action.payload;
      },
      AddOrderid(state,action:PayloadAction<string>)
      {
        state.selectorderid=action.payload
      },
      Addcurrentorder(state,action)
      {
          state.currentorder=action.payload
      },
      ToogleCompleteorder(state)
      { 
        state.completeorder=!state.completeorder
      }
  },
});

export const {
ToogleEdit,
AddSelectedOrder,
AddOrderid,
ToogleCompleteorder,
Addcurrentorder

} = OrderReviewSlice.actions;

export default OrderReviewSlice.reducer;
