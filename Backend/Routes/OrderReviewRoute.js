const express = require("express");
const router = express.Router();
const {updateorders}=require("../Controllers/OrderReviewController")

router.post("/UpdateReview",updateorders);

module.exports = router;