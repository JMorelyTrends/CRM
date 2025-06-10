const Order = require("../Models/Order");
const mongoose = require("mongoose");

const {get_shopify_byid,Get_mongo_byid,draftorder,getshopifybyid_store}=require("./CustomerController")

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
         
          cusid:newOrder.clientFrom=='mongodb'?newOrder.customerid:null,
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
  
    const orders = await Order.find({userid:id}).populate("items").populate("stockxitem").populate("labels").populate("items").populate("Supplierid").populate('cusid').sort({createdAt:-1});
   
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
        // console.log("shopify customer get :",h.customers[0])
        phone=h.customers[0].phone!=null?h.customers[0].phone:null
        email=h.customers[0].email!=h.customers[0].email!=null?h.customers[0].email:null
        //add address here if needed
      
      }
      else{
        h= await Get_mongo_byid(data.cusid)
      // console.log("customer from db customer get :",h)
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
if (data.confirm != null)  tasks[counter].confirm = data.confirm;
    
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
  // console.log(maporderdata)

    res.status(200).json(maporderdata);
  } catch (error) {
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
}

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
          stage:newstage
        }
      }
    )


    res.status(201).json({message:"ok on updating kanban order stage"})

  }
  catch{
    res.status(500).json({message:"error on updating kanban order stage"})
  }
}

exports.deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: "Order not found" });
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
     
    const {Description,orderid}=req.body;
    const order=await  Order.updateOne({_id:orderid},{$set:{Description:Description}});
    
    res.status(201).json({data:order})
  
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
   // console.log(name)
      const o=await Order.find({Supplierid:name}).populate("items").populate("stockxitem").populate("labels").populate("items").populate("Supplierid");
      let spend=0;
      if(o?.length>0)
      {
        o.map((or)=>{
         spend+=or.price
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
    const order=  await Order.findOneAndUpdate({_id:_id},{$set:{Shippingfee:sh,processingfee:pp,shippingaddress:shippingaddress,
    Sourceofthruth:Sourceofthruth,paymentmethod:paymentmethod,DealOwner:DealOwner,price:cog,sellprice:rev,Supplierid:Supplierid,size:size,Name:Name,confirm:true}}).populate("items").populate("stockxitem").populate("labels").populate("items").populate("Supplierid").populate("cusid");
   
    let customerid;
    let product;
    let tags=[];
    let shiping;
    
    //customer 
    if(order.shopifycustomerid!=null)
    {
      customerid={id:order.shopifycustomerid}
    }
    else{
      customerid= {
      first_name: order.Name,
      last_name: " ",
      email: order.cusid.email?order.cusid.email:"",
      phone: order.cusid.Number?order.cusid.Number:""
    }
    }

    //product
    if(order.stockxitem.length>0)
    {
    product=   order.stockxitem.map((item) => ({
    title: item.name,
    price: item.last_sale_price || order.price,
    quantity: 1,
    sku: item?.sku,
     properties: [
      {
        name: "Image",
        value: item.image  // Replace with actual field
      }
    ]
  }))
    }
    else{
      product= [{
        title:order.items[0].Name,
        price:order.items[0].price,
        quantity:1,
          properties: [
      {
        name: "Image",
        value: order.items[0].itempics[0]  
      }
    ]  
      }]
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
      first_name: order.Name,
      address1: shippingaddress,
    }
   
    console.log(customerid)

    if(order.confirm==false)
    {
      const d=await draftorder(customerid,product,tags,shiping)
      const o=await Order.findOneAndUpdate({_id:_id},{$set:{confirm:true,shopifyorderid:d}})
      return res.status(201).json({data:o})
    }
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


//for dashboard

exports.PieData=async(req,res)=>{

try {
    const { internval, startdate, enddate, userid } = req.body;
    const userIdObj = new mongoose.Types.ObjectId(userid);
    let detectedInterval = internval;
    let start = startdate;
    let end = enddate;

    if (!internval && startdate && enddate) {
      detectedInterval = giveinterval(internval, startdate, enddate);
    } else {
      const range = calculateDateRange(internval, startdate, enddate);
     
      start = range.start;
      end = range.end;
    }
   
    
    // 3. List all stages you want to count
    const stages = [
      "New Lead",
      "Need To Source",
      "Offered",
      "Warm Lead",
      "Won",
      "Lost",
    ];

    // 4. Aggregate total counts per stage filtered by userid and date range
    const data = await Order.aggregate([
      {
        $match: {
             userid: { $in: [userIdObj] }, 
          createdAt: { $gte: new Date(start), $lte: new Date(end) },
          stage: { $in: stages }
        }
      },
      {
        $group: {
          _id: "$stage",
          count: { $sum: 1 }
        }
      }
    ]);
  


    // 5. Initialize response array with all stages and zero counts
    const pieData = stages.map(stage => ({
      name: stage,
      value: 0,
    }));

    // 6. Fill counts from aggregation results
    data.forEach(item => {
      const index = pieData.findIndex(p => p.name === item._id);
      if (index !== -1) {
        pieData[index].value = item.count;
      }
    });

    res.status(200).json({ data: pieData });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting stage counts" });
  }
}

exports.reqwondata=async(req,res)=>{
try {
    const { interval, startdate, enddate,userid } = req.body;
    const userIdObj = new mongoose.Types.ObjectId(userid);
    let detectedInterval = interval;
    let start = startdate;
    let end = enddate;

    
    if (!interval && startdate && enddate) {
      const diffMillis = new Date(enddate) - new Date(startdate);
      detectedInterval=giveinterval(interval,startdate,enddate)
    } else {
      const l=calculateDateRange(interval,startdate,enddate);
      start=l.start
      end=l.end
    }

    let groupFormat, labels;
    let get=getGroupFormatlabel(detectedInterval);
    groupFormat=get.groupFormat;
    labels=get.labels;

    
    const data = await Order.aggregate([
      {
        $match: {
           userid: { $in: [userIdObj] }, 
          createdAt: { $gte: new Date(start), $lte: new Date(end) }
        }
      },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: "$createdAt",
              unit:detectedInterval=="day"?  "hour":"day",
                binSize: 3,
              timezone: "UTC"
            }
          },
          Won: {
            $sum: {
              $cond: [{ $eq: ["$stage", "Won"] }, 1, 0]
            }
          },
          Req: {
            $sum: {
              $cond: [
                { $not: { $in: ["$stage", ["Won", "Lost"]] } },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    
    let formatted = [];
     formatted = labels&&labels.length>0&& labels.map(label => ({
        name: label,
        Won: 0,
        Request: 0
      }));

    if (detectedInterval === "day") {
      formatted=getLast24HourLabels().formatted
      data.forEach(entry => {
        const hour = new Date(entry._id).getUTCHours(); // hour form the monogo result
        let bucket = Math.floor(hour / 3) * 3;        // 
        let label = `${bucket.toString().padStart(2, '0')}:00`;
        let index = labels.indexOf(label);
          //  console.log(label,bucket,hour)
        if (index !== -1) {
          formatted[index].Won += entry.Won;
          formatted[index].Request += entry.Req;
        }
        else{
            for(i=0;i<2;i++)
            {
               bucket+=1;
               
               label = `${bucket.toString().padStart(2, '0')}:00`
               index = labels.indexOf(label);
                if(index !== -1)
                {
                  break;
                }
            }
          formatted[index].Won += entry.Won;
          formatted[index].Request += entry.Req;
        }
      });
      // console.log(formatted);
      // console.log(data);
      // console.log(labels);
   
       
    } 
    else if(detectedInterval==="week") {
       data&& data.length>0&& data.map((entry) => {
        let kk=new Date(entry._id);
        let index=kk.getDay();
        if(index)
        {
         formatted[index].Won += entry.Won;
           formatted[index].Request += entry.Req;
        }
    });
        
    
   
    }
    else if(detectedInterval==="year")
    {
      data&& data.length>0&&  data.map((entry) => {
        let kk=new Date(entry._id);
        let index=kk.getMonth();
        if(index)
        {
           formatted[index].Won += entry.Won;
           formatted[index].Request += entry.Req;
        }
    });
    }
    res.status(200).json({ data: formatted });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "error getting request vs won data" });
  }
}

exports.wonloastdata=async(req,res)=>{

  try {
    const { interval, startdate, enddate ,userid} = req.body;
      const userIdObj = new mongoose.Types.ObjectId(userid);
    let detectedInterval = interval;
    let start = startdate;
    let end = enddate;

    if (!interval && startdate && enddate) {
      detectedInterval = giveinterval(interval, startdate, enddate);
    } else {
      const range = calculateDateRange(interval, startdate, enddate);
      start = range.start;
      end = range.end;
    }

    let groupFormat, labels;
    const groupResult = getGroupFormatlabel(detectedInterval);
    groupFormat = groupResult.groupFormat;
    labels = groupResult.labels;

    // MongoDB aggregation
    const data = await Order.aggregate([
      {
        $match: {
            userid: { $in: [userIdObj] }, 
          createdAt: { $gte: new Date(start), $lte: new Date(end) }
        }
      },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: "$createdAt",
              unit: detectedInterval === "day" ? "hour" : "day",
              binSize: 3,
              timezone: "UTC"
            }
          },
          Won: {
            $sum: {
              $cond: [{ $eq: ["$stage", "Won"] }, 1, 0]
            }
          },
          Lost: {
            $sum: {
              $cond: [{ $eq: ["$stage", "Lost"] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Format result
    let formatted = labels && labels.length > 0 && labels.map(label => ({
      name: label,
      Won: 0,
      Lost: 0
    }));

    if (detectedInterval === "day") {
      const labelObj = getLast24HourLabels();
      labels = labelObj.labels;
      formatted = labelObj.formatted.map(f => ({ ...f, Lost: 0 }));

      data.forEach(entry => {
        const hour = new Date(entry._id).getUTCHours();
        let bucket = Math.floor(hour / 3) * 3;
        let label = `${bucket.toString().padStart(2, '0')}:00`;
        let index = labels.indexOf(label);

        if (index !== -1) {
          formatted[index].Won += entry.Won;
          formatted[index].Lost += entry.Lost;
        } else {
          for (let i = 0; i < 2; i++) {
            bucket += 1;
            label = `${bucket.toString().padStart(2, '0')}:00`;
            index = labels.indexOf(label);
            if (index !== -1) break;
          }
          if (index !== -1) {
            formatted[index].Won += entry.Won;
            formatted[index].Lost += entry.Lost;
          }
        }
      });
    } else if (detectedInterval === "week") {
      data.forEach(entry => {
        const index = new Date(entry._id).getDay();
        if (formatted[index]) {
          formatted[index].Won += entry.Won;
          formatted[index].Lost += entry.Lost;
        }
      });
    } else if (detectedInterval === "year") {
      data.forEach(entry => {
        const index = new Date(entry._id).getMonth();
        if (formatted[index]) {
          formatted[index].Won += entry.Won;
          formatted[index].Lost += entry.Lost;
        }
      });
    }
   

    res.status(200).json({ data: formatted });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "error getting won vs lost data" });
  }
}

exports.otherdetails=async(req,res)=>{
  try
  {
   const { internval, startdate, enddate, userid } = req.body;
    const userIdObj = new mongoose.Types.ObjectId(userid);
    let detectedInterval = internval;
    let start = startdate;
    let end = enddate;

    if (!internval && startdate && enddate) {
      detectedInterval = giveinterval(internval, startdate, enddate);
    } else {
      const range = calculateDateRange(internval, startdate, enddate);
      start = range.start;
      end = range.end;
    }
 
  
     const stats = {
       newOrders: await countOrdersByStage("New Lead", userid, start, end),
       needToSource: await countOrdersByStage("Need To Source", userid, start, end),
       liveRequests: await countOrdersByStage("Offered", userid, start, end),
       wonOrders: await countOrdersByStage("Won", userid, start, end),
       wonRevenue: await getWonRevenue(userid, start, end),
       wonProfit: await getWonProfit(userid, start, end)
     };

    res.status(200).json({data:stats})
  }
  catch(err)
  {
    res.status(500).json({ message: "error getting won vs lost data" });
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


function getLast24HourLabels(step = 3) {
  const now = new Date();
  const labels = [];
  const formatted = [];

  // Go 24 hours back in step size
  for (let i = 7; i >= 0; i--) {
    let hour = (now.getUTCHours() - i * step + 24) % 24;
    let label = `${hour.toString().padStart(2, '0')}:00`;
    labels.push(label);
    formatted.push({ name: label, Won: 0, Request: 0 });
  }

  return { labels, formatted };
}

function getdaystilldate(arr,detectedInterval){
  let array=[];
if(detectedInterval==="week")
{
   const todayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const index = (todayIndex - i + 7) % 7;
    result.push(arr[index]);
  }

  return result;
}
else if(detectedInterval==="year")
{
  
   let cd=new Date().getMonth();
   cd=cd+1;
  array=arr.slice(0,cd);
  return array
}

}

function giveinterval(interval, startdate, enddate) {
  if (!interval && startdate && enddate) {
    const diffMillis = new Date(enddate) - new Date(startdate);
    const diffInDays = diffMillis / (1000 * 60 * 60 * 24);

    if (diffInDays > 90) return "year";
    if (diffInDays > 14) return "week";
    return "day";
  }
  return interval;
}

function calculateDateRange(interval, startdate, enddate) {
  let start = startdate ? new Date(startdate) : null;
  let end = enddate ? new Date(enddate) : new Date();

  if (!start || !end) {
    end = new Date();
    if (interval === "year") {
      const past = new Date();
      past.setFullYear(end.getFullYear() - 1);
      start = past;
    } else if (interval === "week") {
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (interval === "day") {
      start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  return { start, end };
}

function getGroupFormatlabel(detectedInterval) {
    let groupFormat, labels;

    switch (detectedInterval) {
      case "year":
        
        groupFormat = { $month: "$createdAt" };
        labels =  getdaystilldate(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],detectedInterval);
        break;
      case "week":
        groupFormat = { $dayOfWeek: "$createdAt" };
        labels =  getdaystilldate(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],detectedInterval);
        break;
      case "day":
        groupFormat = { $hour: "$createdAt" }; // still truncate by hour
        labels = getLast24HourLabels().labels; // 8 blocks
        break;
      default:
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }
    return {groupFormat,labels}
}

async function getRevenueBetweenDates(start, end, userid = null, stages = null) {
  const matchQuery = {
    createdAt: {
      $gte: new Date(start),
      $lte: new Date(end)
    },
    stage:"Won"
  };

  // Handle userid if provided (your schema has userid as an array)
  if (userid) {
    matchQuery.userid = { $in: [new mongoose.Types.ObjectId(userid)] };
  }


  const result = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$price" }
      }
    }
  ]);

  return result.length > 0 ? result[0].totalRevenue : 0;
}

async function getNewLeadOrderCount(userid, start, end ) {
  const matchQuery = {
    stage: "New Lead"
  };
 

  // Filter by userid if provided (remember it's stored as array)
  if (userid) {
    matchQuery.userid = { $in: [ new mongoose.Types.ObjectId(userid)] };
  }

  // Filter by date range if provided
  if (start && end) {
    matchQuery.createdAt = {
      $gte: new Date(start),
      $lte: new Date(end)
    };
  }

  const count = await Order.countDocuments(matchQuery);
  
  return count;
}

function buildMatchQuery(stage, userid, start, end) {
  const query = { stage };

  
  if (userid) {
    query.userid = { $in: [new mongoose.Types.ObjectId(userid)] };
  }

  if (start && end) {
    query.createdAt = {
      $gte: new Date(start),
      $lte: new Date(end)
    };
  }

  return query;
}

async function countOrdersByStage(stage, userid = null, start = null, end = null) {
  const match = buildMatchQuery(stage, userid, start, end);

  return await Order.countDocuments(match);
}

async function getWonRevenue(userid = null, start = null, end = null) {
  const match = buildMatchQuery("Won", userid, start, end);

  const result = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total:{$sum:"$sellprice"},
      
      }
    }
  ]);
  
  
  return result[0]?.total || 0;
}

async function getWonProfit(userid = null, start = null, end = null) {
  const match = buildMatchQuery("Won", userid, start, end);

 const result = await Order.aggregate([
    { $match: match },
    {
      $addFields: {
        processingFeeNum: { $toDouble: { $ifNull: ["$processingfee", "0"] } },
        shippingFeeNum: { $toDouble: { $ifNull: ["$Shippingfee", "0"] } },
        sellPriceNum: { $toDouble: { $ifNull: ["$sellprice", "0"] } },
        priceNum: { $toDouble: { $ifNull: ["$price", "0"] } }
      }
    },
    {
      $project: {
        profit: {
          $subtract: [
            { $subtract: ["$sellPriceNum", "$priceNum"] },
            { $add: ["$shippingFeeNum", "$processingFeeNum"] }
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        totalProfit: { $sum: "$profit" }
      }
    }
  ]);

  // Return totalProfit or 0 if no result
  return result.length > 0 ? result[0].totalProfit : 0;
}
