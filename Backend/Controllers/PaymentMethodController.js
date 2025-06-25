const paymentmethod=require("../Models/Payment");
const Supplier = require("../Models/Supplier");

exports.getpaymentmethods=async(req,res)=>{
    try{
     const {userid}=req.body;
     const p=await await paymentmethod.distinct("name", { userid: userid });
     res.status(201).json({data:p})
    }
    catch(e){
        res.status(500).json({message:"error on getting payment methods: ",e})
    }
}

exports.addpaymentmethod=async(req,res)=>{
    try{
      const {name,userid}=req.body;
      const k=await paymentmethod.create({
        name:name,
        userid:userid  
      });
      res.status(201).json({data:k})
    }
    catch(e){

        res.status(500).json({message:"error on getting payment methods: ",e})
    }
}

exports.deleteaddpaymentmethod=async(req,res)=>{
    try{
          const {name}=req.body;
         
          const k=await paymentmethod.deleteOne({name:name});
          
          res.status(200).json({data:k});
    }
    catch(e)
    {
        console.log(e)
        res.status(500).json({message:"error on getting payment methods: ",e})
    }
}