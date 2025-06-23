const crypto = require('crypto');

function verifyShopifyWebhook(req, res, next){
  // Check if webhook secret exists
  if (!process.env.SHOPIFY_WEBHOOK_SECRET) {
    console.error('SHOPIFY_WEBHOOK_SECRET is not set in environment variables');
    return res.status(500).send('Webhook secret not configured');
  }

  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const body = req.body; // Now this will be the raw body

  // Check if body exists
  if (!body) {
    console.error('No body received in webhook');
    return res.status(400).send('No body received');
  }

  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('base64');



  if (hash === hmac) {
    next(); // Valid webhook
  } else {
    console.error('HMAC verification failed');
    return res.status(401).send('Unauthorized');
  }
}

module.exports = {
  verifyShopifyWebhook
};
