const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      trim: true,
    },
  
  price:{
        type:Number
    },
    itempics:{
        type:[String]
    }
    ,
    orderid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Order"
    },
    userid:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true,
    }
  },
  { timestamps: true } 
);
const Item = mongoose.model("Item", ItemSchema);
module.exports = Item;
