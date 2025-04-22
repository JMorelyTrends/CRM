const mongoose = require("mongoose");



const LabelSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      name: { type: String, required: true },
      col: { type: String, required: true },
    }, 
  },
  {
    timestamps: true,
  }
);

const Label = mongoose.model("Label", LabelSchema);
module.exports = Label;
