process.env.SHOPIFY_LOG = "error";
const Customer = require("../Models/Custormer");
const ShopifyCustomer=require("../Models/ShopifyCustomers")
const Order = require("../Models/Order");
const mongoose = require("mongoose");
const Orderreview=require("../Models/Orderreview")
require("@shopify/shopify-api/adapters/node");
const {session,shopify}=require("../utils/ShopifyConnect")
const opencage = require('opencage-api-client');

const normalizePhoneNumber = (phone) => {
  if (!phone) return "";
  phone = phone.trim();
  if (phone.startsWith("+44")) return phone;
  if (phone.startsWith("44")) return `+${phone}`;
  if (phone.startsWith("0")) return `+44${phone.slice(1)}`;
  return phone;
};
 const isValid = (field) => field && field.trim() !== "";


 //---------------------------------------------CUSTOMER CREATION---------------------------------------------
 
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
      const normalizedPhone = newCustomer.number;
      queryParts.push(`phone:${newCustomer.number}`);
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
        total_spend: customerData.customers[0].total_spent,
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
    if (isValid(newCustomer.email)||isValid(newCustomer.number)) {
    
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
      phone: newCustomer.number || '',
      tags: 'Crm Customer',
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
        // total_spend: createdShopifyCustomer.total_spent,
        // orders_count: createdShopifyCustomer.orders_count,
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
  
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




//-------------------------------------------CUSTOMER CRM---------------------------------------------- 
const getAllCustomers = async (req, res) => {
  try {
    const {userid}=req.body;
   
    const customers = await Customer.find({userid});
    
    // Calculate total count
    const totalCount = customers.length;
    
    // Calculate subscribed customers count
    const subscribedCount = customers.filter(customer => 
      customer.emailMarketingConsent?.marketingState === 'subscribed'
    ).length;
    
    // Calculate percentage (handle division by zero)
    const subscribedPercentage = totalCount > 0 
      ? ((subscribedCount / totalCount) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      Customers: customers,
      totalCustomers:totalCount,
      subscribedCount,
      optin: `${subscribedPercentage}`
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.body;
  
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


//---------------------------------------------SEARCH ENGINE FOR CUSTOMER ( NEW LEADS MAKING!)-----------------------
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


//-------------------------------------------UPDATES----------------------------------------

//this update is for wehre you need to keep the flow like leads or making new request

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
         total_spend: customerData.customers[0].total_spent,
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
          tags: 'Crm Customer',
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
      shopifyid:createdShopifyCustomer.id,
      total_spend: createdShopifyCustomer.total_spent || 0,
      orders_count: createdShopifyCustomer.orders_count || 0,
      email:Cust.email,
      Number:Cust.phone,
      socialhandel:Cust.social||"",
      emailMarketingConsent: {
        consentUpdatedAt: new Date(),
        marketingOptInLevel: 'SINGLE_OPT_IN',
        marketingState: 'unsubscribed'
      }
     }}, { new: true })
     
     if(orderid)
     {
    
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
s
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

//this update for the customercrm where the customers which have email or phone(need testing) in sync
//cuscrmupdate needs to be handel a case where if i send a customer where shopifyid is not there it should handle it 
const Cuscrmupdate = async (req, res) => {
  try{
    const {Cust}=req.body;
   
    const client = new shopify.clients.Rest({ session });

    if(Cust.id)
    {
      
         const response = await shopify.rest.Customer.find({
          session,
          id:Cust.id , // numeric ID, not GID
        });
    
        response.first_name = Cust.firstName;
        response.last_name = Cust.lastName;
        response.phone = Cust.phone;
        response.email = Cust.email; // give the correct data which is in Custoemr and when addidn phone and email shopify can give error so handel it to notify the user
        const t = await response.save({ update: true });

        const d=await Customer.findOneAndUpdate({_id:Cust._id},{$set:{
          first_name:Cust.firstName||"",
          last_name:Cust.lastName||"",
          email:isValid(Cust.email)&&Cust.email||"",
          Number:isValid(Cust.phone)&&Cust.phone||"",
          socialhandel:Cust.social||"",
        }})
        return res.status(201).json({message:"Customer is updated"})
    }
    else if(isValid(Cust.email)|| isValid(Cust.phone))
    {
      const createdShopifyCustomer = ( await client.post({
        path: 'customers',
        data: {
          customer: {
            email: Cust.email,
            first_name: Cust.firstName|| '',
            last_name:Cust.lastName||'',
            phone: Cust.phone || '',
            tags: 'Crm Customer',
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
        shopifyid:createdShopifyCustomer.id,
        email:Cust.email,
        Number:Cust.phone,
        socialhandel:Cust.social||"",
       
       }}, { new: true })
       
       return res.status(201).json({message:"Customer is updated"})
    }
    else if(Cust.social){
      const re=await Customer.findOneAndUpdate({_id:Cust._id},{$set:{
        first_name:Cust.firstName,
        last_name:Cust.lastName,
        socialhandel:Cust.social||"",
       
       }}, { new: true })
       return res.status(201).json({message:"Customer is updated"})
    }
  }
  catch (error) {
  
    const errors = error?.response?.body?.errors;
    if (errors?.phone) {
      return res.status(501).json({ data: "phone " + errors.phone[0] });
    } else if (errors?.email) {
      
      return res.status(501).json({ data: "email " + errors.email[0] });
    }

    return res.status(501).json({ data: "Something went wrong with Shopify update" });
  }
}


//when you are just updating the customer on shopify you dont get it for crm until now (shopifyupdatedprop)
const updateshopifycustomer=async(req,res)=>{
  try {
     const {customer}=req.body;
  
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
       customerfrom: "shopify", // Assuming you're marking the source
       Number: re.phone || null,
       address: {
         adress1: re.default_address?.address1 || "",
         city: re.default_address?.city || "",
         zip: re.default_address?.zip || "",
         country: re.default_address?.country || "",
       },
     };
 

     res.status(201).json({data:ur})
   }
    catch (err) {
   
     const errors = err?.response?.body.errors;
     if (Object.values(errors)[0]?.[0]) {
 
       const re = Object.values(errors)[0]?.[0];
       if (errors?.phone) {
         const d= re;
         res.status(501).json({data:d})
 
       } else if (errors?.email) {
         const d = "email " + re;
         res.status(501).json({data:d})
       }
       else if(errors?.sms_marketing_consent){
        res.status(501).json({data:re})
       }
     } else {
       const re = "something went wrong with shpoify update";
 
         res.status(501).json({data:d})
     }
   }
 }

//--------------------------------------UPDATES END-------------------------------------------------





//--------------------------------------------WHERE WHERE IT SAYS USE THIS CUSTOMER IN CRM THIS IS THE FUNCTION--------------------

const UseShopiyfcustomer=async(req,res)=>{  //when you entered the email to the  customer which dont have email hten this api hit when user press use
try{
  const {Cust,orderid}=req.body;



  //Step-1 check if that email have in our db or not if yes return that customer id
 
  
  const searchConditions = [];
  if (isValid(Cust.email)) {
    searchConditions.push({ email: Cust.email.trim() });
  }
  if (isValid(Cust.Number)) {
    const normalizedPhone = normalizePhoneNumber(Cust.Number);
    searchConditions.push({ Number: Cust.Number });
  }

  const t = searchConditions.length > 0 ? await Customer.findOne({ $or: searchConditions }) : null;
 
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
  const query = Cust._id?Cust._id:queryParts.join(" OR ");
  const E=Cust.email.trim();
  const d = await shopify.rest.Customer.search({ session, query });
  
  if(d && d.customers.length>0)
  {
    const iid=await Customer.findOneAndUpdate({
    _id:order.cusid
    },{
      $set:{
        shopifyid:d.customers[0]?.id,
        first_name:d.customers[0]?.first_name,
        last_name:d. customers[0].last_name,
        email:d.customers[0].email,
        orders_count:d.customers[0].orders_count,
        total_spend:d.customers[0].total_spent,
        // tshopifyspent:d.customers[0].total_spent, // just to know how much customer eran on shopify before we get it on crm to give initail tier
        Number:d.customers[0].phone,
        userid:order.userid,
        emailMarketingConsent:{
         consentUpdatedAt:d.customers[0]?.email_marketing_consent?.consent_updated_at||new Date(),
    marketingOptInLevel:d.customers[0]?.email_marketing_consent?.opt_in_level|| 'SINGLE_OPT_IN',
    marketingState:d.customers[0].email_marketing_consent?.state||'unsubscribed'
        }
      }
    })

    const nn=await Order.findByIdAndUpdate({
      _id:orderid
     },{
      $set:{
        cusid:iid._id,
        Name:d.customers[0]?.first_name+' '+d.customers[0].last_name
      }
     });
     return res.status(201).json({message:"order user updated"});
   
  }

  //STEP 3 if customer is not in shopoify and db create one
  
  
     
      

}
catch(err)
{
  console.log(err)
  res.status(500).json({message:"something worng with the customer"})
}
}

//--------------------------------------------IDK SEEMS IMPORTANT-------------------------------------------------------
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
  
  

    for (const customer of dbm) {
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



//--------------------------------get address which we need to create shipping address on order completion--------------//

// Address suggestions endpoint
const getaddress = async (req, res) => {
  try {
    const { searchText } = req.body;
    if (!searchText || searchText.trim().length < 2) {
      return res.status(400).json({ message: "Please provide at least 2 characters to search" });
    }
    const API_KEY = process.env.GEOAPIFY_API_KEY;
    if (!API_KEY) throw new Error('GEOAPIFY_API_KEY not configured');
    const apiUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(searchText)}&limit=8&apiKey=${API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API request failed');
    // Map Geoapify features to our suggestion format
    const suggestions = (data.features || []).map(f => ({
      address: f.properties.formatted,
      city: f.properties.city || f.properties.town || f.properties.village || '',
      country: f.properties.country || '',
      postcode: f.properties.postcode || '',
      // Optionally, you can add lat/lon if needed:
      // lat: f.properties.lat,
      // lon: f.properties.lon
    }));
    res.status(200).json({ success: true, suggestions });
  } catch (error) {
    console.error('Geoapify address lookup error:', error);
    res.status(500).json({ message: "Server error while getting address", error: error.message });
  }
}

// Address details endpoint
const getaddressdetails = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "Missing address id" });
    const API_KEY = process.env.GET_ADDRESS_API_KEY;
    if (!API_KEY) throw new Error('GET_ADDRESS_API_KEY not configured');
    const detailsUrl = `https://api.getaddress.io/get/${id}?api-key=${API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const details = await detailsResponse.json();
    if (!detailsResponse.ok) throw new Error(details.Message || 'API request failed');
    // Return full address details
    res.status(200).json({ success: true, details });
  } catch (error) {
    console.error('Address details lookup error:', error);
    res.status(500).json({ message: "Server error while getting address details", error: error.message });
  }
}

///--------------------------------end of this address api--------------------------------------------------//






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
            marketing_state: 'unsubscribed',
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

// async function draftorder(customerid, product, tags, shiping) {
 
//   const draftOrder = new DraftOrder({ session });

//   draftOrder.line_items = product;

//   draftOrder.customer = customerid;

//   draftOrder.use_customer_default_address = true;

//   draftOrder.shipping_address = shiping;
//   draftOrder.email=customerid.email

//   const response = await draftOrder.save({
//     update: true,
//   });
//    return draftOrder.id
// };

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

 const ch=await Customer.findOne({shopifyid:d.customers[0].id});
 
 if(!ch){

 const iid=await Customer.create({
  shopifyid:d.customers[0]?.id,
  first_name:d.customers[0]?.first_name,
  last_name:d. customers[0].last_name,
  email:d.customers[0].email,
  orders_count:d.customers[0].orders_count,
  total_spend:d.customers[0].total_spent||0,
  // tshopifyspent:d.customers[0].total_spent,
  Number:d.customers[0].phone,
  userid:userid,
  emailMarketingConsent:{
    consentUpdatedAt:d.customers[0]?.email_marketing_consent?.consent_updated_at||new Date(),
    marketingOptInLevel:d.customers[0]?.email_marketing_consent?.opt_in_level|| 'SINGLE_OPT_IN',
    marketingState:d.customers[0].email_marketing_consent?.state||'unsubscribed'
  }
 })
 return iid._id;
}
 else{
 
  return ch._id
 }
}


async function createShoOrder(customerid, product, tags, shipping, rev) {
  const client = new shopify.clients.Rest({ session });
  
  // product should now be array of { variant_id: number, quantity: number }
  const orderData = {
    order: {
      line_items: product,
      customer: {
        id: customerid
      },
      shipping_address: {
        first_name: shipping.first_name || '',
        last_name: shipping.last_name || '',
        address1: shipping.address1 || '',
        address2: shipping.address2 || '',
        city: shipping.city || '',
        province: shipping.province || '',
        country: shipping.country || '',
        zip: shipping.postcode || '',
       
      },
      financial_status: 'paid',
      tags: 'CRM order',
     
      transactions: [
        {
          kind: 'sale',
          status: 'success',
          amount: rev
        }
      ]
    }
  };

  try {
    const response = await client.post({
      path: 'orders',
      data: orderData,
      type: 'application/json'
    });
    return response.body.order.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

//--------------------------------------------PRODUCT MANAGEMENT FUNCTIONS---------------------------------------------

// Search for existing product in Shopify by name
const searchShopifyProduct = async (productName) => {
  try {
    const client = new shopify.clients.Rest({ session });
    const response = await client.get({
      path: 'products',
      query: { title: productName }
    });
    if (response.body.products && response.body.products.length > 0) {
      // Find the first product with the 'CRM Product' tag
      //we are doing this so can find the product which are only created by crm and that product will gonna be ammended 
      //Crm will not update and use the product which are creted organially and by sellers portal
      const crmProduct = response.body.products.find(product =>
        product.tags && product.tags.includes('CRM Product')
      );
    
      return crmProduct || null;
    }
    return null;
  } catch (error) {
    console.error('Error searching Shopify product:', error);
    return null;
  }
};

// Create new product in Shopify
const createShopifyProduct = async (productData) => {
  try {
    const client = new shopify.clients.Rest({ session });
    
    const productPayload = {
      product: {
        title: productData.title,
        body_html: productData.description || '',
        vendor: 'CRM',
        product_type: 'General',
        tags:  'CRM Product',
        status: 'draft', // <-- Add this line!
        variants: [
          {
            price: productData.price.toString(),
            sku: productData.sku || '',
            inventory_quantity: 999, // Set high inventory
            inventory_management: 'shopify',
            cost: productData.costPrice ? productData.costPrice.toString() : '0.00'
          }
        ],
        images: productData.image ? [
          {
            src: productData.image
          }
        ] : []
      }
    };

    const response = await client.post({
      path: 'products',
      data: productPayload,
      type: 'application/json'
    });

    return response.body.product;
  } catch (error) {
    console.error('Error creating Shopify product:', error);
    throw error;
  }
};

// Update existing product in Shopify
const updateShopifyProduct = async (productId, productData) => {
  try {
    const client = new shopify.clients.Rest({ session });
    
    // Update product basic info
    const productPayload = {
      product: {
        id: productId,
        title: productData.title,
        variants: [
          {
            id: productData.variantId,
            price: productData.price.toString(),
            sku: productData.sku || '',
            cost: productData.costPrice ? productData.costPrice.toString() : '0.00'
          }
        ]
      }
    };

    await client.put({
      path: `products/${productId}`,
      data: productPayload,
      type: 'application/json'
    });

    return { id: productId };
  } catch (error) {
    console.error('Error updating Shopify product:', error);
    throw error;
  }
};

// Main product management wrapper function
const manageShopifyProduct = async (productData) => {
  try {
    // Search for existing product
    const existingProduct = await searchShopifyProduct(productData.title);
    
    if (existingProduct)
       {
      // Product exists, update it
      const variantId = existingProduct.variants[0].id;
      const updatedProduct = await updateShopifyProduct(existingProduct.id, {
        ...productData,
        variantId: variantId
      });
      return {
        productId: existingProduct.id,
        variantId: variantId,
        isNew: false
      };
    } 
    else {
      // Product doesn't exist, create it
      const newProduct = await createShopifyProduct(productData);
      return {
        productId: newProduct.id,
        variantId: newProduct.variants[0].id,
        isNew: true
      };
    }
  } catch (error) {
    console.error('Error managing Shopify product:', error);
    throw error;
  }
};

//--------------------------------------------PRODUCT MANAGEMENT END---------------------------------------------

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
  // draftorder,
  createShoOrder,
  getAllCustomerOrderStats,
  update_Customer_Crm,
  updateshopifycustomer,
  createshopifycustoemr,
  getshopifybyid_store,
  UseShopiyfcustomer,
  Cuscrmupdate,
  // Product management functions
  searchShopifyProduct,
  createShopifyProduct,
  updateShopifyProduct,
  manageShopifyProduct,
  getaddress,
  getaddressdetails,
};