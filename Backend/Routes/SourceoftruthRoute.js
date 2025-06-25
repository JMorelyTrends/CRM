const express = require("express");
const router = express.Router();
const Sourceoftruth=require("../Controllers/SourceoftruthController")
router.post("/getsources",Sourceoftruth.getsources);
router.post("/createsource",Sourceoftruth.createsource);
router.delete("/deletesource",Sourceoftruth.deletesource);

module.exports=router;