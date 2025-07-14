const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/Ordercontroller");



router.post("/CreateOrders", orderController.createOrder);
router.post("/UpdateStages", orderController.UpdateStages);
router.post("/getAllOrders", orderController.getAllOrders);
router.get("/getnumberofleads", orderController.getnumberofleads);
router.get("/orders/:id", orderController.getOrderById);
router.put("/orders/:id", orderController.updateOrder);
router.delete("/deleteorders", orderController.deleteOrder);
router.post("/updatelabels",orderController.updatelabels)
router.post("/UpdateDescription",orderController.UpdateDescription)
router.post("/Getorderofsuppliers",orderController.Getorderofsuppliers)
router.post("/Confrimorder",orderController.Confrimorder);
router.post("/Confirm_merge_order",orderController.Confirm_merge_order);

router.post("/Wonorders",orderController.Wonorders);
router.post("/getordersfortabel",orderController.getordersfortabel)
router.post("/getOrderofCustomer",orderController.getOrderofCustomer)
router.post("/getLostOrderofCustomer",orderController.getLostOrderofCustomer)
module.exports=router;