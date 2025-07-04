const express = require("express");
const router = express.Router();
const Dcontroller=require("../Controllers/DashboardController")

router.post("/Pershopper",Dcontroller.Pershopper);
router.post("/Perchannel",Dcontroller.Perchannel);
router.post("/Marketingspend",Dcontroller.Marketingspend);
router.post("/Sourceoftruth",Dcontroller.Sourceoftruth);
router.post("/ProRev",Dcontroller.ProRev)
module.exports=router