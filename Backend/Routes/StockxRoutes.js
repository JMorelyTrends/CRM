const express= require("express")
const router= express.Router();
const StockxController=require("../Controllers/StockxController")
router.post("/getstock",StockxController.Getdatastore);
router.post("/Getprepopulate",StockxController.Getprepopulate);
router.post("/Getproductprice",StockxController.Getproductprice);
router.post("/getprice_github",StockxController.getprice_github);
router.post("/getstockstore",StockxController.Getdata)

module.exports=router