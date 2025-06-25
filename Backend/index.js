const express = require("express");
const cors = require("cors");
require('dotenv').config();
const app = express();
const userRoutes= require("./Routes/UserRoute")
const OrderRoutes=require("./Routes/OrderRoutes")
const ItemRoutes=require("./Routes/ItemRoutes")
const CustomerRoutes=require("./Routes/CustomerRoutes")
const StockXRoutes=require("./Routes/StockxRoutes")
const FeatureRoutes=require("./Routes/FeatureRoutes")
const S3Routes=require("./Routes/S3routes")
const SupplierRoute=require("./Routes/SupplierRoute")
const OrderReviewRoute=require("./Routes/OrderReviewRoute")
const shcustomerRoutes=require("./Routes/shcustomerRoutes")
const shopifyhookRoutes=require("./Routes/shopifyhooksRoute");
const paymentRoutes=require("./Routes/PaymentMethodRoute")
const SourceoftruthRoutes=require("./Routes/SourceoftruthRoute")
const BrandsRoutes=require("./Routes/BrandsRoutes")

app.use(cors({ origin: "*" }));
const DB_ConnectDB = require("./utils/DBconnect"); 

DB_ConnectDB();

// Raw body parsing for webhooks (must come before JSON parsing)
app.use("/api/webhooks/shopify", express.raw({ type: 'application/json' }));

//routes for hooks
app.use("/api/webhooks/shopify",shopifyhookRoutes);

app.use(express.json()); 

app.use("/api/supplier",SupplierRoute);
app.use("/api/users", userRoutes);
app.use("/api/orders",OrderRoutes);
app.use("/api/item",ItemRoutes);
app.use("/api/customers",CustomerRoutes);
app.use("/api/Stockx/",StockXRoutes);
app.use("/api/features/",FeatureRoutes);
app.use("/api/S3",S3Routes);
app.use("/api/Review",OrderReviewRoute);
app.use("/api/shcustomer",shcustomerRoutes);
app.use("/api/PaymentMethods",paymentRoutes);
app.use("/api/Sourceoftruth",SourceoftruthRoutes)
app.use("/api/Brands",BrandsRoutes)

const Port = process.env.PORT;
app.listen(Port, () => {
  console.log(`server is listing on ${Port}`);
});