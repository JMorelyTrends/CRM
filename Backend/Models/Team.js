const mongoose = require("mongoose");

const Teamschema = new mongoose.Schema(
  {
    name: {
      type: "string"
    },
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
const Team = new mongoose.model("Team", Teamschema);
module.exports = Team; 