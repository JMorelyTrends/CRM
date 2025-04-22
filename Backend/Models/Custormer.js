const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    
      trim: true,
    },
    email: {
      type: String,
      unique:true,
      required: true,
    },
    Number:{
      type:String,
    },
    address: {
      type: String,
      required: true,
    },
    City:{
      type:String,
    },
    Postcode:{
        type:String,
        required:true,
    },
    userid:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true,
    }
  },
  { timestamps: true } // Adds createdAt & updatedAt fields automatically
);
const Customer = mongoose.model("Customer", CustomerSchema);
module.exports = Customer;