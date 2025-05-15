const Order = require("../Models/Order");
const {get_shopify_byid,Get_mongo_byid,draftorder}=require("./CustomerController")

exports.createOrder = async (req, res) => {
  try {
    const {newOrder} = req.body;
    let or=null;
 
    if(newOrder.Stockxid){
    or=await Order.create({
        Name: newOrder.Name,
        stockxitem:newOrder.Stockxid,
        shopifycustomerid:newOrder.clientFrom=='shopify'?newOrder.customerid:null,
        cusid:newOrder.clientFrom=='mongodb'?newOrder.customerid:null,
        size:newOrder.size,
        condition:newOrder.Condition,
        userid:newOrder.userid   
     });
     
    
    }
      else{
        or=await Order.create({
          Name: newOrder.Name,
          items:newOrder.items,
          shopifycustomerid:newOrder.clientFrom=='shopify'?newOrder.customerid:null,
          cusid:newOrder.clientFrom=='mongodb'?newOrder.customerid:null,
          size:newOrder.size,
          condition:newOrder.Condition,
          userid:newOrder.userid   
       })
      }
     
     //add here for the customers comming form the mongodb

   return  res.status(201).json({message:"order created sucessfully", data:or});
 
   
  } catch (error) {
    //console(error)
    res.status(400).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const {id}=req.body;
  
    const orders = await Order.find({userid:id}).populate("items").populate("stockxitem").populate("labels").populate("items").populate("Supplierid").sort({createdAt:-1});
   
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
         spend+=or.price;
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
    const order=  await Order.findOneAndUpdate({_id:_id},{$set:{Shippingfee:Shippingfee,processingfee:processingfee,shippingaddress:shippingaddress,
    Sourceofthruth:Sourceofthruth,paymentmethod:paymentmethod,DealOwner:DealOwner,price:price,Supplierid:Supplierid,size:size,Name:Name,confirm:true}}).populate("items").populate("stockxitem").populate("labels").populate("items").populate("Supplierid").populate("cusid");
   
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
      address1: order.shippingaddress,
    }


   //console.log(product)
    draftorder(customerid,product,tags,shiping)
    res.status(201).json({data:order})
  }
  catch(err)
  {
   
       res.status(500).json({message:"error on updating Description"})
  }
}

exports.PieData=async(req,res)=>{
  const {userid}=req.body;
  try{

     const pieData = [
       { name: "New Lead", value: 0 },
       { name: "Need To Source", value: 0 },
       { name: "Offered", value: 0 },
       { name: "Warm Lead", value: 0 },
       { name: "Won", value: 0 },
       { name: "Lost", value: 0 },
     ];

for (let i = 0; i < pieData.length; i++) {
  const stageName = pieData[i].name;
  const orders = await Order.find({ stage: stageName },{userid:userid});
  pieData[i].value = orders.length;
}

    res.status(201).json({data:pieData})



 

  }
  catch(err){
       res.status(500).json({message:"error on updating Description"})

  }
}

exports.reqwondata=async(req,res)=>{
try {
    const { interval, startdate, enddate } = req.body;
     
    let detectedInterval = interval;
    let start = startdate;
    let end = enddate;

    // Auto-detect interval if not provided
    if (!interval && startdate && enddate) {
      const diffMillis = new Date(enddate) - new Date(startdate);
      const diffInDays = diffMillis / (1000 * 60 * 60 * 24);

      if (diffInDays > 90) {
        detectedInterval = "year";
      } else if (diffInDays > 14) {
        detectedInterval = "week";
      } else {
        detectedInterval = "day";
      }
    } else {
      // Set date range if only interval is given
      if (detectedInterval === "year") {
        end = new Date();
        const past = new Date();
        past.setFullYear(end.getFullYear() - 1);
        start = past;
      } else if (detectedInterval === "week") {
        end = new Date();
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (detectedInterval === "day") {
        end = new Date();
        start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      }
    }

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

    // MongoDB aggregation
    const data = await Order.aggregate([
      {
        $match: {
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

    // Format result
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
          console.log("prev",label)
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
            console.log(label)
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
   let cd=new Date().getDay();
   cd=cd+1;
  array=arr.slice(0,cd);
  return array
}
else if(detectedInterval==="year")
{
  
   let cd=new Date().getMonth();
   cd=cd+1;
  array=arr.slice(0,cd);
  return array
}

}