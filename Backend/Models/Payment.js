const mongoose = require("mongoose");

const PaymentMethodSchema=new mongoose.Schema(
    {
       name:{
        type:"string"
       },
       userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
      },
    },
    { timestamps: true }
)
const PaymentMethod=new mongoose.model("PaymentMethod",PaymentMethodSchema)
module.exports=PaymentMethod