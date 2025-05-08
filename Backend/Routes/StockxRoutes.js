const express= require("express")
const router= express.Router();
const StockxController=require("../Controllers/StockxController")
router.post("/getstockstore",StockxController.Getdatastore);
router.post("/Getprepopulate",StockxController.Getprepopulate);
router.post("/Getproductprice",StockxController.Getproductprice);
router.post("/getprice_github",StockxController.getprice_github);


module.exports=router