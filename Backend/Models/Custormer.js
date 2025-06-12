const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      trim: true,
    },
    last_name:{
      type:String,
      trim:true
    },
    shopifyid:{
      type:Number,
       default:null,
    },
    email: {
      type: String,
      trim:true,
      default:"" 
    },
    customerfrom:{
      type:String,
      default:"mongodb"
    },
    total_spend:{
      type:Number,
      default:0
    },
    orders_count:{
     type:Number,
     default:0,
    },
    tags:{
      type:[String],
    },
    socialhandel:{
      type:String,
    },
    Number:{
      type:String,
    },
    address: {
      type: String,
    },
    City:{
      type:String,
    },
    Postcode:{
        type:String,
    },
    emailMarketingConsent: {
      consentUpdatedAt: {
        type:Date,
        default: new Date().toISOString(),
      },
      marketingOptInLevel: {
        type:String,
        default:"SINGLE_OPT_IN"
      },
      marketingState: {
        type:String,
        default:"unsubscribed"
      }
    },
    userid:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true,
    }
  },
  { timestamps: true } // Adds createdAt & updatedAt fields automatically
);
CustomerSchema.index({ userid: 1 , Name:"text",email:"text",Number:1,socialhandel:'text'  })
const Customer = mongoose.model("Customer", CustomerSchema);
module.exports = Customer;