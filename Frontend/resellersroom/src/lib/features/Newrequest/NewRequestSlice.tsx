import {createSlice} from '@reduxjs/toolkit'
import { Task } from '@/app/Components/Small comps/Types'
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
  socialhandel:string,
  
  }
   type dCustArray = Cust[];
  type NewReqState = {
    renderstep: number;
    direction: number;
    selectedItems: Suggest; 
    Custprop:Cust,
    dCustomerArray:dCustArray,
    MongocustomersArray:dCustArray,
    Selectedonecustomer:Cust|null,
    Openshopifymatch:boolean,
    OpenMongomatch:boolean,
    MatchedCustomer:Cust|null,
    SubmitingCustomer:Cust|null,
    Ordercreated:Task|null,
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
    })
}
},
);
export const {addItem,Toggleleadsrenderstep,Addshopifycustomer,Addmongodbcustomer,
  Addselectedcusotmer,Toogleshopifypopup,Tooglemongopopup,ADD_Matched_cutomer,AddSubmitingCustomer,Addcreatedorder}=NewRequestSlice.actions;
export default NewRequestSlice.reducer