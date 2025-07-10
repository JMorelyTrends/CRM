const express = require('express');
const router = express.Router();
const {presignedurl, backupDatabase}=require("../Controllers/S3Controller")

router.post("/presignedurl",presignedurl);
router.get("/backup", backupDatabase);

module.exports= router;