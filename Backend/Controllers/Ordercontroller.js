const Order = require("../Models/Order");
const Customer = require("../Models/Custormer");
const Supplier=require("../Models/Supplier")
const mongoose = require("mongoose");
const {get_shopify_byid,Get_mongo_byid,createShoOrder,getshopifybyid_store,manageShopifyProduct}=require("./CustomerController");

exports.createOrder = async (req, res) => {
  try {
    const {newOrder} = req.body;

    let or=null;
    let id;
    if(newOrder.clientFrom=='shopify')
    {
      id=await getshopifybyid_store(newOrder.customerid,newOrder.userid);
    }
    
    if(newOrder.Stockxid){
    or=await Order.create({
        Name: newOrder.Name,
        stockxitem:newOrder.Stockxid,
        cusid:newOrder.clientFrom=='mongodb'?newOrder.customerid:newOrder.clientFrom=="shopify"?id:null, //if we select from shopify it gives 
        size:newOrder.size,
        condition:newOrder.Condition,
        userid:newOrder.userid   
     });
     
    
    }
      else{
        or=await Order.create({
          Name: newOrder.Name,
          items:newOrder.items,
         
          cusid:newOrder.clientFrom=='mongodb'?newOrder.customerid:newOrder.clientFrom=="shopify"?id:null,
          size:newOrder.size,
          condition:newOrder.Condition,
          userid:newOrder.userid   
       })
      }
     
     //add here for the customers comming form the mongodb

   return  res.status(201).json({message:"order created sucessfully", data:or});
 
   
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const {id}=req.body;
  
    const orders = await Order.find({userid:id}).populate("items").populate("stockxitem").populate("labels").populate("items").populate("Supplierid").populate('cusid').populate("DealOwnerid").sort({createdAt:-1});
   
    const columnOrder = [
      "New Lead",
      "Need To Source",
      "Offered",
      "Warm Lead",
      "Won",
      "Lost",
    ];
    const tasks={};
    const columns={}
    let tcounter=1;
 
    columnOrder.forEach(col => {
      columns[col]={
        id:col,
        title:col,
        taskIds:[]
      }
    });


    for (const data of orders){
      let h;
      let phone;
      let email;
      if(!data.cusid)
      {
        //shopify customer
        h=await get_shopify_byid(data.shopifycustomerid)
       
        phone=h.customers[0].phone!=null?h.customers[0].phone:null
        email=h.customers[0].email!=h.customers[0].email!=null?h.customers[0].email:null
        //add address here if needed
      
      }
      else{
        h= await Get_mongo_byid(data.cusid)
      
        phone=h[0].Number!=''?h[0].Number:null
        email=h[0].email!=''?h[0].email:null
         
      }
      const counter=tcounter++;
      tasks[counter]={
        id:counter,
        _id:data._id,
        Name:data.Name,
        stockxitem:data.stockxitem,
        shopifycustomerid:data.shopifycustomerid,
        cusid:data.cusid,
        size:data.size,
        condition:data.condition,
        stage:data.stage,
        createdAt:data.createdAt,
        updatedAt:data.updatedAt,
        labels:data.labels,
        Description:data.Description,
        items:data.items,
        phone:phone,
        email:email
        
      }
      //optional variables if they exists they added basically for those which are submitted
// Add optional fields if they exist and are not null
if (data.Orderrecived != null)  tasks[counter].Orderrecived = data.Orderrecived;
if (data.ordersend != null)  tasks[counter].ordersend = data.ordersend;
if (data.Supplierid != null)  tasks[counter].Supplierid = data.Supplierid;
if (data.userid != null)  tasks[counter].userid = data.userid;
if (data.price != null)  tasks[counter].price = data.price;
if(data.sellprice!=null) tasks[counter].sellprice=data.sellprice;
if (data.Shippingfee != null)  tasks[counter].Shippingfee = data.Shippingfee;
if (data.processingfee != null)  tasks[counter].processingfee = data.processingfee;
if (data.shippingaddress != null)  tasks[counter].shippingaddress = data.shippingaddress;
if (data.Sourceofthruth != null)  tasks[counter].Sourceofthruth = data.Sourceofthruth;
if (data.paymentmethod != null)  tasks[counter].paymentmethod = data.paymentmethod;
if (data.DealOwner != null)  tasks[counter].DealOwner = data.DealOwner;
if (data.DealOwnerid != null)  tasks[counter].DealOwnerid = data.DealOwnerid;
if (data.confirm != null)  tasks[counter].confirm = data.confirm;
if (data.stageUpdatedAt != null)  tasks[counter].stageUpdatedAt = data.stageUpdatedAt;    
      const stage=data.stage || "NewLead";
      if(columns[stage])
      {
        columns[stage].taskIds.push(counter)
      }

    }

 
    const maporderdata={
      tasks,
      columns,
      columnOrder
    }


    res.status(200).json(maporderdata);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};

exports.getnumberofleads=async(req,res)=>{
try{
    const n=await Order.countDocuments({stage:{ $nin: ['Lost' , 'Won']  }});
   
  
    res.status(201).json({data:n})
}
catch(err)
{
  res.json(500).json({message:"error in getting the numbers of leads"})
}
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderofCustomer=async(req,res)=>{
  try{
    const {id}=req.body;
    
   if(id){
    const n=await Order.find({cusid:id,stage:"Won"}).populate("items").populate("stockxitem").populate("labels");
    let price=0;
    n.map((d)=>{
      price+=d.sellprice
    })

    return res.status(201).json({data:n,p:price})}
    res.status(201).json({message:"no orders"})
  
}
catch(err)
{
  
  res.status(500).json({message:"error in getting the numbers of leads"})
}
}
exports.getLostOrderofCustomer=async(req,res)=>{
  try{
    const {id}=req.body;
    
   if(id){
    const n=await Order.find({cusid:id,stage:{$ne:"Won"}}).populate("items").populate("stockxitem").populate("labels");
   
   
   
    return res.status(201).json({data:n})}
    res.status(201).json({message:"no orders"})
  
}
catch(err)
{
  console.log(err)
  res.status(500).json({message:"error in getting the numbers of leads"})
}
}

exports.updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.UpdateStages=async(req,res)=>{
  const {taskid,newstage}=req.body;
     
  try{

  const re=await  Order.updateOne({_id:taskid._id},
      {
        $set:{
          stage:newstage,
          stageUpdatedAt:new Date()
        }
      }
    )


    res.status(201).json({message:"ok on updating kanban order stage"})

  }
  catch{
    res.status(500).json({message:"error on updating kanban order stage"})
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const {id} = req.body;
    await Order.deleteOne({_id:id});
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

//different

exports.updatelabels=async (req,res)=>{
  try{

    const {newlabels,orderid}=req.body;
 
    
    const order=await  Order.updateOne({_id:orderid},{$set:{labels:newlabels}});
    const n=await Order.find({_id:orderid}).populate("labels");
     
     res.status(201).json({data:n})
  }
  catch(err)
  {
    res.status(500).json({ message: err.message });

  }
}

exports.UpdateDescription=async(req,res)=>{
  try{
     
    const {Description,orderid,price}=req.body;
   
    // Check if price exists and is a valid numeric string
    const isValidPrice = price && /^\d+(\.\d+)?$/.test(price);

    // Prepare update object
    const updateObj = { Description };
    if (isValidPrice) {
      updateObj.price = parseFloat(price);
    }
   
    const order = await Order.updateOne(
      {_id: orderid},
      {$set: updateObj}
    );
    
    res.status(201).json({data: order})
  
  }
  catch(err)
  {
     res.status(500).json({message:"error on updating Description"})
  }
}

exports.Getorderofsuppliers=async(req,res)=>{
   const {name}=req.body;
  try
  {
      const o=await Order.find({Supplierid:name}).populate("items").populate("stockxitem").populate("labels").populate("items").populate("Supplierid");
      let spend=0;   
      if(o?.length>0)
      {
        o.map((or)=>{
         spend+=or.sellprice
        })
      }
      res.status(201).json({data:o,spend:spend})
  }
  catch(err)
  {
   res.status(500).json({message:"error on updating Description"})
  }
}

exports.Confrimorder=async(req,res)=>{
  const {
_id,
price,
sell,
Name,
size,
Supplierid,
Shippingfee,
processingfee,
shippingaddress,
Sourceofthruth,
paymentmethod,
DealOwner,

}=req.body;
  
  try{
    const rev=parseFloat(sell)||0;
    const cog=parseFloat(price)||0;
    const pp=parseFloat(processingfee)||0;
    const sh=parseFloat(Shippingfee)||0

    const order=  await Order.findOneAndUpdate({_id:_id},{$set:{Shippingfee:sh,processingfee:pp,shippingaddress:shippingaddress.address1,
    Sourceofthruth:Sourceofthruth,paymentmethod:paymentmethod,DealOwnerid:DealOwner,price:cog,sellprice:rev,Supplierid:Supplierid,size:size,Name:Name,confirm:true,status:"active",statusupdate:new Date()}}).populate("items").populate("stockxitem").populate("labels").populate("Supplierid").populate("cusid");
   

    let customerid;
    let product;
    let tags=[];
    let shiping;
    let brand=""

    if(order?.cusid?.shopifyid!=null)
    {
      customerid={id:order.cusid.shopifyid}
    }
    else{
      customerid= {
      first_name: order?.Name.split(" ")[0],
      last_name:  order?.Name.split(" ")[1],
      email: order.cusid?.email?order.cusid?.email:"",
      phone: order.cusid?.Number?order.cusid?.Number:""
    }
    }
    if(order.stockxitem.length>0)
    {
      const productPromises = order.stockxitem.map(async (item) => {
        const productData = {
          title: item.name,
          price: rev.toString(), // Sell price
          costPrice: cog.toString(), // Cost price per item (cog)
          sku: item?.sku || '',
          image: item.image,
          tags: 'StockX Product'
        };
        const shopifyProduct = await manageShopifyProduct(productData);
        brand=item.brand
        return {
          variant_id: shopifyProduct.variantId,
          quantity: 1
        };
      });
      product = await Promise.all(productPromises);
    }
    else{
      // Handle regular items
      const productData = {
        title: order.items[0].Name,
        price: rev.toString(), // Sell price
        costPrice: cog.toString(), // Cost price per item (cog)
        sku: '',
        image: order.items[0].itempics[0],
        tags: 'CRM Product'
      };
      const shopifyProduct = await manageShopifyProduct(productData);
      product = [{
        variant_id: shopifyProduct.variantId,
        quantity: 1
      }];
    }
 
   //labels
    if(order.labels?.length>0)
    {
      order.labels.map((l)=>{
      
        tags.push(l.label.name)
      })
    }
    else{
      tags=["notags"]
    }
    shiping={
      first_name: order.Name.split(" ")[0],
      last_name: order.Name.split(" ")[1],
      address1: shippingaddress.address1,
      city:shippingaddress.city,
      country:shippingaddress.country,
      postcode:shippingaddress.postcode
    }
  
    if(order.confirm==false)
    {
      const d = await createShoOrder(customerid.id, product, tags, shiping, rev);

      const ops = [
        Order.findOneAndUpdate(
          { _id: _id },
          { $set: { confirm: true, shopifyorderid: d } },
          { new: true }
        ),
        Customer.findOneAndUpdate(
          { _id: order.cusid._id },
          {
            $inc: {
              total_spend: rev,
              orders_count: 1
            }
          }
        )
      ];
      
      if (brand && brand.trim() !== "") {
        ops.push(
          Supplier.findOneAndUpdate(
            { _id: Supplierid },
            { $addToSet: { Brand: brand } },
            { new: true }
          )
        );
      } else {
        ops.push(Promise.resolve(null)); // to keep the Promise.all structure
      }
      
      const [o, cus, k] = await Promise.all(ops);
     
      return res.status(201).json({data:o})
    }
  
    const cus=await Customer.findOneAndUpdate({_id:order.cusid._id},{total_spend:(order.cusid.total_spend+rev),
      orders_count:(order.cusid.orders_count+1)
     })

  res.status(201).json({data:"orderupdated"});  
  }
  catch(err)
  {
  console.log(err) 
       res.status(500).json({message:"error on updating Description"})
  }
}

exports.Wonorders=async(req,res)=>{
 try{
          const {userid}=req.body;
          const d=await Order.find({userid:userid,stage:'Won',confirm:true}).populate("items").populate("stockxitem");
          
          res.status(201).json({won:d})
 }
 catch(err)
 {
       res.status(500).json({message:"error on updating Description"})
 }
}

//for the order overview
exports.getordersfortabel=async(req,res)=>{

try {
  const { internval, startdate, enddate, userid } = req.body;
  const userIdObj = new mongoose.Types.ObjectId(userid);

  // Determine time range
  let start = startdate;
  let end = enddate;
  const detectedInterval = (!internval && startdate && enddate)
    ? giveinterval(null, startdate, enddate)
    : internval;

  if (detectedInterval) {
    const range = calculateDateRange(detectedInterval, startdate, enddate);
    start = range.start;
    end = range.end;
  }

  // Get all orders with populated fields
  const orders = await Order.find({
    userid: userIdObj,
    createdAt: { $gte: new Date(start), $lte: new Date(end) }
  })
    .populate("items stockxitem labels Supplierid cusid")
    .sort({ createdAt: -1 });

  // Enrich orders with phone and email
  const enrichedOrders = await Promise.all(
    orders.map(async (data) => {
      let phone = null;
      let email = null;

      if (!data.cusid) {
        const h = await get_shopify_byid(data.shopifycustomerid);
        const customer = h?.customers?.[0] || {};
        phone = customer.phone || null;
        email = customer.email || null;
      } else {
        const h = await Get_mongo_byid(data.cusid);
        phone = h?.[0]?.Number || null;
        email = h?.[0]?.email || null;
      }

      const plainData = data.toObject();
      plainData.phone = phone;
      plainData.email = email;
      return plainData;
    })
  );

  // Calculate total profit and unfulfilled count from already fetched orders
  let totalProfit = 0;
  let unfulfilledCount = 0;

  for (const order of orders) {
    if (order.confirm) {
      const price = order.price || 0;
      const processing = order.processingfee || 0;
      const shipping = order.Shippingfee || 0;
      const sellprice=order.sellprice;
      totalProfit += sellprice-price  - processing - shipping;
    } else {
      unfulfilledCount++;
    }
  }

  res.status(201).json({
    data: enrichedOrders,
    profit: totalProfit.toFixed(2),
    unfulfilled: unfulfilledCount
  });

} catch (err) {
  console.error("Error fetching orders:", err);
  res.status(500).json({ message: "Error fetching orders" });
}

}

function giveinterval(interval, startdate, enddate) {
  if (!interval && startdate && enddate) {
    const diffMillis = new Date(enddate) - new Date(startdate);
    const diffInDays = diffMillis / (1000 * 60 * 60 * 24);

    if (diffInDays > 90) return "year";
    if (diffInDays > 14) return "month";
    return "day";
  }
  return interval || "month"; // Default to month if no interval specified
}

function calculateDateRange(interval, startdate, enddate) {
  let start = startdate ? new Date(startdate) : null;
  let end = enddate ? new Date(enddate) : new Date();

  if (!start || !end) {
    end = new Date();
    if (interval === "year") {
      start = new Date(end.getFullYear(), 0, 1); // Start from January 1st
      start.setHours(0, 0, 0, 0);
    } else if (interval === "month") {
      start = new Date(end.getFullYear(), end.getMonth(), 1); // Start from 1st of current month
      start.setHours(0, 0, 0, 0);
    } else if (interval === "day") {
      start = new Date(end);
      start.setHours(0, 0, 0, 0);
    } else {
      // Default to month view
      start = new Date(end.getFullYear(), end.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
    }
  }

  end.setHours(23, 59, 59, 999);
  return { start, end };
}