process.env.SHOPIFY_LOG = 'error';
const Customer = require("../Models/Custormer");
require ("@shopify/shopify-api/adapters/node")
const { shopifyApi, ApiVersion, Session } = require("@shopify/shopify-api");
const { restResources } = require("@shopify/shopify-api/rest/admin/2025-04");



  
const customLogger = {
  log: (severity, message) => {
    if (severity === 'error') {
      //console.error(`[${severity}] ${message}`);
    }
  },
};

const shopify = shopifyApi({
  apiKey:process.env.SHOPIFY_API_KEY,
  apiSecretKey:process.env.SHOPIFY_API_SECRET,
  apiVersion: ApiVersion.April25,
  isCustomStoreApp: true,
  adminApiAccessToken: process.env.SHOPIFY_ACCESS_TOKEN,
  isEmbeddedApp: false,
  hostName: process.env.SHOPIFY_STORE_DOMAIN,
  scopes: ["read_customers"],
  logger: customLogger,
  restResources,
});

const session = shopify.session.customAppSession(process.env.SHOPIFY_STORE_DOMAIN);

  const normalizePhoneNumber = (phone) => {
      if (!phone) return "";
      phone = phone.trim();
      if (phone.startsWith("+44")) return phone;
      if (phone.startsWith("44")) return `+${phone}`;
      if (phone.startsWith("0")) return `+44${phone.slice(1)}`;
      return phone; 
  };
const createCustomer = async (req, res) => {
  try {
    const { newCustomer } = req.body;

    const isValid = (field) => field && field.trim() !== "";

    
    if (!isValid(newCustomer.email) && !isValid(newCustomer.number) && !isValid(newCustomer.social)) {
        return res.status(400).json({ message: "At least one of email, number, or social handle is required." });
    }
  
  
   
    let queryParts = [];
    if (isValid(newCustomer.email)) queryParts.push(`email:${newCustomer.email.trim()}`);
    if (isValid(newCustomer.number)) {
      const normalizedPhone = normalizePhoneNumber(newCustomer.number);
      queryParts.push(`phone:${normalizedPhone}`);
  }
    const query = queryParts.join(' OR ');

    let customerData = { customers: [] };
    if (queryParts.length > 0) {
        customerData = await shopify.rest.Customer.search({
            session,
            query,
        });
    }
   

    if (customerData.customers.length > 0) {
     const newCustomer={
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
      }
    }
        return res.status(200).json({
            alert: "Exists in Shopify database",
            customer: newCustomer
        });
    }

  
    const searchConditions = [];
    if (isValid(newCustomer.email)) searchConditions.push({ email: newCustomer.email.trim() });
    if (isValid(newCustomer.number)) searchConditions.push({ Number: newCustomer.number.trim() });
    if (isValid(newCustomer.social)) searchConditions.push({ socialhandel: newCustomer.social.trim() });

    const existingCustomer = await Customer.findOne({ $or: searchConditions });

   
    if (existingCustomer) {
        return res.status(200).json({
          alert: "Exists in database",
          customer: existingCustomer
      });
    }

    
    const createdCustomer = await Customer.create({
        Name: isValid(newCustomer.name) ? newCustomer.name.trim() : "",
        email: isValid(newCustomer.email) ? newCustomer.email.trim() : "",
        Number: isValid(newCustomer.number) ? newCustomer.number.trim() : "",
        address: isValid(newCustomer.address) ? newCustomer.address.trim() : "",
        City: isValid(newCustomer.city) ? newCustomer.city.trim() : "",
        Postcode: isValid(newCustomer.postcode) ? newCustomer.postcode.trim() : "",
        userid: newCustomer.userid,
        socialhandel: isValid(newCustomer.social) ? newCustomer.social.trim() : "",
    });

    res.status(201).json({ message: "Customer created successfully.", customer: createdCustomer });

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
      
        const {id}=req.body;
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
        { email: { $regex: new RegExp(`^${search}$`, 'i') } }
      ]
    };
  } 
  else if (isPhone || search.startsWith('+')) {
    // Search by Phone
 
    const sanitizedPhone = search.trim().replace(/\s+/g, ''); // remove extra spaces
    query = `phone:${sanitizedPhone}`;
    const mp=sanitizedPhone.replace("+","")
    mongoQuery = {
      $and: [
        { userid: id },
        { Number: { $regex: new RegExp(mp, 'i') } }
      ]
    };
  }
  else {
   
    // Search by Name
    const nameParts = search.trim().split(/\s+/);

    if (nameParts.length === 2) {
      query = `name:${search.trim()}`;
    } else if (nameParts.length === 1) {
      query = `first_name:${nameParts[0]}`;
    } else {
      return res.status(400).json({ message: "Invalid name format" });
    }

    const regexConditions = nameParts.map(part => ({
      Name: { $regex: new RegExp(part, 'i') }
    }));

    mongoQuery = {
      $and: [
        { userid: id },
        {
          $or: [
            ...regexConditions,
            { socialhandel: { $regex: new RegExp(search, 'i') } },
            { Number: { $regex: new RegExp(search, 'i') } }
          ]
        }
      ]
    };
  }

  try {
    const [mongodata, customerData] = await Promise.all([
      Customer.find(mongoQuery),
      shopify.rest.Customer.search({ session, query }),
    ]);

    const d = customerData.customers.map(customer => ({
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
      }
    }));

    res.status(200).json({ d, dm: mongodata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Shopify customer search failed", error });
  }
};

const updateCustomer = async (req, res) => {
    try {
        const { Name, email, address, Postcode,id } = req.body;

        // Find and update
        const updatedCustomer = await Customer.findByIdAndUpdate(
            id,
            { Name, email, address, Postcode },
            { new: true, runValidators: true }
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.status(200).json({ message: "Customer updated successfully", customer: updatedCustomer });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const deleteCustomer = async (req, res) => {
    try {
        const {id}=req.body;
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
const Updatecusnewreq=async(req,res)=>{
 const { customerId, fieldName, updatedValue } = req.body;

 const validFields = ['Name', 'email', 'Number', 'socialhandel'];
 if (!validFields.includes(fieldName)) {
   return res.status(400).json({ message: "Invalid field" });
 }

 try {

  let shopifycustomerData = { customers: [] };
  let squery=[];
  let correctphone
  if(fieldName==='email')
  {
    squery.push(`email:${updatedValue.trim()}`)
  }
  else if(fieldName==='Number')
  {
 
     correctphone=normalizePhoneNumber(updatedValue);
  
     squery.push(`phone:${correctphone}`)
    
  }
 
 const shopifyresult = await shopify.rest.Customer.search({
    session,
    query: squery.join(' '),
});

if(shopifyresult.customers.length > 0)
{
    

  if(fieldName==='email'  && shopifyresult.customers[0].email && shopifyresult.customers[0].email.trim()===updatedValue.trim())
  {
    return res.status(201).json({alert:`gmail exists in shpopify`})
  }
  else if(fieldName==='Number'  && shopifyresult.customers[0].phone && shopifyresult.customers[0].phone.trim()===correctphone.trim())
  {

    return res.status(201).json({alert:`phone number exists in shpopify`})
  }
}



   // Check if updated value already exists (for unique fields)
   let condition = {};
   if (['email', 'Number', 'socialhandel'].includes(fieldName)) {
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

   res.status(200).json({ message: "Field updated", customer: updatedCustomer });
 } catch (error) {
   res.status(500).json({ message: "Server error", error: error.message });
 }

}

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    getCustomers_from_shopify_mongo,
    Updatecusnewreq
};
