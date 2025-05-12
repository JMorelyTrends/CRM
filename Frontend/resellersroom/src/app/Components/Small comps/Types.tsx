
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
    image:string,
    last_sale_price?:number,
    last_sale_update_date?:string,
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
  price?:string
};

export type additem={
  Name:string,
  createdAt:string,
  itempics:[string],
  updatedAt:string,
  price:number,
  userid:string,
  __v:string,
  _id:string,
}

 export type Custprop={
   
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
export type dCustomerArray = Custprop[];


interface StockXItem {
  _id:string,
  image: string;
  name: string;
  slug:string,
  last_sale_price?:number,
  last_sale_update_date?:string,
  sku?:string|null
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
  items?:additem[],
  email?:string,
  phone?:string,
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




//suppliers types

export type Sup={
    Name:string|null,
    Number:string|null,
    Email:string|null,
    Website:string|null,
    Brand:string[]|null,
    image:string|null
}