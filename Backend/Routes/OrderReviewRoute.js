const express = require("express");
const router = express.Router();
const {updateorders,getshopifyorders}=require("../Controllers/OrderReviewController")

router.post("/UpdateReview",updateorders);
router.post("/getshopifyorders", getshopifyorders);
module.exports = router;