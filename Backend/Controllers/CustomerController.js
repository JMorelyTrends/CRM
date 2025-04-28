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


const createCustomer = async (req, res) => {
  try {
    const { newCustomer } = req.body;

    const isValid = (field) => field && field.trim() !== "";

    
    if (!isValid(newCustomer.email) && !isValid(newCustomer.number) && !isValid(newCustomer.social)) {
        return res.status(400).json({ message: "At least one of email, number, or social handle is required." });
    }
    const normalizePhoneNumber = (phone) => {
      if (!phone) return "";
      phone = phone.trim();
      if (phone.startsWith("+44")) return phone;
      if (phone.startsWith("44")) return `+${phone}`;
      if (phone.startsWith("0")) return `+44${phone.slice(1)}`;
      return phone; 
  };
  
   
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
        return res.status(200).json({
            alert: "Exists in Shopify database",
            customer: customerData.customers[0]
        });
    }

  
    const searchConditions = [];
    if (isValid(newCustomer.email)) searchConditions.push({ email: newCustomer.email.trim() });
    if (isValid(newCustomer.number)) searchConditions.push({ Number: newCustomer.number.trim() });
    if (isValid(newCustomer.social)) searchConditions.push({ socialhandel: newCustomer.social.trim() });

    const existingCustomer = await Customer.findOne({ $or: searchConditions });

   
    if (existingCustomer) {
        return res.status(200).json({
          alert: "Exists in  database",
          customer: existingCustomer[0]
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

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    getCustomers_from_shopify_mongo
};
