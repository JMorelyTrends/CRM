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
  hostName: process.env.hostName,
  scopes: ["read_customers"],
  logger: customLogger,
  restResources,
});

const session = shopify.session.customAppSession(process.env.SHOPIFY_STORE_DOMAIN);





const createCustomer = async (req, res) => {
    try {
        // Destructure & validate input
        const {newCustomer } = req.body;
       
        query = `email:${newCustomer.email.trim()}`;
        const customerData = await shopify.rest.Customer.search({
          session,
          query,
        });
        //console.log(newCustomer)
        if(customerData.customers.length>0 && customerData.customers[0].email===newCustomer.email){
      
         return res.status(201).json({alert:`Exits in the shopify search from this = ${customerData.email}`,
                                      message:customerData.customers[0].email});
        }
       
        const ncustomer=await Customer.create({
          Name: newCustomer.name,
          email:newCustomer.email,
          Number:newCustomer.number,
          address:newCustomer.address,
          City:newCustomer.city,
          Postcode:newCustomer.postcode,
          userid:newCustomer.userid,
        }
        );
    
        res.status(201).json({message:ncustomer});
    } catch (error) {
      //console.log(error)
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
    const { search,id } = req.body;
   
    let query = "";
    let mongodata=null;
    if (search.includes("@")) {
      query = `email:${search.trim()}`;
    mongodata= await  Customer.find({
      email:{ $regex: new RegExp(`^${search}$`, 'i') }
      })
      //console.log("Searching by email...");
    } else {
      mongodata= await  Customer.find({
        Name:{ $regex: new RegExp(`^${search}$`, 'i') },
        userid:id
        })
        //console.log("get the sarah from the mongodb",mongodata)
      const nameParts = search.trim().split(/\s+/);
      if (nameParts.length === 2) {
        const [firstName, lastName] = nameParts;
        query = `name:${search}`;
        //console.log("Searching by full name:", firstName, lastName);
      } else if (nameParts.length === 1) {
        query = `first_name:${nameParts[0]}`;
        //console.log("Searching by single name:", nameParts[0]);
      } else {
        return res.status(400).json({ message: "Invalid search query" });
      }
    }

    try {
      const customerData = await shopify.rest.Customer.search({
        session,
        query,
      });     
    const d =  customerData.customers.map((customer) => ({
        _id:customer.id,
        email:customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        total_spent: customer.total_spent,
        orders_count: customer.orders_count,
        customerfrom:"shopify",
        address: {
          address1: customer.default_address?.address1 || "",
          city: customer.default_address?.city || "",
          zip: customer.default_address?.zip || "",
        }
      }));
     
       const dm=mongodata.map((customer,index)=>({
        _id:customer._id,
         Name:customer.Name,
         email:customer.email,
        // orders_count: customer.orders_count,   for next part
        customerfrom:"mongodb",
        address: {
          address1: customer.address || "",
          city: customer?.City || "",
          zip: customer?.Postcode || "",
        }
      }));
      
      res.status(200).json({ d,dm });
    } catch (error) {
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
