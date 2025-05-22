const express = require("express");
const router = express.Router();
const {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    getCustomers_from_shopify_mongo,
    Updatecusnewreq,
    getAllCustomerOrderStats

} = require("../Controllers/CustomerController");

// Routes
router.post("/createCustomer", createCustomer);          // Create a new customer
router.get("/getAllCustomers", getAllCustomers);          // Get all customers
router.post("/getCustomerById", getCustomerById);       // Get a customer by ID
router.post("/updateCustomer", updateCustomer);        // Update a customer
router.post("/deleteCustomer", deleteCustomer);     // Delete a customer
router.post("/getCustomersbyboth",getCustomers_from_shopify_mongo)
router.post("/Updatecusnewreq",Updatecusnewreq)
router.post("/getAllCustomerOrderStats", getAllCustomerOrderStats);          // Get all customers

module.exports = router;


