const express=require("express")
const router=express.Router();
const {CreateSupplier,getthemall}=require("../Controllers/SupplierController");

router.post("/CreateSupplier",CreateSupplier);
router.get("/getallsuppliers",getthemall)
module.exports=router