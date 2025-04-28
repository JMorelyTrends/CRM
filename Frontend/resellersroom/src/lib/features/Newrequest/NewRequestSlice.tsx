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
    }

}

},
);
export const {addItem,Toggleleadsrenderstep,Addshopifycustomer,Addmongodbcustomer,Addselectedcusotmer}=NewRequestSlice.actions;
export default NewRequestSlice.reducer