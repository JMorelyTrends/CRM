const Orderreview=require("../Models/Orderreview")
const {session,shopify}=require("../utils/ShopifyConnect")

const updateorders=async(req,res)=>{
    
    const{payload}=req.body;
    try{
      console.log(payload)
     
    const shippingfee=parseFloat(payload.shipingfee)||0
    const processingfee=parseFloat(payload.processingfee)||0

     const profit=payload.Revenue- payload.AcutalCog-shippingfee-processingfee;
     const url = 'https://api.triplewhale.com/api/v2/data-in/orders-enrichment';
     const k=payload?.soid.split('/')[4]
     const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-api-key': '23aff3aa-c7e8-4e4f-b79f-1dc681b2c7b6'
        },
        body: JSON.stringify({
          custom_expenses: payload.AcutalCog,             //cogs
          custom_number: processingfee,            //processing fee
          order_id: k,
          shipping_costs: shippingfee,
          shop: process.env.SHOPIFY_STORE_DOMAIN,
        })
    };

    await  fetch(url, options)
        // .then(res => res.json())
        // .then(json => console.dir(json, { depth: null, colors: true }))
        // .catch(err => console.error(err));

 
     const order=await     Orderreview.findOneAndUpdate({_id:payload._id},{$set:{
      shipingfee:shippingfee,
      processingfee:processingfee,
      linedata:payload.linedata,
      Traffic_Source:payload.Traffic_Source,
      Source_of_truth:payload.Source_of_truth,
      Supplier_Name:payload.Supplier_Name,
      profit
     }})
  
     res.status(201).json({data:order})

    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({message:"error updating Review Orders"})
    }
}
const getshopifyorders = async (req, res) => {
    const { userid } = req.body;
  
    try {
      // Get last createdAt from DB
      const latestOrder = await Orderreview.findOne({ userid })
        .sort({ shopifycreatedat: -1 })
        .lean();
  
       
      const createdAfter = latestOrder
        ? new Date(new Date(latestOrder.shopifycreatedat).getTime() - 60000).toISOString()
        : '2025-06-22T00:00:00Z';
      
   //console.log(createdAfter)
      const client = new shopify.clients.Graphql({ session });
      let query = buildOrderQuery(null, createdAfter);
     
      let totalorders = [];
  
      let result = await client.query({ data: query });
      let orders = result.body.data.orders.edges.map(edge => edge.node);
     // console.dir(orders,{depth:null})
      // Filter out orders with CRM order tag
      orders = orders.filter(order => !order.tags.includes('CRM order'));
      totalorders.push(orders);
  
      let hasNextPage = result.body.data.orders.pageInfo.hasNextPage;
      let nextCursor = result.body.data.orders.pageInfo.endCursor;
      let i = 0;
  
      while (hasNextPage && i < 8) {
        i++;
        query = buildOrderQuery(nextCursor, createdAfter);
        result = await client.query({ data: query });
  
        orders = result.body.data.orders.edges.map(edge => edge.node);
        // Filter out orders with CRM order tag
        orders = orders.filter(order => !order.tags.includes('CRM order'));
        totalorders.push(orders);
  
        hasNextPage = result.body.data.orders.pageInfo.hasNextPage;
        nextCursor = result.body.data.orders.pageInfo.endCursor;
      }
       
      const shopifyOrders = totalorders.flat();
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
            item.node.variant?.inventoryItem?.unitCost?.amount ||0
          ),
        }));
        
        const shipfee = parseFloat(order.shippingLine?.originalPriceSet?.shopMoney?.amount || 0);
        const dbOrder = new Orderreview({
          soid: order.id,
          name: order.name,
          firstName: order.customer?.firstName || '',
          lastName: order.customer?.lastName || '',
          phone: order.customer?.phone || '',
          Revenue: order.totalPrice,
          shipingfee: shipfee,
          linedata: lineItems,
          shopifycreatedat: order.createdAt,
          customer: order.customer,
          subtotal: parseFloat(order.currentSubtotalPriceSet?.shopMoney?.amount || order.subtotalPrice || 0),
          discount: parseFloat(order.currentTotalDiscountsSet?.shopMoney?.amount || order.totalDiscounts || 0),
          taxes: parseFloat(order.currentTotalTaxSet?.shopMoney?.amount || order.totalTax || 0),
          userid,
          status:"active",
          statusupdate:new Date(),
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



//---------------------------------------helper functions-------------------------------
  function buildOrderQuery(afterCursor = null, createdAfter) {
    return {
      query: `{
          orders(first: 100, query: "created_at:>=${createdAfter}"${afterCursor ? `, after: "${afterCursor}"` : ""}) {
            edges {
              cursor
              node {
                id
                name
                createdAt
                totalPrice
                email
                tags
                currentSubtotalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                currentTotalDiscountsSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                currentTotalTaxSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                lineItems(first: 10) {
                  edges {
                    node {
                      id
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
                      variant {
                        inventoryItem {
                          unitCost {
                            amount
                            currencyCode
                          }
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
  
module.exports={
updateorders,
getshopifyorders
}