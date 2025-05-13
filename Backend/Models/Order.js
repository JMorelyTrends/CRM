const mongoose = require("mongoose");


const OrderSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      trim: true,
    },
    Orderrecived:{
        type:Date
    },
    ordersend:{
        type:Date
    },
    items:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"Item",
    },
    stockxitem:{
      type:[mongoose.Schema.Types.ObjectId],
      ref:"StockxDatabase",
  },
  shopifycustomerid:{
    type:String,
    default:null,
  },
  cusid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Customer",
    default:null,
  },
  Supplierid:{
     type:mongoose.Schema.Types.ObjectId,
    ref:"Supplier",
    default:null,
  },
  size:{
    type:String,
  },
  condition:{
    type:String,
  },
  stage: {
    type: String,
    enum: ["New Lead", "Need To Source", "Offered", "Warm Lead", "Won", "Lost"],
    default: "New Lead",
  },
  userid:{
    type:[mongoose.Schema.Types.ObjectId],
    ref:"User",
    required:true,
  },
  price:{
    type:Number,
    default:0,
  },
  labels:{
    type:[mongoose.Schema.Types.ObjectId],
    ref:"Label",
    default:null,
  },
  Description:{
    type:String,
    default:null,
  },
  Shippingfee:{
    type:String,
    default:null,
  },
  processingfee:{
    type:String,
    default:null,
  },
  shippingaddress:{
    type:String,
    default:null,
  },
  Sourceofthruth:{
    type:String,
    default:null,
  },
  paymentmethod:{
    type:String,
    default:null,
  },
  DealOwner:{
    type:String,
    default:null,
  },
  confirm:{
    type:Boolean,
    default:false,
  }
  },
  { timestamps: true } 
);
const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;