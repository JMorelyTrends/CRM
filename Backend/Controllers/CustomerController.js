process.env.SHOPIFY_LOG = "error";
const Customer = require("../Models/Custormer");
const ShopifyCustomer=require("../Models/ShopifyCustomers")
const Order = require("../Models/Order");
const mongoose = require("mongoose");
const Orderreview=require("../Models/Orderreview")
require("@shopify/shopify-api/adapters/node");
const { shopifyApi, ApiVersion, Session } = require("@shopify/shopify-api");
const { restResources } = require("@shopify/shopify-api/rest/admin/2025-04");
const { response } = require("express");

const customLogger = {
  log: (severity, message) => {
    if (severity === "error") {
      //console.error(`[${severity}] ${message}`);
    }
  },
};

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: ApiVersion.April25,
  isCustomStoreApp: true,
  adminApiAccessToken: process.env.SHOPIFY_ACCESS_TOKEN,
  isEmbeddedApp: false,
  hostName: process.env.SHOPIFY_STORE_DOMAIN,
  scopes: ["read_customers", "write_draft_orders", "write_orders"],
  logger: customLogger,
  restResources,
});

const { DraftOrder } = shopify.rest;
const { Customer:custs } = shopify.rest;

const session = shopify.session.customAppSession(
  process.env.SHOPIFY_STORE_DOMAIN
);
console.log(Object.keys(custs));
const normalizePhoneNumber = (phone) => {
  if (!phone) return "";
  phone = phone.trim();
  if (phone.startsWith("+44")) return phone;
  if (phone.startsWith("44")) return `+${phone}`;
  if (phone.startsWith("0")) return `+44${phone.slice(1)}`;
  return phone;
};
 const isValid = (field) => field && field.trim() !== "";
const createCustomer = async (req, res) => {
  try {
    const { newCustomer } = req.body;
    const client = new shopify.clients.Rest({ session });
   
 // STEP-1: if no unique identifier exists just send back
    if (
      !isValid(newCustomer.email) &&
      !isValid(newCustomer.number) &&
      !isValid(newCustomer.social)
    ) {
      return res.status(400).json({
        message: "At least one of email, number, or social handle is required.",
      });
    }


   //STEP-2: CHECK IN SHOPIIFY IF THE CUSTOMER EXISTS
    let queryParts = [];
    if (isValid(newCustomer.email))
      queryParts.push(`email:${newCustomer.email.trim()}`);
    if (isValid(newCustomer.number)) {
      const normalizedPhone = normalizePhoneNumber(newCustomer.number);
      queryParts.push(`phone:${normalizedPhone}`);
    }
    const query = queryParts.join(" OR ");

    let customerData = { customers: [] };
    if (queryParts.length > 0) {
      customerData = await shopify.rest.Customer.search({
        session,
        query,
      });
    }

    if (customerData.customers.length > 0) {
      const newCustomer = {
        _id: customerData.customers[0].id,
        email: customerData.customers[0].email,
        first_name: customerData.customers[0].first_name,
        last_name: customerData.customers[0].last_name,
        total_spent: customerData.customers[0].total_spent,
        orders_count: customerData.customers[0].orders_count,
        customerfrom: "shopify",
        Number: customerData.customers[0].phone,
        address: {
          address1: customerData.customers[0].default_address?.address1 || "",
          city: customerData.customers[0].default_address?.city || "",
          zip: customerData.customers[0].default_address?.zip || "",
        },
      };
      return res.status(200).json({
        alert: "Exists in Shopify database",
        customer: newCustomer,
      });
    }
//STEP-3: CHECK IN DB IF THE CUSTOMER EXISTS
    const searchConditions = [];
    if (isValid(newCustomer.email))
      searchConditions.push({ email: newCustomer.email.trim() });
    if (isValid(newCustomer.number))
      searchConditions.push({ Number: newCustomer.number.trim() });
    if (isValid(newCustomer.social))
      searchConditions.push({ socialhandel: newCustomer.social.trim() });

    const existingCustomer = await Customer.findOne({ $or: searchConditions });

    if (existingCustomer) {
      return res.status(200).json({
        alert: "Exists in database",
        customer: existingCustomer,
      });
    }

     // --- Step 4: Create if not exists ---
    if (isValid(newCustomer.email)) {
      // Create customer on Shopify
      const shopifyCustomerPayload = {
        email: newCustomer.email.trim(),
        first_name: newCustomer.first_name || "",
        last_name:newCustomer.last_name||"",
        phone: isValid(newCustomer.number) ? newCustomer.number.trim() : "",
      };
      const createdShopifyCustomer = ( await client.post({
  path: 'customers',
  data: {
    customer: {
      email: newCustomer.email,
      first_name: newCustomer.first_name || '',
      last_name:newCustomer.last_name||'',
      phone: newCustomer.phone || '',
      addresses: [
        {
          address1: newCustomer.address || '',
          city: newCustomer.city || '',
          zip: newCustomer.postcode || ''
        }
      ],
    },
  },
  type: 'application/json',
})).body.customer
    
      // Return the created customer from Shopify
      const responseCustomer = {
        first_name:createdShopifyCustomer.first_name,
        last_name:createdShopifyCustomer.last_name,
        shopifyid: createdShopifyCustomer.id,
        email: createdShopifyCustomer.email,
        total_spent: createdShopifyCustomer.total_spent,
        orders_count: createdShopifyCustomer.orders_count,
        customerfrom: "mongodb",
        Number: createdShopifyCustomer.phone,
        address: createdShopifyCustomer.default_address?.address1 || "",
        City: createdShopifyCustomer.default_address?.city || "",
        postcode: createdShopifyCustomer.default_address?.zip || "",
        userid:newCustomer.userid,
        socialhandel: isValid(newCustomer.social)
        ? newCustomer.social.trim()
        : "",
      };

     const k= await Customer.create(responseCustomer)

      return res.status(201).json({
        message: "Customer created in Shopify.",
        customer: k,
      });
    }




    const createdCustomer = await Customer.create({
      first_name: isValid(newCustomer.first_name) ? newCustomer.first_name.trim() : "",
      last_name: isValid(newCustomer.last_name) ? newCustomer.last_name.trim() : "",
      email: isValid(newCustomer.email) ? newCustomer.email.trim() : "",
      Number: isValid(newCustomer.number) ? newCustomer.number.trim() : "",
      address: isValid(newCustomer.address) ? newCustomer.address.trim() : "",
      City: isValid(newCustomer.city) ? newCustomer.city.trim() : "",
      Postcode: isValid(newCustomer.postcode)
        ? newCustomer.postcode.trim()
        : "",
      userid: newCustomer.userid,
      socialhandel: isValid(newCustomer.social)
        ? newCustomer.social.trim()
        : "",
    });

    res.status(201).json({
      message: "Customer created successfully.",
      customer: createdCustomer,
    });
  } catch (error) {
   console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.body;
    //console.log(id)
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getCustomers_from_shopify_mongo = async (req, res) => {
  const { search, id } = req.body;

  let query = "";
  let mongoQuery = {};

  if (!search || typeof search !== "string") {
    return res.status(400).json({ message: "Invalid search query" });
  }

  const isEmail = search.includes("@");
  const isPhone = /^\+?[0-9\s\-()]+$/.test(search.trim()); // detect phone-like input safely

  if (isEmail) {
    // Search by Email
    query = `email:${search.trim()}`;
    mongoQuery = {
      $and: [
        { userid: id },
        { email: { $regex: new RegExp(`^${search}$`, "i") } },
      ],
    };
  } else if (isPhone || search.startsWith("+")) {
    // Search by Phone

    const sanitizedPhone = search.trim().replace(/\s+/g, ""); // remove extra spaces
    query = `phone:${sanitizedPhone}`;
    const mp = sanitizedPhone.replace("+", "");
    mongoQuery = {
      $and: [{ userid: id }, { Number: { $regex: new RegExp(mp, "i") } }],
    };
  } else {
    // Search by Name
    const nameParts = search.trim().split(/\s+/);

    if (nameParts.length === 2) {
      query = `name:${search.trim()}`;
    } else if (nameParts.length === 1) {
      query = `first_name:${nameParts[0]}`;
    } else {
      return res.status(400).json({ message: "Invalid name format" });
    }

    const regexConditions = nameParts.map((part) => ({
      first_name: { $regex: new RegExp(part, "i") },
    }));

    mongoQuery = {
  $and: [
    { userid: id },
    {
      $or: [
        ...regexConditions,
        { socialhandel: { $regex: new RegExp(search, "i") } },
        { Number: { $regex: new RegExp(search, "i") } },
      ],
    },
    {
      $or: [
        { email: { $exists: false } },
        { email: { $in: [null, ""] } }, // check for null or empty
      ],
    },
  ],
};
  }

  try {
    const [mongodata, customerData] = await Promise.all([
      Customer.find(mongoQuery),
      shopify.rest.Customer.search({ session, query }),
    ]);

   

    const d = customerData.customers.map((customer) => ({
      _id: customer.id,
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name,
      total_spent: customer.total_spent,
      orders_count: customer.orders_count,
      customerfrom: "shopify",
      Number: customer.phone,
      address: {
        address1: customer.default_address?.address1 || "",
        city: customer.default_address?.city || "",
        zip: customer.default_address?.zip || "",
      },
    }));

    res.status(200).json({ d, dm: mongodata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Shopify customer search failed", error });
  }
};

const updateCustomer = async (req, res) => {
  try {
     const {Cust ,orderid} = req.body;
     const client = new shopify.clients.Rest({ session });
   
     //step check if the customer exists in the shopify

     let queryParts = [];
     if (isValid(Cust.email))
       queryParts.push(`email:${Cust.email.trim()}`);
     if (isValid(Cust.phone)) {
       const normalizedPhone = normalizePhoneNumber(Cust.phone);
       queryParts.push(`phone:${normalizedPhone}`);
     }
     const query = queryParts.join(" OR ");
 
     let customerData = { customers: [] };
     if (queryParts.length > 0) {
       customerData = await shopify.rest.Customer.search({
         session,
         query,
       });
      
     }
 
     if (customerData.customers.length > 0) {
       const newCustomer = {
         _id: customerData.customers[0].id,
         email: customerData.customers[0].email,
         first_name: customerData.customers[0].first_name,
         last_name: customerData.customers[0].last_name,
         total_spent: customerData.customers[0].total_spent,
         orders_count: customerData.customers[0].orders_count,
         customerfrom: "shopify",
         Number: customerData.customers[0].phone,
         address: {
           address1: customerData.customers[0].default_address?.address1 || "",
           city: customerData.customers[0].default_address?.city || "",
           zip: customerData.customers[0].default_address?.zip || "",
         },
       };
        

       return res.status(200).json({
         alert: "Exists in Shopify database",
         customer: newCustomer,
       });
     }

     const createdShopifyCustomer = ( await client.post({
      path: 'customers',
      data: {
        customer: {
          email: Cust.email,
          first_name: Cust.firstName|| '',
          last_name:Cust.lastName||'',
          phone: Cust.phone || '',
          addresses: [
            {
              address1: Cust.address || '',
              city: Cust.city || '',
              zip: Cust.postcode || ''
            }
          ],
        },
      },
      type: 'application/json',
    })).body.customer

    const re=await Customer.findOneAndUpdate({_id:Cust._id},{$set:{
      first_name:Cust.firstName,
      last_name:Cust.lastName,
      email:Cust.email,
      Number:Cust.phone,
     
     }})
     if(orderid)
     {
      console.log(orderid)
      console.log(re)
       const t=await Order.findByIdAndUpdate({
        _id:orderid
       },{
        $set:{
          cusid:re._id,
          Name:Cust.firstName+' '+Cust.lastName
        }
       });
     }
    res.status(200).json({
      message: "Customer updated successfully",
      customer: re,
    });
  } 
  
  catch (error) {
 
    const errors = error?.response?.body.errors;
    if (Object.values(errors)[0]?.[0])
       {
      const re = Object.values(errors)[0]?.[0];
      if (errors?.phone) {
      
        const d="phone"+re;
        res.status(501).json({data:d})

      } else if (errors?.email) {
        const d = "email " + re;
        res.status(501).json({data:d})
      }
    } else {
      const re = "something went wrong with shpoify update";

        res.status(501).json({data:d})
    }
  }
};



//to get all the customers from orders

const UseShopiyfcustomer=async(req,res)=>{  //when you entered the email to the  customer which dont have email hten this api hit when user press use
try{
  const {Cust,orderid}=req.body;


  //Step-1 check if that email have in our db or not if yes return that customer id

  
  const t=await Customer.findOne({email:Cust.email});
  const order= await Order.findOne({_id:orderid})
  if(t)
  {
   //if there is hte customer which are present with that mail that order will be given to that customer
     // find hte order and give t._id ot that order cusid 

     const newo=await Order.findByIdAndUpdate({
      _id:orderid
     },{
      $set:{
        cusid:t._id,
        Name:t.first_name+' '+t.last_name
      }
     });
     return res.status(201).json({message:"order user updated"});
  }
  

  //STEP 2 check if the email is in the shopify
  let queryParts = [];
  if (isValid(Cust.email))
    queryParts.push(`email:${Cust.email.trim()}`);
  if (isValid(Cust.Number)) {
    const normalizedPhone = normalizePhoneNumber(Cust.Number);
    queryParts.push(`phone:${normalizedPhone}`);
  }
  const query = queryParts.join(" OR ");
  const E=Cust.email.trim();
  const d = await shopify.rest.Customer.search({ session, query });
  
  if(d && d.customers.length>0)
  {
    const iid=await Customer.create({
     shopifyid:d.customers[0]?.id,
     first_name:d.customers[0]?.first_name,
     last_name:d. customers[0].last_name,
     email:d.customers[0].email,
     orders_count:d.customers[0].orders_count,
     total_spent:d.customers[0].total_spent,
     Number:d.customers[0].phone,
     userid:order.userid,
     emailMarketingConsent:{
       consentUpdatedAt:d.customers[0].email_marketing_consent.consent_updated_at,
       marketingOptInLevel:d.customers[0].email_marketing_consent.opt_in_level,
       marketingState:d.customers[0].email_marketing_consent.state
     }
    })

    const nn=await Order.findByIdAndUpdate({
      _id:orderid
     },{
      $set:{
        cusid:iid._id,
        Name:iid.first_name+' '+iid.last_name
      }
     });
     return res.status(201).json({message:"order user updated"});
   
  }

  //STEP 3 if customer is not in shopoify and db create one
  console.log("step3")
  
     
      

}
catch(err)
{
  console.log(err)
  res.status(500).json({message:"something worng with the customer"})
}
}

const getAllCustomerOrderStats = async (req, res) => {
  try {
    const { userId } = req.body;
    const agg = await Order.aggregate([
      { $match: { userid: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "customers",
          localField: "cusid",
          foreignField: "_id",
          as: "CustomerInfo",
        },
      },
      {
        $unwind: {
          path: "$CustomerInfo",
          preserveNullAndEmptyArrays: true, // set to true if you want to keep orders without customer
        },
      },
      {
        $group: {
          _id: {
            shopifyId: "$shopifycustomerid",
            mongoId: "$cusid",
          },
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$price" },
          customer: { $first: "$CustomerInfo" }, // include full customer data
        },
      },
      {
        $project: {
          _id: 0,
          shopifyId: "$_id.shopifyId",
          cusid: "$_id.mongoId",
          orderCount: 1,
          totalSpent: 1,
          customer: 1,
        },
      },
    ]);

    const shopifyMap = new Map(
      agg.filter((r) => r.shopifyId).map((r) => [r.shopifyId, r])
    );

    const mongoBuckets =new Map( agg.filter((r) => !r.shopifyId).map((r)=> [r?.customer?._id.toString(),r] ))
    
      
    const shocus = (await getcustoemrwithorders(shopifyMap)).flat();
      
    const dbm=await Customer.find({userid:userId});
    const mergedCustomers = [];
  
  //  console.log(mongoBuckets.get('682ee56c7c3e911370a40ab9'))
  

    for (const customer of dbm) {
   // console.log(mongoBuckets.get(customer?._id.toString())) 
      mergedCustomers.push({
        id: customer?._id,
        Name: customer?.Name || "",
        Email: customer?.email || "",
        Phone: customer?.Number || "",
        SocialHandle: customer?.socialhandel || "",
        emailMarketingConsent: "UNSUBSCRIBED",
        Custoemrfrom: "Mongodb",
        TotalSpent:mongoBuckets?.get(customer?._id?.toString())?.totalSpent|| 0,
        TotalOrders:mongoBuckets?.get(customer?._id?.toString())?.orderCount|| 0,
      });
    }

    for (const customer of shocus) {
      mergedCustomers.push({
        id: customer?.id?.split("/")[4],
        Name:
          customer?.Name ||
          `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim(),
        Email: customer?.email || "",
        Phone: customer?.phone || "",
        SocialHandle: "",
        Custoemrfrom: "Shopify",
        emailMarketingConsent:   customer?.emailMarketingConsent?.marketingState || "UNSUBSCRIBED",
        TotalSpent: parseFloat(customer?.amountspend || "0"), //here an ohter amounspend is comming which is amountSpent so if any ting with with amount check here first
        TotalOrders: customer?.numberOfOrders || 0,
      });
    }

    return res.status(201).json({ data: mergedCustomers });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error", err: err.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.body;
    const deletedCustomer = await Customer.findByIdAndDelete(id);
    if (!deletedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//this api is for the mongodb custoemr update which is on the new request section it will take a whole update customer and find it by _id then update all the document
//check if

const Updatecusnewreq = async (req, res) => {
  const { customerId, fieldName, updatedValue } = req.body;

  const validFields = ["Name", "email", "Number", "socialhandel"];
  if (!validFields.includes(fieldName)) {
    return res.status(400).json({ message: "Invalid field" });
  }

  try {
    let shopifycustomerData = { customers: [] };
    let squery = [];
    let correctphone;
    if (fieldName === "email") {
      squery.push(`email:${updatedValue.trim()}`);
    } else if (fieldName === "Number") {
      correctphone = normalizePhoneNumber(updatedValue);

      squery.push(`phone:${correctphone}`);
    }

    const shopifyresult = await shopify.rest.Customer.search({
      session,
      query: squery.join(" "),
    });

    if (shopifyresult.customers.length > 0) {
      if (
        fieldName === "email" &&
        shopifyresult.customers[0].email &&
        shopifyresult.customers[0].email.trim() === updatedValue.trim()
      ) {
        return res.status(201).json({ alert: `gmail exists in shpopify` });
      } else if (
        fieldName === "Number" &&
        shopifyresult.customers[0].phone &&
        shopifyresult.customers[0].phone.trim() === correctphone.trim()
      ) {
        return res
          .status(201)
          .json({ alert: `phone number exists in shpopify` });
      }
    }

    // Check if updated value already exists (for unique fields)
    let condition = {};
    if (["email", "Number", "socialhandel"].includes(fieldName)) {
      condition[fieldName] = updatedValue;
      const existing = await Customer.findOne(condition);
      if (existing && existing._id.toString() !== customerId) {
        return res.status(409).json({ message: `${fieldName} already exists` });
      }
    }

    // Update only the field
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $set: { [fieldName]: updatedValue } },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Field updated", customer: updatedCustomer });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const update_Customer_Crm = async (req, res) => {
  const { Cust } = req.body;
 
  try {

    // if (Cust.Custoemrfrom=== "Mongodb") {
    //   const re=await Customer.findOneAndUpdate({_id:Cust.id},{$set:{
    //      Name:Cust.Name,
    //      Email:Cust.email,
    //      Number:Cust.Number,
    //      socialhandel:Cust.socialhandel,
    //   }})
 
    //   return res.status(201).json({msg:"mongodb custoemr updated sucessfully"})
    // }
    //  else {
    //   const re = await shopifycustomer(Cust);  
    // return res.status(201).json({msg:"shopify custoemr updated sucessfully"});
    // }

    await shopifycustomer(Cust)
    const c=await ShopifyCustomer.findOneAndUpdate({_id:Cust._id},{
      $set:{
         firstName:Cust.firstName,
         lastName:Cust.lastName,
         email:Cust.email,
         phone:Cust.phone
      }
    })
    
    res.status(201).json({msg:"shopify custoemr updated sucessfully"});

   
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getshopifyorders = async (req, res) => {
  const { userid } = req.body;
console.log(userid)
  try {
    // Get last createdAt from DB
    const latestOrder = await Orderreview.findOne({ userid })
      .sort({ shopifycreatedat: -1 })
      .lean();

      
    const createdAfter = latestOrder
      ? new Date(latestOrder.createdAt).toISOString()
      : '2025-02-22T00:00:00Z';
      

    const client = new shopify.clients.Graphql({ session });
    let query = buildOrderQuery(null, createdAfter);
    let totalorders = [];

    let result = await client.query({ data: query });
    let orders = result.body.data.orders.edges.map(edge => edge.node);
    totalorders.push(orders);

    let hasNextPage = result.body.data.orders.pageInfo.hasNextPage;
    let nextCursor = result.body.data.orders.pageInfo.endCursor;
    let i = 0;

    while (hasNextPage && i < 8) {
      i++;
      query = buildOrderQuery(nextCursor, createdAfter);
      result = await client.query({ data: query });

      orders = result.body.data.orders.edges.map(edge => edge.node);
      totalorders.push(orders);

      hasNextPage = result.body.data.orders.pageInfo.hasNextPage;
      nextCursor = result.body.data.orders.pageInfo.endCursor;
    }

    const shopifyOrders = totalorders.flat();
  //   console.log(shopifyOrders) 
    // Populate into DB
    const savePromises = shopifyOrders.map(async (order) => {
      const check=await Orderreview.find({name:order.name});
      if(check.length>0)
      {
        return ;
      }
      const lineItems = order.lineItems.edges.map((item) => ({
        title: item.node.title,
        quantity: item.node.quantity.toString(),
        costprice: parseFloat(
          item.node.discountedUnitPriceSet?.shopMoney?.amount ||
          item.node.originalUnitPriceSet?.shopMoney?.amount ||
          0
        ),
      }));

      // const metadata = order.metafields.edges.map((m) => ({
      //   name: m.node.namespace,
      //   value: parseFloat(m.node.value) || 0,
      // }));
      
      const shipfee = parseFloat(order.shippingLine?.originalPriceSet?.shopMoney?.amount || 0);
      const dbOrder = new Orderreview({
        soid: order.id,
        name: order.name,
        firstName: order.customer?.firstName || '',
        lastName: order.customer?.lastName || '',
        phone: order.customer?.phone || '',
        Revenue:order.totalPrice,
        shipingfee: shipfee,
        linedata: lineItems,
        shopifycreatedat:order.createdAt,
        userid,
      });
     return dbOrder.save();
    });

    await Promise.allSettled(savePromises);
    const sendingorders=await Orderreview.find({userid:userid})
      .populate("Supplier_Name")
    .sort({shopifycreatedat:-1});
    
    res.status(201).json({ data: sendingorders, count: shopifyOrders.length });
  } 
  catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


const updateshopifycustomer=async(req,res)=>{
 try {
    const {customer}=req.body;
    console.log(customer)
   
       // console.log(id)
    const response = await shopify.rest.Customer.find({
      session,
      id:customer.id , // numeric ID, not GID
    });

    response.first_name = customer.firstName;
    response.last_name = customer.lastName;
    response.phone = customer.phone;
    response.email = customer.email; // give the correct data which is in Custoemr and when addidn phone and email shopify can give error so handel it to notify the user
    const t = await response.save({ update: true });
    const re=await shopify.rest.Customer.find({
      session,
      id:customer.id , // numeric ID, not GID
    });
    const ur = {
      _id:customer.id, 
      first_name: re.first_name,
      last_name: re.last_name,
      Name: `${re.first_name} ${re.last_name}`,
      email: re.email,
      total_spent: re.total_spent,
      orders_count: re.orders_count.toString(),
      customerfrom: "shopify", // Assuming you’re marking the source
      Number: re.phone || null,
      address: {
        adress1: re.default_address?.address1 || "",
        city: re.default_address?.city || "",
        zip: re.default_address?.zip || "",
        country: re.default_address?.country || "",
      },
      // Optional field (uncomment if you have social handle)
      // socialhandel: updatedCustomer.socialhandel,
    };

    //console.log(response)
    res.status(201).json({data:ur})
  }
   catch (err) {
    const errors = err?.response?.body.errors;
    if (Object.values(errors)[0]?.[0]) {

      const re = Object.values(errors)[0]?.[0];
      if (errors?.phone) {
     
        res.status(501).json({data:d})

      } else if (errors?.email) {
        const d = "email " + re;
        res.status(501).json({data:d})
      }
    } else {
      const re = "something went wrong with shpoify update";

        res.status(501).json({data:d})
    }
  }
}


const createshopifycustoemr=async(req,res)=>{
try{
   const {data}=req.body;
   
    const client = new shopify.rest.Customer({ session });

    const response = await client.create({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          email_marketing_consent: {
            marketing_opt_in_level: 'SINGLE_OPT_IN',
            marketing_state: 'SUBSCRIBED',
            consent_updated_at: new Date().toISOString(),
          },
        });

}
  catch (err) {
    const errors = err?.response?.body.errors;
    if (Object.values(errors)[0]?.[0]) {

      const re = Object.values(errors)[0]?.[0];
      if (errors?.phone) {
        throw new Error(re);
      } else if (errors?.email) {
        const d = "email " + re;
        throw new Error(d);
      }
    } else {
      const re = "something went wrong with shpoify update";
      throw new Error(re);
    }
  }
}

//FUNCTIONS

const Get_mongo_byid = async (id) => {
  const d = await Customer.find({ _id: id });
  return d;
};


const get_shopify_byid = async (id) => {
  const d = await shopify.rest.Customer.search({ session, id: id });
  return d;
};




//Draf order here becasue our shopify session is here i should make it sepearte module in near future

async function draftorder(customerid, product, tags, shiping) {
  const draftOrder = new DraftOrder({ session });

  draftOrder.line_items = product;

  draftOrder.customer = customerid;

  draftOrder.use_customer_default_address = true;

  draftOrder.shipping_address = shiping;
  draftOrder.email=customerid.email
  console.log(draftOrder)

  const response = await draftOrder.save({
    update: true,
  });
   return draftOrder.id
};

//to get customers

function buildCustomerQuery(shopifyIds) {
  const queries = shopifyIds.map((id, i) => {
    return `
      customer${i}: customer(id: "gid://shopify/Customer/${id}") {
        id
        firstName
        lastName
        email
        phone
        createdAt
        numberOfOrders
        amountSpent {
          amount
          currencyCode
        }
        defaultAddress {
          address1
          city
          zip
        }
          emailMarketingConsent {
          consentUpdatedAt
          marketingOptInLevel
          marketingState
        }
      }
    `;
  });
  return `query { ${queries.join("\n")} }`;
};

const fetchShopifyCustomers = async (ids) => {
  const client = new shopify.clients.Graphql({ session });
  const query = buildCustomerQuery(ids);
  try {
    const result = await client.query({ data: query });

    // Flatten the results
    const customers = Object.values(result.body.data);
    return customers;
  } catch (err) {
    console.error("Error fetching Shopify customers:", err.message);
  }
};

const getcustoemrwithorders = async (shopifyMap) => {
  try {
    const ids = [];
    shopifyMap.forEach((b) => ids.push(b.shopifyId.split("/").pop()));
    const chunks = [];
    for (let i = 0; i < ids.length; i += 50) {
      chunks.push(ids.slice(i, i + 50));
    }
    // Fetch details per chunk
    const shopifycustomers = [];
    for (const chunk of chunks) {
      const fetches = await fetchShopifyCustomers(chunk);
      shopifycustomers.push(fetches);
    }
    const re = shopifycustomers.flat();

    re.map((e) => {
      e.numberOfOrders = shopifyMap.get(e.id.split("/")[4]).orderCount;
      e.Name =
        e.lastName != null ? e.firstName + " " + e.lastName : e.firstName;
      e.amountspend = shopifyMap.get(e.id.split("/")[4]).totalSpent;
    });

    return re;
  } catch (err) {
    console.error("Error fetching Shopify customers:", err.message);
  }
};

const shopifycustomer = async (Customer) => {
  try {
    const client = new shopify.rest.Customer({ session });
    const id=Customer.id;   
    const response = await shopify.rest.Customer.find({
      session,
      id: id,   // numeric ID, not GID
    });
    response.first_name = Customer.firstName;
    response.last_name = Customer.lastName;
    response.phone = Customer.phone;
    response.email = Customer.email; // give the correct data which is in Custoemr and when addidn phone and email shopify can give error so handel it to notify the user
    const t = await response.save({ update: true });
    return t;
  }
    catch (err) {
    const errors = err?.response?.body.errors;
    if (Object.values(errors)[0]?.[0]) {
    const re = Object.values(errors)[0]?.[0];
      if (errors?.phone) {
        throw new Error(re);
      } else if (errors?.email) {
        const d = "email " + re;
        throw new Error(d);
      }
    } else {
      const re = "something went wrong with shpoify update";
      throw new Error(re);
    }
  }
};

const getshopifybyid_store=async(id,userid)=>{

 const d = await shopify.rest.Customer.search({ session, id: id });

 const ch=await Customer.findOne({shopifid:d.customers[0].id});

 if(!ch){

 const iid=await Customer.create({
  shopifyid:d.customers[0]?.id,
  first_name:d.customers[0]?.first_name,
  last_name:d. customers[0].last_name,
  email:d.customers[0].email,
  orders_count:d.customers[0].orders_count,
  total_spent:d.customers[0].total_spent,
  Number:d.customers[0].phone,
  userid:userid,
  emailMarketingConsent:{
    consentUpdatedAt:d.customers[0].email_marketing_consent.consent_updated_at,
    marketingOptInLevel:d.customers[0].email_marketing_consent.opt_in_level,
    marketingState:d.customers[0].email_marketing_consent.state
  }
 })

 return iid._id;
}
 else{
 
  return ch._id
 }
}

function buildOrderQuery(afterCursor = null, createdAfter) {
  return {
    query: `
      {
        orders(first: 100, query: "created_at:>=${createdAfter}"${
      afterCursor ? `, after: "${afterCursor}"` : ""
    }) {
          edges {
            cursor
            node {
              id
              name
              createdAt
              totalPrice
              email
       lineItems(first: 10) {
                       edges {
                         node {
                           title
                           quantity
                           originalUnitPriceSet {
                             shopMoney {
                               amount
                               currencyCode
                             }
                           }
                           discountedUnitPriceSet {
                             shopMoney {
                               amount
                               currencyCode
                             }
                           }
                         }
                       }
        }
              
         shippingLine {
                      title
                      originalPriceSet  {
                        shopMoney {
                          amount
                          currencyCode
                        }
                      }
                    }
                   customer {
                     id
                     firstName
                     lastName
                     email
                     phone
                   }
                 }
          }
       pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
        }
        
      }
    `,
  };
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomers_from_shopify_mongo,
  Updatecusnewreq,
  Get_mongo_byid,
  get_shopify_byid,
  draftorder,
  getAllCustomerOrderStats,
  update_Customer_Crm,
  updateshopifycustomer,
  getshopifyorders,
createshopifycustoemr,
getshopifybyid_store,
UseShopiyfcustomer
};