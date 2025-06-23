const express=require("express")
const shcutomercontroller=require("../Controllers/shcustomerscontroller")
const router=express.Router();

router.post("/getcustomers",shcutomercontroller.getpageinateCustomers);
module.exports=router;