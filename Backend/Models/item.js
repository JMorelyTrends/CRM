const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      trim: true,
    },
  
    B2Bprice:{
        type:Number,
    },
    Sellprice:{
        type:Number
    },
    itempics:{
        type:[String]
    }
    ,
    orderid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Order"
    }
  },
  { timestamps: true } 
);
const Item = mongoose.model("Item", ItemSchema);
module.exports = Item;
