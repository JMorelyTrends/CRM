const express=require("express")
const {verifyShopifyWebhook}=require("../Middlewares/Shopifywares")
const router=express.Router()
const shopifyhook=require("../Webhooks/Shopifyhooks");
router.post("/hook",verifyShopifyWebhook,shopifyhook.handelhook);
module.exports=router