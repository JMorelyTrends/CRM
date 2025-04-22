const mongoose = require("mongoose");

const StockxDatabaseSchema = new mongoose.Schema(
  {
   Stockxid:{
    type:String
   },
   sku:{
    type:String
   },
   name:{
    type:String,
   },
   slug:{
    type:String,
   },
   brand:{
    type:String,
   },
   image:{
    type:String
   },
   Category:{
    type:String,
   },
   Colorway:{
    type:String,
   }
  
  },
  { timestamps: true } 
);
StockxDatabaseSchema.index({ name: 'text' });  // This creates a text index on 'name'
const StockxDatabase = mongoose.model("StockxDatabase", StockxDatabaseSchema);
module.exports = StockxDatabase;
