const Sourceoftruth=require("../Models/Sourceoftruth")


exports.getsources=async(req,res)=>{
    try{
     const {userid}=req.body;
     const p=await await Sourceoftruth.distinct("name", { userid: userid });
     res.status(201).json({data:p})
    }
    catch(e){
        res.status(500).json({message:"error on getting payment methods: ",e})
    }
}

exports.createsource=async(req,res)=>{
    try{
      const {name,userid}=req.body;
      const k=await Sourceoftruth.create({
        name:name,
        userid:userid  
      });
      res.status(201).json({data:k})
    }
    catch(e){

        res.status(500).json({message:"error on getting payment methods: ",e})
    }
}

exports.deletesource=async(req,res)=>{
    try{
          const {name}=req.body;
         
          const k=await Sourceoftruth.deleteOne({name:name});
          
          res.status(200).json({data:k});
    }
    catch(e)
    {
        console.log(e)
        res.status(500).json({message:"error on getting payment methods: ",e})
    }
}