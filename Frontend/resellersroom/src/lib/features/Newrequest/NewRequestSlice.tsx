import {createSlice} from '@reduxjs/toolkit'
import { Custprop, Task } from '@/app/Components/Small comps/Types'
 type Suggest={
    _id: string,
    Stockxid?: string,
    sku?: string,
    name:string,
    slug?: string,
    brand?: string,
    image:  string,
    createdAt: string,
    updatedAt: string,
    price?:string
    itemid?:string
 
  }
  type Cust={
   
    _id:string,
    first_name:string,
    last_name:string,
    Name:string,
    email:string,
    total_spent:string,
    orders_count:string,
    customerfrom:string,
    Number:string|null
    address:{
      adress1:string,
      city:string,
      zip:string,
      country:string,
    },
  socialhandel?:string,
  
  }
   type dCustArray = Cust[];
  type NewReqState = {
    renderstep: number;
    direction: number;
    selectedItems: Suggest; 
    Custprop:Cust,
    dCustomerArray:dCustArray,
    MongocustomersArray:dCustArray,
    Selectedonecustomer:Custprop|null,
    Openshopifymatch:boolean,
    OpenMongomatch:boolean,
    MatchedCustomer:Custprop|null,
    SubmitingCustomer:Custprop|null,
    Ordercreated:Task|null,
    flow:string,
    Shflag:boolean
    
   // UpShCus:Cust        // to hold the custoemrs which going to be updated from crm 
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
    Custprop:{
   
      _id:'',
      first_name:'',
      last_name:'',
      Name:'',
      email:'',
      total_spent:'',
      orders_count:'',
      customerfrom:'',
      Number:'',
      address:{
        adress1:'',
        city:'',
        zip:'',
        country:'',
      },
      socialhandel:'',
    },
    dCustomerArray:[],
    MongocustomersArray:[],
    Selectedonecustomer:null,
    Openshopifymatch:false,
    OpenMongomatch:false,
    MatchedCustomer:null,
    SubmitingCustomer:null,
    Ordercreated:null,
    flow:"stockx",
    Shflag:false
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
    Addshopifycustomer:(state,action)=>{
      state.dCustomerArray=action.payload
    },
    Addmongodbcustomer:(state,action)=>{
      state.dCustomerArray=action.payload;
    },
    Addselectedcusotmer:(state,action)=>{
     state.Selectedonecustomer=action.payload 
    },
    Toogleshopifypopup:((state)=>{
      state.Openshopifymatch=!state.Openshopifymatch
    }),
    Tooglemongopopup:((state)=>{
      state.OpenMongomatch=!state.OpenMongomatch
    }),
    ADD_Matched_cutomer:((state,action)=>{
      state.MatchedCustomer=action.payload;
    }),
    AddSubmitingCustomer:((state,action)=>{
      state.SubmitingCustomer=action.payload;
    }),
    Addcreatedorder:((state,action)=>{
      state.Ordercreated=action.payload;
    }),
    Addflow:((state , action)=>{
     state.flow=action.payload;              //this thing is to tell is the flow is from stockx or manuall
    }),
    Updating_Customer_shopify:((state,action)=>{
      state.Custprop=action.payload
    }),
    ToogleShflag:((state)=>{
     state.Shflag=!state.Shflag
    }),

}
},
);
export const {addItem,Toggleleadsrenderstep,Addshopifycustomer,Addmongodbcustomer,
  Addselectedcusotmer,Toogleshopifypopup,Tooglemongopopup,ADD_Matched_cutomer,
  AddSubmitingCustomer,Addcreatedorder,Addflow,Updating_Customer_shopify,ToogleShflag}=NewRequestSlice.actions;
export default NewRequestSlice.reducer