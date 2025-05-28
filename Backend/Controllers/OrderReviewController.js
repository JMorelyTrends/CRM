const Orderreview=require("../Models/Orderreview")


const updateorders=async(req,res)=>{

    const{payload}=req.body;
    const shippingfee=parseFloat(payload.shipingfee)
    const processingfee=parseFloat(payload.processingfee)

    const profit=payload.Revenue- payload.AcutalCog-shippingfee-processingfee;
 
    try{
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
        res.status(500).json({message:"error updating Review Orders"})
    }
}

module.exports={
updateorders
}