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
   
   // console.log(order)
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
  }))
    }
    else{
      product= [{
        title:order.items[0].Name,
        price:order.items[0].price,
        quantity:1,
        
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
    console.log(err)
       res.status(500).json({message:"error on updating Description"})
  }
}