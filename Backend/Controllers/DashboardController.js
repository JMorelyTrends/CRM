const Order = require("../Models/Order");

exports.Pershopper = async (req,res) => {
    try {
        const {start,end,userid}=req.body;
     console.log("from :",start)
     console.log("to :",end)
        const o=await Order.aggregate([
            {
              $match: {
                DealOwner: { $ne: null },
                confirm:true,
                status:"active",
                updatedAt: {                        
                  $gte: new Date(start),
                  $lte: new Date(end)
                }
              }
            },
            {
              $addFields: {
                ShippingfeeNum: { $toDouble: "$Shippingfee" },
                processingfeeNum: { $toDouble: "$processingfee" },
                priceNum: { $toDouble: "$price" }
              }
            },
            {
              $group: {
                _id: "$DealOwner",
                rev: { $sum: "$sellprice" }, // assuming sellprice is already a number
                shcost: { $sum: "$ShippingfeeNum" },
                prcost: { $sum: "$processingfeeNum" },
                cogs: { $sum: "$priceNum" }
              }
            }
          ])
          
          // Format the output as requested
          const formatted = o.map(entry => ({
            name: entry._id,
            revenue: entry.rev,
            profit: entry.rev - entry.shcost - entry.prcost - entry.cogs
          }));
         
          formatted.sort((a, b) => a.name.localeCompare(b.name));
          console.log(formatted)
          res.status(200).json({ data: formatted });
    }
    catch (e) {
       
        res.status(500).json({ message: "something wrong with per shopper controller" })
    }
}


exports.Perchannel = async (req,res) => {
    try {
        const {start,end,userid}=req.body;
        res.status(200).json({message:"ok"})
    }
    catch (e) {
        res.status(500).json({ message: "something wrong with per shopper controller" })
    }
}

exports.Marketingspend = async (req,res) => {
    try {
        const {start,end,userid}=req.body;
        res.status(200).json({message:"ok"})
    }
    catch (e) {
        res.status(500).json({ message: "something wrong with per shopper controller" })
    }
}
exports.Sourceoftruth = async (req,res) => {
    try {
       const {start,end,userid}=req.body;
       res.status(200).json({message:"ok"})
    }
    catch (e) {
        res.status(500).json({ message: "something wrong with per shopper controller" })
    }
}
