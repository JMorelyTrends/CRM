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
   },
   last_sale_price:{
    type:Number,
    default:0
   },
   last_sale_update_date:{
    type:String,
   }
  
  },
  { timestamps: true } 
);
StockxDatabaseSchema.index({ name: 'text' });  // This creates a text index on 'name'
StockxDatabaseSchema.index({ brand: 'text', category: 'text', Colorway: 'text' });
StockxDatabaseSchema.index({ Stockxid: 1 });

const StockxDatabase = mongoose.model("StockxDatabase", StockxDatabaseSchema);
module.exports = StockxDatabase;
