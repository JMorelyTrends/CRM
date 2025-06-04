const crypto = require('crypto');
const getRawBody=require('raw-body')
function verifyShopifyWebhook(req, res, next){
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const body = getRawBody(req); // Must match exactly
  const hash = crypto
    .createHmac('sha256',process.env.SHOPIFY_HOOK )
    .update(body, 'utf8')
    .digest('base64');

 console.log(hmac)

 console.log(hash)
  if (hash === hmac) {
    next(); // Valid webhook
  } else {
    return res.status(401).send('Unauthorized');
  }
}
module.exports={
    verifyShopifyWebhook
}
