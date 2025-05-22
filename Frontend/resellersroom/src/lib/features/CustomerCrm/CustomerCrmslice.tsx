import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Customerprop } from "@/app/Components/Small comps/Types";


interface CustomerState {
  Customers: Customerprop[];
  Selected_customer:Customerprop;
  openedit:boolean,
  opennewcus:boolean,
}

const initialState: CustomerState = {
  Customers: [],
  Selected_customer:{
  Name:'',
  Email:'',
  Phone:'',
  SocialHandle:'',
  emailMarketingConsent:'',
  Custoemrfrom:'',
  TotalSpent:0,
  TotalOrders:0
  },
  openedit:false,
  opennewcus:false
};

const CustoemrSlice=createSlice({
    name:"Customers",
    initialState,
    reducers:{
        AddCustomers:(state,action)=>{
         state.Customers=action.payload;
        },
        AddSelectedCustomer:(state,action)=>{
          state.Selected_customer=action.payload;
        },
        Toogle_Editopen:(state,)=>{
            state.openedit=!state.openedit;
        },
        Toogle_Newcus:(state)=>{
            state.opennewcus=!state.opennewcus;
        }
    }
})

export const {AddCustomers,AddSelectedCustomer,Toogle_Editopen,Toogle_Newcus}=CustoemrSlice.actions;

export default CustoemrSlice.reducer;