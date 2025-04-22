const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/Ordercontroller");



router.post("/CreateOrders", orderController.createOrder);
router.post("/UpdateStages", orderController.UpdateStages);
router.post("/getAllOrders", orderController.getAllOrders);
router.get("/getnumberofleads", orderController.getnumberofleads);
router.get("/orders/:id", orderController.getOrderById);
router.put("/orders/:id", orderController.updateOrder);
router.delete("/orders/:id", orderController.deleteOrder);
router.post("/updatelabels",orderController.updatelabels)
router.post("/UpdateDescription",orderController.UpdateDescription)


module.exports=router;

