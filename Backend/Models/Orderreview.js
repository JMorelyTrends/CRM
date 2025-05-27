const mongoose = require("mongoose");

const OrderreviewSchema = new mongoose.Schema({
  soid: {
    type: String,
  },
  name: {
    type: String,
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
    type:String,
  },
  totalPrice:{
   type:String
  },
  meta_namespace: {
    type: String,
    default:null,
  },
  metavalue: {
    type: String,
    default:null,
  },
  userid:{
    type:String,
  }
},
 { timestamps: true } 
);
OrderreviewSchema.index({soid:'text',name:"text",totalPrice:"text"});
const Orderreview=mongoose.model("Orderreview",OrderreviewSchema);
module.exports=Orderreview