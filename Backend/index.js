const express = require("express");
const cors = require("cors");
require('dotenv').config();
const app = express();
const Routes=require("./utils/Routes")

app.use(cors({ origin: "*" }));
const DB_ConnectDB = require("./utils/DBconnect"); 

DB_ConnectDB();

// Raw body parsing for webhooks (must come before JSON parsing)
app.use("/api/webhooks/shopify", express.raw({ type: 'application/json' }));

//routes for hooks
app.use("/api/webhooks/shopify",Routes.shopifyhookRoutes);

app.use(express.json()); 

app.use("/api/supplier",Routes.SupplierRoute);
app.use("/api/users", Routes.userRoutes);
app.use("/api/orders",Routes.OrderRoutes);
app.use("/api/item",Routes.ItemRoutes);
app.use("/api/customers",Routes.CustomerRoutes);
app.use("/api/Stockx/",Routes.StockXRoutes);
app.use("/api/features/",Routes.FeatureRoutes);
app.use("/api/S3",Routes.S3Routes);
app.use("/api/Review",Routes.OrderReviewRoute);
app.use("/api/shcustomer",Routes.shcustomerRoutes);
app.use("/api/PaymentMethods",Routes.paymentRoutes);
app.use("/api/Sourceoftruth",Routes.SourceoftruthRoutes)
app.use("/api/Brands",Routes.BrandsRoutes)
app.use("/api/Dash",Routes.DashRoutes)

const Port = process.env.PORT;
app.listen(Port, () => {
  console.log(`server is listing on ${Port}`);
});