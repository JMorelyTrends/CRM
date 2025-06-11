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
    getAllCustomerOrderStats,
    update_Customer_Crm,
     getshopifyorders,
createshopifycustoemr,
updateshopifycustomer,
UseShopiyfcustomer,
Cuscrmupdate
} = require("../Controllers/CustomerController");

// Routes
router.post("/createCustomer", createCustomer);          // Create a new customer
router.post("/getAllCustomers", getAllCustomers);          // Get all customers
router.post("/getCustomerById", getCustomerById);       // Get a customer by ID
router.post("/updateCustomer", updateCustomer);        // Update a customer
router.post("/deleteCustomer", deleteCustomer);     // Delete a customer
router.post("/getCustomersbyboth",getCustomers_from_shopify_mongo)
router.post("/Updatecusnewreq",Updatecusnewreq)
router.post("/getAllCustomerOrderStats", getAllCustomerOrderStats);          // Get all customers
router.post("/update_Customer_Crm",update_Customer_Crm)
router.post("/getshopifyorders", getshopifyorders);
router.post("/cratenewhsopifycustomer",createshopifycustoemr)
router.post("/updateshopifycustomer",updateshopifycustomer);
router.post("/usethecustomer",UseShopiyfcustomer)
router.post("/Cuscrmupdate",Cuscrmupdate)


module.exports = router;


