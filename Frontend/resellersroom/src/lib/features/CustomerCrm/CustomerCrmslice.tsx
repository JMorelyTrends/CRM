import { createSlice } from "@reduxjs/toolkit";
import { Custprop } from "@/app/Components/Small comps/Types";


interface CustomerState {
  Customers: Custprop[];
  Selected_customer:Custprop;
  openedit:boolean,
  opennewcus:boolean,
  Newcuscrm:boolean
}

export const initialState: CustomerState = {
  Customers: [],
  Selected_customer: {
    _id: '',
    shopifyid: null, // Default is `null` in the schema
    first_name: '',
    last_name: '',
    email: '',
    Number: '', // You might want to map this to `Number` in the schema
    orders_count: 0, // renamed to match schema
    total_spend: '', // renamed to match schema (string)
  
    userid: '',
    emailMarketingConsent: {
      consentUpdatedAt: null,
      marketingOptInLevel: 'SINGLE_OPT_IN', // default
      marketingState: 'SUBSCRIBED' // default
    },
    socialhandel: '', // added because it’s in schema
    address: {
      total_spent:'',
  adress1:'',
  city:'',
  zip:'',
  country:''
    }, // flattened from defaultAddress
    tags: [],
    customerfrom: 'mongodb', // default
  
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