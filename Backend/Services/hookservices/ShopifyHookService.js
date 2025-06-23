const Order=require("../../Models/Order")
const Customer=require("../../Models/Custormer")
const {session,shopify}=require("../../utils/ShopifyConnect")
const Orderreview = require("../../Models/Orderreview");

class ShopifyHookService{
    static async processEvent(eventType,data)
    {
    
        switch (eventType) {
            
            case 'orders/create':
              this.handleOrderCreate(data)
              break;
            case 'orders/delete':
              this.handleOrderDelete(data)
              break;
            case 'customers/update':
              this.handelcustomerupdate(data)
              break;
            case 'refunds/create':
              this.handleOrderRefund(data)
              break;
          }
    }

    static async handleOrderCreate(orderData) 
    {
        //------problem here to fix later down the line ---------//


        // Manually entring the user id need to find a way to get the user id based on the shopify webhook session


        //-----------------------------------------------------//
        //Step 1 check if that order was in the our db
        const d=await Order.findOne({shopifyorderid:orderData.id});
        //Step 2 check if that customer was in the db
        if(!d)
        {
            const cu=await Customer.findOne({shopifyid:orderData.customer.id});
            if(cu)
            {
                const o = cu.orders_count + 1;
                const tsp = (Number(cu.total_spend) + Number(orderData.total_price)).toString();
                const u=await Customer.findOneAndUpdate({shopifyid:orderData.customer.id},{
                    $set:{
                        total_spend: tsp,
                        orders_count: o,
                    }
                })

            }
        }
        // here add the order in the orderreview.js
        const check = await Orderreview.findOne({ soid: orderData.id });
      
        if (!check&&!d) {
            // Prepare line items if available
            let lineItems = [];
            if (orderData.line_items && Array.isArray(orderData.line_items)) {
                lineItems = orderData.line_items.map(item => ({
                    title: item.title,
                    quantity: item.quantity ? item.quantity.toString() : '',
                    costprice: parseFloat(item.price || 0),
                }));
            }
            const shipfee = parseFloat(orderData.shipping_lines && orderData.shipping_lines[0] && orderData.shipping_lines[0].price || 0);
            const dbOrder = new Orderreview({
                soid: orderData.id,
                name: orderData.name || '',
                firstName: orderData.customer?.first_name || '',
                lastName: orderData.customer?.last_name || '',
                phone: orderData.customer?.phone || '',
                Revenue: parseFloat(orderData.total_price || 0),
                shipingfee: shipfee,
                linedata: lineItems,
                shopifycreatedat: orderData.created_at || new Date(),
                customer: orderData.customer || {},
                subtotal: parseFloat(orderData.subtotal_price || 0),
                discount: parseFloat(orderData.total_discounts || 0),
                taxes: parseFloat(orderData.total_tax || 0),
                 userid:"67ff6cce4d7efdc31823ea16",
                 status:"active",
                 statusupdate:new Date(),  
            });
            await dbOrder.save();
        }
    } 

    static async handleOrderDelete(orderData) 
    {
    
         // here two rules will apply
        //  1  Refund to delete
       //   2 active to delete
        
        
      // Step 1: check if that order was in our db
      
        const [d, k] = await Promise.all([
            Orderreview.findOne({ soid: orderData.id }),
            Order.findOne({ shopifyorderid: orderData.id }).populate("cusid")
        ]);
        const status = (d && d.status) || (k && k.status) || null;

        //--------------------------1 Refund to delete( which will just )----------------------------------//
        if(status=="Refunded")
        {
            if(d&&!k)
            {
                
              return  await Orderreview.deleteOne({ soid: orderData.id });

            }
            else if (!d && k)
            {
                return  await Order.findOneAndUpdate({_id:k._id},{
                    $set:{
                        status:"deleted",
                        statusupdate:new Date()
                    }
                })
            }
            //here we nee dot see if we want to delete the order which are created on crm
        }
         

        //--------------------------2 active to delelte( which will reduce the numbers and order count)----------------------------------//
        
        else if(status=="active"){
        // Step 2: check if that customer was in the order review db
        if (d) {
           
            const cu = await Customer.findOne({ shopifyid: d.customer.id });
           
       //Step 3: check if the customer is in our customer db or not
            if (cu) {
                const o = Math.max(0, cu.orders_count - 1);
                const tsp = Math.max(0, cu.total_spend - d.Revenue);
                await Customer.findOneAndUpdate({ _id:cu._id}, {
                    $set: {
                        total_spend: tsp,
                        orders_count: o,
                       
                    }
                });

            }

            //Step 4 delete the order from orderreview
            await Orderreview.deleteOne({ soid: orderData.id });
        }
        else if(k)
        {
            const cu=k.cusid
            if (cu) {
                const o = Math.max(0, cu.orders_count - 1);
                const tsp = Math.max(0, cu.total_spend - k.sellprice);
                await Customer.findOneAndUpdate({ _id:cu._id}, {
                    $set: {
                        total_spend: tsp,
                        orders_count: o,
                       
                       
                    }
                });
                await Order.findOneAndUpdate({_id:k._id},{
                    $set:{
                        status:"deleted",
                        statusupdate:new Date()
                    }
                })

            }
        }
        }
    }

    static async handelcustomerupdate(orderData)
    {
        //console.log("customer get updated",orderData)
     
    //   const cu=await Customer.findOne({shopifyid:orderData.id});
    //   if(cu)
    //   {
    //     const query=`id:${orderData.id}`
    //     const k=await shopify.rest.Customer.search({ session, query })
      
    //     const ts=k.customers.total_spent;
    //     const toc=k.customers.orders_count;
    //     const u=await Customer.findOneAndUpdate({_id:cu._id},{
    //         $set:{
    //             total_spend:ts,
    //             orders_count:toc
    //         }
    //     },{new:true})
      
    //   }
    }

    static async handleOrderRefund(orderData) 
    {
         console.log("refund data :",orderData)
        const [d, k] = await Promise.all([
            Orderreview.findOne({ soid: orderData.order_id }),
            Order.findOne({ shopifyorderid: orderData.order_id }).populate("cusid")
        ]);
        console.log("Review",d)
        console.log("orders =",k)
        const status = (d && d.status) || (k && k.status) || null;
        console.log("Status",status)
        if(status !=="active"){
         return
        }
        const totalRefunded = (orderData.transactions || [])
        .filter(tx => tx.kind === 'refund' && tx.status === 'success')
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
      
        if(d)
        { 
            
      
            const cu = await Customer.findOne({ shopifyid: d.customer.id });
            console.log("actual customer ",cu) 
           //Step 3: check if the customer is in our customer db or not

            if (cu) {
                const o = Math.max(0, cu.orders_count - 1);
                const tsp = Math.max(0, cu.total_spend - totalRefunded);
                await Customer.findOneAndUpdate({ _id:cu._id}, {
                    $set: {
                        total_spend: tsp,
                        orders_count: o,
                       
                        statusupdate:new Date()
                    }
                },{new:true});

                await Orderreview.findOneAndUpdate({_id:d._id},{
                    $set:{
                        status:"Refunded",
                        statusupdate:new Date()
                    }
                })
            }
        }
        else if(k)
            {
                console.log("order review ",d)
                const cu=k.cusid
                console.log("actual customer ",cu) 
                if (cu) {
                    const o = Math.max(0, cu.orders_count - 1);
                    const tsp = Math.max(0, cu.total_spend - totalRefunded);
                    await Customer.findOneAndUpdate({ _id:cu._id}, {
                        $set: {
                            total_spend: tsp,
                            orders_count: o,
                           
                        statusupdate:new Date()
                        }
                    },{new:true});
                    
                    await Order.findOneAndUpdate({_id:k._id},{
                        $set:{
                            status:"Refunded",
                            statusupdate:new Date()
                        }
                    })
    
                }
            }
    }
}
module.exports=ShopifyHookService

//Rules to avoid race conditions
// status in db          || status from shopify             || what goona happen
//   acitve                  Refund                            update status , reduce price and order count
//   active                  Delete                             update status , reduce price and order count 
//   Refund                  delete                              update status , delete order