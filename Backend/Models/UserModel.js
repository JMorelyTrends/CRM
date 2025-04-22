const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,      
    },
    password: {
      type: String,
      required: true,
    },
    SHOPIFY_API_KEY:{
      type:String,
      default:null,
    },
    SHOPIFY_API_SECRET:{
      type:String,
      default:null,
    },
    SHOPIFY_ACCESS_TOKEN:{
      type:String,
      default:null,
    },
    SHOPIFY_STORE_DOMAIN:
    {
      type:String,
      default:null,
    },
  },
  { timestamps: true } // Adds createdAt & updatedAt fields automatically
);

const User = mongoose.model("User", userSchema);

module.exports = User;
