const mongoose = require("mongoose");

const OrderreviewSchema = new mongoose.Schema(
  {
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
      type: String,
    },
    Revenue: {
      type: Number,
      default: 0,
    },
    shipingfee: {
      type: Number,
      default: 0,
    },
    profit:
    {
     type:Number,
     default:0
    },
    processingfee: {
      type: Number,
      default: 0,
    },
    linedata: [
      {
        title: {
          type: String,
        },
        quantity: {
          type: String,
        },
        costprice: {
          type: Number,
        },
      },
    ],
    metadata: [
      {
        name: {
          type: String,
        },
        value: {
          type: Number,
        },
      },
    ],
    userid: {
      type: String,
    },
    shopifycreatedat: {
      type: Date,
    },
    Traffic_Source: {
      type: String,
      default: null,
    },
    Source_of_truth: {
      type: String,
      default: null,
    },
    Supplier_Name: {
      type: String,
      default: null,
    },
    approved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
OrderreviewSchema.index({ soid: "text", name: "text", totalPrice: "text" });
const Orderreview = mongoose.model("Orderreview", OrderreviewSchema);
module.exports = Orderreview;
