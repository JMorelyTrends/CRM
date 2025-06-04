const ShopifyCustomer=require("../Models/ShopifyCustomers")

exports.handelcustomers=async(req,res)=>{
 const eventType = req.get('X-Shopify-Topic'); // customers/create, update, delete
  const customer = req.body;

  try {
    switch (eventType) {
      case 'customers/create':
        console.log("working hook for crate");
        break;
      case 'customers/update':
       console.log("working hook for update");
        break;
      case 'customers/delete':
        console.log("working ");
        break;
    }

    res.status(200).send('Webhook received');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Internal Server Error');
  }
};
