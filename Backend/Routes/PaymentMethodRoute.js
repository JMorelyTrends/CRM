const express = require("express");
const router = express.Router();
const paycontroller=require("../Controllers/PaymentMethodController")

router.post("/getpaymentmethods",paycontroller.getpaymentmethods);
router.post("/createpaymentmethod",paycontroller.addpaymentmethod);
router.delete("/deleteaddpaymentmethod",paycontroller.deleteaddpaymentmethod);

module.exports=router;