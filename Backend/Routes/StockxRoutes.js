const express= require("express")
const router= express.Router();
const StockxController=require("../Controllers/StockxController")
router.post("/getstockstore",StockxController.Getdatastore);
router.post("/Getprepopulate",StockxController.Getprepopulate);

module.exports=router