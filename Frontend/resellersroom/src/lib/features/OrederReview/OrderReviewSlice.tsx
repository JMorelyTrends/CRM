import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OrderRpr } from "@/app/Components/Small comps/Types";
type OrderReviewState = {
  selectedOrder: OrderRpr | null;
  isOpen: boolean;
};

const initialState: OrderReviewState = {
  selectedOrder: null,
  isOpen: false,

};

const OrderReviewSlice = createSlice({
  name: "OrderReview",
  initialState,
  reducers: {
      ToogleEdit(state){
        state.isOpen=!state.isOpen
      },
      AddSelectedOrder(state,action:PayloadAction<OrderRpr>)
      {
        state.selectedOrder=action.payload;
      }
  },
});

export const {
ToogleEdit,
AddSelectedOrder
} = OrderReviewSlice.actions;

export default OrderReviewSlice.reducer;
