const mongoose = require("mongoose");

const OrderreviewSchema = new mongoose.Schema(
  {
    soid: {          //to store shopify order id 
      type: String,
      unique:true,
    },
    name: {
      type: String,
      unique:true,
    },
    totalPrice: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    phone: {
      type: String,
    },
    Revenue: {
      type: Number,
      default: 0,
    },
    shipingfee: {
      type: Number,
      default: 0,
    },
    profit:
    {
     type:Number,
     default:0
    },
    processingfee: {
      type: Number,
      default: 0,
    },
    linedata: [
      {
        title: {
          type: String,
        },
        quantity: {
          type: String,
        },
        costprice: {
          type: Number,
        },
      },
    ],
    metadata: [
      {
        name: {
          type: String,
        },
        value: {
          type: Number,
        },
      },
    ],

    shopifycreatedat: {
      type: Date,
    },
    Traffic_Source: {
      type: String,
      default: null,
    },
    Source_of_truth: {
      type: String,
      default: null,
    },
    Supplier_Name:{
     type:mongoose.Schema.Types.ObjectId,
    ref:"Supplier",
    default:null,
  },
    approved: {
      type: Boolean,
      default: false,
    },
  userid:{
    type:[mongoose.Schema.Types.ObjectId],
    ref:"User",
    required:true,
  },
  customer: {
    id: { type: String }, // Shopify GID or numeric ID
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phone: { type: String },
  },
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  taxes: { type: Number, default: 0 },
  status:{
    type:String,
    enum:["active","Refunded","deleted"],
    default:"active"
  },
  statusupdate:{
    type:Date,
    
  }
  },
  { timestamps: true }
);
OrderreviewSchema.index({ soid: "text", name: "text", totalPrice: "text" });
const Orderreview = mongoose.model("Orderreview", OrderreviewSchema);
module.exports = Orderreview;
