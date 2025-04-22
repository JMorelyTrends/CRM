const express = require("express")
const router= express.Router();
const {addlabel,getlabels,dellabel} = require("../Controllers/LabelController")
router.post('/addlabel',addlabel)
router.post('/getlabels',getlabels)
router.post('/dellabel',dellabel)


module.exports=router