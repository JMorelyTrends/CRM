const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    Name: {
      type: String,

      trim: true,
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