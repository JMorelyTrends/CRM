const express=require("express")
const router=express.Router();
const {CreateSupplier,getthemall,updatesupplier}=require("../Controllers/SupplierController");

router.post("/CreateSupplier",CreateSupplier);
router.get("/getallsuppliers",getthemall);
router.post("/updatesupplier",updatesupplier);


module.exports=router