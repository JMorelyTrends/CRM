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
  shopifyid:string|null,
  Name?:string,
  email:string,
  total_spend:string,
  orders_count:number,
  customerfrom:string,
  Number:string|null
  
  socialhandel:string,
  emailMarketingConsent: {
    consentUpdatedAt: Date | null;
    marketingOptInLevel: string;
    marketingState: string;
  };
  userid:string,
  tags:string[],
  total_spent?:string,
 address:{ total_spent?:string
  adress1?:string,
  city?:string,
  zip?:string,
  country?:string
}
}
export type dCustomerArray = Custprop[];


export interface StockXItem {
  _id:string,
  image: string;
  name: string;
  slug:string,
  last_sale_price?:number,
  last_sale_update_date?:string,
  sku?:string|null
}

export type Task = {
  _id: string;
  id: number;
  Name: string;
  condition: string;
  size: string;
  stage: string;
  createdAt: string;
  stockxitem: StockXItem[];
  labels: labeltype[];
  Description: string;
  Condition: string;
  cusid: Custprop | null;

  // Existing optional fields
  items?: additem[];
  email?: string;
  phone?: string;
  shopifyorderid?:string,
  DealOwnerid?:{
    _id:string,
    name:string,
  },
  // New fields from OrderSchema (all optional)
  Orderrecived?: string;
  ordersend?: string;
  shopifycustomerid?: string | null;
  Supplierid?: Supplier | null;
  userid?: string[]; // assuming ObjectId array
  price?: number;
  sellprice?:number;
  Shippingfee?: string | null;
  processingfee?: string | null;
  shippingaddress?: string | null;
  Sourceofthruth?: string | null;
  paymentmethod?: string | null;
  DealOwner?: string | null;
  confirm?: boolean;
  linedata?:Slinedata[];
  shipingfee:string,
  Source_of_truth?:string,
  Supplier_Name?:Supplier
  Revenue?:string
};

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

export type Slinedata= {
    title?: string;
    quantity?: string;
    costprice?: number;
  }

export type OrderRpr={
   _id?: string; // Mongoose will generate this automatically
  soid?: string;
  name?: string;
  totalPrice?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  Revenue?: number;
  shipingfee?: number;
  processingfee?: number;
  linedata?:Slinedata[];
  metadata?: {
    name?: string;
    value?: number;
  }[];
  Supplier_Name?:Sup,
  Source_of_truth?:string,
  Traffic_Source?:string,
  profit?:number,
  userid?: string;
  shopifycreatedat?: Date;
  createdAt?: string|Date; // from timestamps: true
  updatedAt?: Date;
  approved?:boolean,
 // from timestamps: true
}


//suppliers types

export type Sup={
  _id?:string,
    Name:string|null,
    Number:string|null,
    Email:string|null,
    Website:string|null,
    Brand:string[]|null,
    image:string|null
}

export type Supplier ={
  _id: string;
  Name: string | null;
  Number: string | null;
  Email: string;
  Website: string | null;
  Brand: string[] | null;
  image: string | null;
  
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type Dashstats={
  newOrders: number,
  needToSource: number,
  liveRequests: number,
  wonOrders: number,
  wonRevenue: number,
  wonProfit: number
}

//Customer Crm

export type Customerprop={
  Name:string,
  Email:string,
  Phone:string,
  SocialHandle:string,
  emailMarketingConsent:string,
  TotalSpent:number,
  TotalOrders:number,
  Custoemrfrom:string,
  id:string,
}

//CustomerCrm
export interface IShopifyCustomer {
  _id: string;
  first_name: string;
  last_name: string;
  shopifyid: string | null;
  email: string;
  customerfrom: string;
  orders_count: number;
  total_spend: string;
  Number: string | null;
  address: string;
  socialhandel: string;
  emailMarketingConsent: {
    consentUpdatedAt: Date | null;
    marketingOptInLevel: string;
    marketingState: string;
  };
  tshopifyspent?:number,
  userid: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GeocodingResult {
  formatted: string;
  components: {
    road?: string;
    house_number?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  geometry: {
    lat: number;
    lng: number;
  };
}