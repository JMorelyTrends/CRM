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
   size:{
    type:Object,
    default:null
   },
   last_sale_price:{
    type:Number,
    default:0
   },
   primary_category:{
    type:String,
    default:null
   },
   last_sale_update_date:{
    type:String,
   },
    enriched:{
     type: Boolean,
     default: false
     },
    model:{
      type:String,
      default:null
    },
  enrichedAt:{
     type: Date,
      default: null
     },
  },
  { timestamps: true } 
);
StockxDatabaseSchema.index({ name: 'text' });  // This creates a text index on 'name'
StockxDatabaseSchema.index({ brand: 'text', category: 'text', Colorway: 'text' });
StockxDatabaseSchema.index({ Stockxid: 1 });

const StockxDatabase = mongoose.model("StockxDatabase", StockxDatabaseSchema);
module.exports = StockxDatabase;
