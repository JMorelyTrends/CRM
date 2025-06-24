const mongoose = require("mongoose");

const Sourceoftruthschema=new mongoose.Schema(
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
const Sourceoftruth=new mongoose.model("Sourceoftruth",Sourceoftruthschema)
module.exports=Sourceoftruth