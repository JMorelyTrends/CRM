const Brands=require("../Models/Brands")


exports.getBrands=async(req,res)=>{
    try{
     const {userid}=req.body;
     const p=await await Brands.distinct("name", { userid: userid });
     res.status(201).json({data:p})
    }
    catch(e){
        res.status(500).json({message:"error on getting payment methods: ",e})
    }
}

exports.createBrands=async(req,res)=>{
    try{
      const {name,userid}=req.body;
      // Check if brand already exists for this user
      const existing = await Brands.findOne({ name: name, userid: userid });
      if (existing) {
        return res.status(201).json({ message: "Brand already exists" });
      }
      const k=await Brands.create({
        name:name,
        userid:userid  
      });
      res.status(201).json({data:k})
    }
    catch(e){

        res.status(500).json({message:"error on getting payment methods: ",e})
    }
}

exports.deleteBrands=async(req,res)=>{
    try{
          const {name}=req.body;
         
          const k=await Brands.deleteOne({name:name});
          
          res.status(200).json({data:k});
    }
    catch(e)
    {
       
        res.status(500).json({message:"error on getting payment methods: ",e})
    }
}