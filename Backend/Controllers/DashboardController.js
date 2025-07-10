const Order = require("../Models/Order");
const Team = require("../Models/Team")
const Orderreview = require("../Models/Orderreview")
const mongoose = require("mongoose")
const Sourceoftruth = require("../Models/Sourceoftruth")
const {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} = require("date-fns");

exports.Pershopper = async (req, res) => {
  try {
    const { start, end, userid } = req.body;

    if (!start || !end) {
      return res.status(201).json({ message: "ok" });
    }
 
    const o = await Team.aggregate([
      {

        $match: {
          userid: new mongoose.Types.ObjectId(userid)
        }
      },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "DealOwnerid",
          as: "orders"
        }
      },
      {
        $addFields: {
          filteredOrders: {
            $filter: {
              input: "$orders",
              as: "order",
              cond: {
                $and: [
                  { $eq: ["$$order.confirm", true] },
                  { $eq: ["$$order.status", "active"] },
                  { $gte: ["$$order.statusupdate", new Date(start)] },
                  { $lte: ["$$order.statusupdate", new Date(end)] },
                  {
                    $in: [new mongoose.Types.ObjectId(userid), "$$order.userid"]
                  }
                ]
              }
            }
          }
        }
      },
      {
        $addFields: {
          rev: {
            $sum: "$filteredOrders.sellprice"
          },
          shcost: {
            $sum: {
              $map: {
                input: "$filteredOrders",
                as: "o",
                in: {
                  $convert: {
                    input: "$$o.Shippingfee",
                    to: "double",
                    onError: 0,
                    onNull: 0
                  }
                }
              }
            }
          },
          prcost: {
            $sum: {
              $map: {
                input: "$filteredOrders",
                as: "o",
                in: {
                  $convert: {
                    input: "$$o.processingfee",
                    to: "double",
                    onError: 0,
                    onNull: 0
                  }
                }
              }
            }
          },
          cogs: {
            $sum: {
              $map: {
                input: "$filteredOrders",
                as: "o",
                in: {
                  $convert: {
                    input: "$$o.price",
                    to: "double",
                    onError: 0,
                    onNull: 0
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          userid: 1,
          rev: 1,
          shcost: 1,
          prcost: 1,
          cogs: 1
        }
      }
    ]);

    // Format the output as requested
    const formatted = o.map(entry => ({
      name: entry.name,
      revenue: entry.rev,
      profit: entry.rev - entry.shcost - entry.prcost - entry.cogs
    }));

    formatted.sort((a, b) => a.name.localeCompare(b.name));
    
    res.status(200).json({ data: formatted });
  }
  catch (e) {
    console.log(e)
    res.status(500).json({ message: "something wrong with per shopper controller" })
  }
}
exports.Perchannel = async (req, res) => {
  try {
    const { start, end, userid } = req.body;

    if (!start || !end || !userid) {
      return res.status(200).json({ message: "Missing required fields" });
    }
    const [r, k] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            status: "active",
            userid: new mongoose.Types.ObjectId(userid),
            statusupdate: {
              $gte: new Date(start),
              $lte: new Date(end)
            }
          }
        },
        {

          $group: {
            _id: null,
            totalRevenue: { $sum: { $convert: { input: "$sellprice", to: "double", onError: 0, onNull: 0 } } },
            totalShipping: { $sum: { $convert: { input: "$Shippingfee", to: "double", onError: 0, onNull: 0 } } },
            totalProcessing: { $sum: { $convert: { input: "$processingfee", to: "double", onError: 0, onNull: 0 } } },
            totalCost: { $sum: { $convert: { input: "$price", to: "double", onError: 0, onNull: 0 } } }
          }
        },
        {

          $project: {
            _id: 0,
            name: { $literal: "Shoppers" },
            revenue: "$totalRevenue",
            profit: {
              $subtract: [
                "$totalRevenue",
                { $add: ["$totalShipping", "$totalProcessing", "$totalCost"] }
              ]
            }
          }
        }
      ]),

      Orderreview.aggregate([
        {
          $match: {
            status: "active",
            userid: new mongoose.Types.ObjectId(userid),

            shopifycreatedat: {
              $gte: new Date(start),
              $lte: new Date(end)
            }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$Revenue" },
            profit: { $sum: "$profit" }
          }
        },
        {
          $project: {
            _id: 0,
            name: { $literal: "Shopify" },
            revenue: 1,
            profit: 1
          }
        }
      ])
    ])
    const d = r.concat(k);

    res.status(200).json({ data: d })
  }
  catch (e) {
    console.log(e)
    res.status(500).json({ message: "something wrong with per shopper controller" })
  }
}
exports.Marketingspend = async (req, res) => {
  try {
    const { start, end, userid } = req.body;
    res.status(200).json({ message: "ok" })
  }
  catch (e) {
    res.status(500).json({ message: "something wrong with per shopper controller" })
  }
}
exports.Sourceoftruth = async (req, res) => {
  try {
    const { start, end, userid } = req.body;
    if (!start || !end || !userid) {
      return res.status(200).json({ message: "Missing required fields" });
    }

    const sou = await Sourceoftruth.aggregate([
      {
        $match: {
          userid: new mongoose.Types.ObjectId(userid)
        }
      },
      // Stage 1: Lookup Orders
      {
        $lookup: {
          from: "orders",
          let: { sourceName: "$name" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$Sourceofthruth", "$$sourceName"] },
                    { $gte: ["$statusupdate", new Date(start)] },
                    { $lte: ["$statusupdate", new Date(end)] }
                  ]
                },
                userid: new mongoose.Types.ObjectId(userid)
              }
            }
          ],
          as: "ordersData"
        }
      },
      // Stage 2: Lookup Orderreviews
      {
        $lookup: {
          from: "orderreviews",
          let: { sourceName: "$name" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$Source_of_truth", "$$sourceName"] },
                    { $gte: ["$shopifycreatedat", new Date(start)] },
                    { $lte: ["$shopifycreatedat", new Date(end)] }
                  ]
                },
                approved: true,
                userid: new mongoose.Types.ObjectId(userid)
              }
            }
          ],
          as: "reviewsData"
        }
      },
      // Stage 3: Project intermediate totals
      {
        $project: {
          name: 1,
          totalOrderRevenue: { $sum: "$ordersData.sellprice" },
          totalOrderCost: { $sum: "$ordersData.price" },
          totalOrderShipping: {
            $sum: {
              $map: {
                input: "$ordersData",
                as: "order",
                in: { $toDouble: "$$order.Shippingfee" }
              }
            }
          },
          totalOrderProcessing: {
            $sum: {
              $map: {
                input: "$ordersData",
                as: "order",
                in: { $toDouble: "$$order.processingfee" }
              }
            }
          },
          totalReviewRevenue: { $sum: "$reviewsData.Revenue" },
          totalReviewCost: {
            $sum: {
              $reduce: {
                input: {
                  $map: {
                    input: "$reviewsData",
                    as: "review",
                    in: { $sum: "$$review.linedata.costprice" }
                  }
                },
                initialValue: 0,
                in: { $add: ["$$value", "$$this"] }
              }
            }
          },
          totalReviewShipping: { $sum: "$reviewsData.shipingfee" },
          totalReviewProcessing: { $sum: "$reviewsData.processingfee" }
        }
      },
      // Stage 4: Calculate final totals
      {
        $project: {
          name: 1,
          revenue: { $add: ["$totalOrderRevenue", "$totalReviewRevenue"] },
          totalCost: { $add: ["$totalOrderCost", "$totalReviewCost"] },
          totalShipping: { $add: ["$totalOrderShipping", "$totalReviewShipping"] },
          totalProcessing: { $add: ["$totalOrderProcessing", "$totalReviewProcessing"] }
        }
      },
      // STAGE 5 (NEW): Calculate Profit
      {
        $project: {
          name: 1,
          revenue: 1,
          profit: {
            $subtract: [
              "$revenue",
              { $add: ["$totalCost", "$totalShipping", "$totalProcessing"] }
            ]
          }
        }
      }
    ]);
  
    const filtered = sou.filter(item => !(item.revenue === 0 && item.profit === 0));
    
    res.status(200).json({ data: filtered })
  }
  catch (e) {
    res.status(500).json({ message: "something wrong with per shopper controller" })
  }
}
exports.ProRev = async (req, res) => {
  try {
    const { userid } = req.body;

    if (!userid)
      return res.status(401).json({ message: "Missing required fields" });

    const end = new Date()

    const fweek = startOfWeek(end).toISOString()
    const fmonth = startOfMonth(end).toISOString()

    const [r, u, k, t] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            status: "active",
            userid: new mongoose.Types.ObjectId(userid),
            updatedAt: {
              $gte: new Date(fweek),
              $lte: new Date(end)
            },
            confirm: true
          }
        },
        {

          $group: {
            _id: null,
            totalRevenue: { $sum: { $convert: { input: "$sellprice", to: "double", onError: 0, onNull: 0 } } },
            totalShipping: { $sum: { $convert: { input: "$Shippingfee", to: "double", onError: 0, onNull: 0 } } },
            totalProcessing: { $sum: { $convert: { input: "$processingfee", to: "double", onError: 0, onNull: 0 } } },
            totalCost: { $sum: { $convert: { input: "$price", to: "double", onError: 0, onNull: 0 } } }
          }
        },
        {

          $project: {
            _id: 0,
            name: { $literal: "Shoppers" },
            revenue: "$totalRevenue",
            profit: {
              $subtract: [
                "$totalRevenue",
                { $add: ["$totalShipping", "$totalProcessing", "$totalCost"] }
              ]
            }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            status: "active",
            userid: new mongoose.Types.ObjectId(userid),
            updatedAt: {
              $gte: new Date(fmonth),
              $lte: new Date(end)
            },
            confirm: true
          }
        },
        {

          $group: {
            _id: null,
            totalRevenue: { $sum: { $convert: { input: "$sellprice", to: "double", onError: 0, onNull: 0 } } },
            totalShipping: { $sum: { $convert: { input: "$Shippingfee", to: "double", onError: 0, onNull: 0 } } },
            totalProcessing: { $sum: { $convert: { input: "$processingfee", to: "double", onError: 0, onNull: 0 } } },
            totalCost: { $sum: { $convert: { input: "$price", to: "double", onError: 0, onNull: 0 } } }
          }
        },
        {

          $project: {
            _id: 0,
            name: { $literal: "Shoppers" },
            revenue: "$totalRevenue",
            profit: {
              $subtract: [
                "$totalRevenue",
                { $add: ["$totalShipping", "$totalProcessing", "$totalCost"] }
              ]
            }
          }
        }
      ]),
      Orderreview.aggregate([
        {
          $match: {
            status: "active",
            userid: new mongoose.Types.ObjectId(userid),
            approved: true,
            shopifycreatedat: {
              $gte: new Date(fweek),
              $lte: new Date(end)
            }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$Revenue" },
            profit: { $sum: "$profit" }
          }
        },
        {
          $project: {
            _id: 0,
            name: { $literal: "Shopify" },
            revenue: 1,
            profit: 1
          }
        }
      ]),
      Orderreview.aggregate([
        {
          $match: {
            status: "active",
            userid: new mongoose.Types.ObjectId(userid),
            approved: true,
            shopifycreatedat: {
              $gte: new Date(fmonth),
              $lte: new Date(end)
            }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$Revenue" },
            profit: { $sum: "$profit" }
          }
        },
        {
          $project: {
            _id: 0,
            name: { $literal: "Shopify" },
            revenue: 1,
            profit: 1
          }
        }
      ])
    ])

    const week = {
      rev:( Number(((r[0]?.revenue || 0) + (k[0]?.revenue || 0)).toFixed(2))).toString(),
      pro: (Number(((r[0]?.profit || 0) + (k[0]?.profit || 0)).toFixed(2))).toString()
    }
    const month = {
      rev:( Number(((u[0]?.revenue || 0) + (t[0]?.revenue || 0)).toFixed(2))).toString(),
      pro: (Number(((u[0]?.profit || 0) + (t[0]?.profit || 0)).toFixed(2))).toString()
    }

    res.status(200).json({ week: week, month: month })

  }
  catch (e) {
    console.log(e)
    res.status(500).json({ message: "something wrong with per shopper controller" })
  }
}