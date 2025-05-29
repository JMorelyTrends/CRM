const Orderreview=require("../Models/Orderreview")


const updateorders=async(req,res)=>{
    
    const{payload}=req.body;
    try{
    const shippingfee=parseFloat(payload.shipingfee)||0
    const processingfee=parseFloat(payload.processingfee)||0

    const profit=payload.Revenue- payload.AcutalCog-shippingfee-processingfee;
 
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

module.exports={
updateorders
}