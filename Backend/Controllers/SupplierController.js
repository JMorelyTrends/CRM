const Supplier= require("../Models/Supplier")

exports.CreateSupplier=async(req,res)=>{

    const {newSupplier}=req.body;
    try{
        let query = {};
        
         
          if (newSupplier?.Email && newSupplier?.Number) {
            query = {
              $or: [{ Email: newSupplier.Email }, { Number: newSupplier.Number }]
            };
          } else if (newSupplier?.Email) {
            query = { Email: newSupplier.Email };
          } else if (newSupplier?.Number) {
            query = { Number: newSupplier.Number };
          }
        
          const check = await Supplier.findOne(query);
        
          if(!check)
          {
            await Supplier.create(newSupplier)
          }
          else{
           return res.status(201).json({message:"supplier already exits"})
          }
     
         res.status(201).json({})
    }
    catch(err)
    {
     res.status(500).json({ message: err.message || 'Something went wrong' });
    }
};

exports.getthemall=async(req,res)=>{
    try{
        const supp=await Supplier.find({});
        res.status(201).json({supps:supp})
    }
    catch(err)
    {
          res.status(500).json({ message: err.message || 'Something went wrong' });
    }
}
exports.updatesupplier=async(req,res)=>{
  const {id,newSupplier}=req.body;
  try{
    //need to make checks
    const d= await Supplier.findOneAndUpdate({_id:id},{$set:newSupplier},{ new: true })
 
    res.status(201).json({data:d})
  }
  catch(err)
  {
    res.status(500).json({ message: err.message || 'Something went wrong' });
  }
}
