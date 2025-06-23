const mongoose =require('mongoose')

const shopifyCustomerSchema = new mongoose.Schema({
  shopify_id: { type: String, unique: true, required: true, index: true },  // unique index
  firstName: { type: String, index: true },
  lastName: { type: String, index: true },
  email: { type: String, index: true },
  phone: String,
  shopifyCreatedAt: Date,
  numberOfOrders: Number,
  amountSpent: {
    amount: { type: Number, index: true }, // index on numeric field
    currencyCode: String
  },
  defaultAddress: {
    address1: String,
    city: String,
    zip: String
  },
  userid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
  },
  emailMarketingConsent: {
    consentUpdatedAt: Date,
    marketingOptInLevel: String,
    marketingState: String
  },
  lastUpdatedAt: { type: Date, default: Date.now }
}, { timestamps: true }); // adds createdAt and updatedAt automatically

const ShopifyCustomer = mongoose.model('ShopifyCustomer', shopifyCustomerSchema);

 module.exports=ShopifyCustomer;   