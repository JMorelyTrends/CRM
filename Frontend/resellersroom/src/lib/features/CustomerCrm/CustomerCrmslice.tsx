import { createSlice } from "@reduxjs/toolkit";
import { Customerprop,IShopifyCustomer } from "@/app/Components/Small comps/Types";


interface CustomerState {
  Customers: IShopifyCustomer[];
  Selected_customer:IShopifyCustomer;
  openedit:boolean,
  opennewcus:boolean,
  Newcuscrm:boolean
}

export const initialState: CustomerState = {
  Customers: [],
  Selected_customer: {
    _id: '',
    shopify_id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    shopifyCreatedAt: null,
    numberOfOrders: 0,
    amountSpent: {
      amount: 0,
      currencyCode: ''
    },
    defaultAddress: {
      address1: '',
      city: '',
      zip: ''
    },
    userid: '',
    emailMarketingConsent: {
      consentUpdatedAt: null,
      marketingOptInLevel: '',
      marketingState: ''
    },
    lastUpdatedAt:"",
    createdAt: undefined,
    updatedAt: undefined
  },
  openedit: false,
  opennewcus: false,
  Newcuscrm:false
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
        },
        Toogle_Newcuscrm:(state)=>{
            state.Newcuscrm=!state.Newcuscrm;
        },
    }
})

export const {AddCustomers,AddSelectedCustomer,Toogle_Editopen,Toogle_Newcus,Toogle_Newcuscrm}=CustoemrSlice.actions;

export default CustoemrSlice.reducer;