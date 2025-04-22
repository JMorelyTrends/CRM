
export type labeltype={
  label:{name:string,
  col:string,
  },
  _id:string,
  createdAt?:string,
  updatedAt?:string,
  userid?:string,
  __v?:string
}
export type Suggest = {
  _id: string;
  Stockxid: string;
  stockxitem:[{
    name:string,
    image:string
  }];
  labels:labeltype[]
  
  sku: string;
  Name: string;
  slug: string;
  brand: string;
  image: string;
  Description:string
  createdAt: string;
  updatedAt: string;
  name?:string
};


 export type Custprop={
   
  _id:string,
  first_name:string,
  last_name:string,
  Name:string,
  email:string,
  total_spent:string,
  orders_count:string,
  customerfrom:string,
  address:{
    adress1:string,
    city:string,
    zip:string,
    country:string,
  }

}
export type dCustomerArray = Custprop[];


interface StockXItem {
  image: string;
  name: string;
}

export type Task ={
  _id:string
  id: number;
  Name: string;
  condition: string;
  size: string;
  stage: string;
  createdAt: string;
  stockxitem: StockXItem[];
  labels: labeltype[];
  Description:string;
  Condition:string,
  cusid:string|null,
  
}

export type column={
  id:number,
  title:string,
  taskIds:number[]
}
export type statetype={
  tasks:{
   [ key:string]:Task
  },
  columns:{
    [key:string]:column
  },
  columnOrder:string[]
}




