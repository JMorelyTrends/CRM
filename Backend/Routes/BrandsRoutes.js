const express = require("express");
const router = express.Router();
const Brandscontroller=require("../Controllers/BrandsController")

router.post("/getBrands",Brandscontroller.getBrands);
router.post("/createBrands",Brandscontroller.createBrands);
router.delete("/deleteBrands",Brandscontroller.deleteBrands);

module.exports=router;