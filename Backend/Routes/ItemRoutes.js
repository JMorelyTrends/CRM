const express = require("express");
const router = express.Router();
const itemController = require("../Controllers/ItemControllers");

router.post("/createItem", itemController.createItem);
router.get("/getAllItems", itemController.getAllItems);
router.post("/getItemById", itemController.getItemById);
router.post("/updateItem", itemController.updateItem);
router.post("/deleteItem", itemController.deleteItem);

module.exports = router;
