const express = require('express');
const router = express.Router();
const {presignedurl}=require("../Controllers/S3Controller")

router.post("/presignedurl",presignedurl);

module.exports= router;