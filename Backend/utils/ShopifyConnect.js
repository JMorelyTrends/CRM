const { shopifyApi, ApiVersion, Session } =require("@shopify/shopify-api");
const { restResources } = require("@shopify/shopify-api/rest/admin/2025-04");
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

  module.exports = { shopify, session, DraftOrder, custs };