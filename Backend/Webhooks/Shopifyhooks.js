const ShopifyHookService=require("../Services/hookservices/ShopifyHookService")
exports.handelhook=async(req,res)=>{
 const eventType = req.get('X-Shopify-Topic'); // customers/create, update, delete
  
  // Parse the Buffer body as JSON
  let data;
  try {
    data = JSON.parse(req.body.toString());
  }
   catch (error) {
    console.error('Error parsing webhook body:', error);
    return res.status(400).send('Invalid JSON body');
  }

  try {
    await ShopifyHookService.processEvent(eventType,data)
    res.status(200).send('Webhook received');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Internal Server Error');
  }
};
