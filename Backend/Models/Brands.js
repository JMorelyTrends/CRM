const mongoose = require("mongoose");

const Brandschema=new mongoose.Schema(
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
const Brands=new mongoose.model("Brands",Brandschema)
module.exports=Brands