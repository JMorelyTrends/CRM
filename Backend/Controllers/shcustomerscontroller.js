const ShopifyCustomer=require("../Models/ShopifyCustomers")

exports.getpageinateCustomers=async(req,res)=>{
try {
  const { userid, currentpage, searchText } = req.body;

  const page = currentpage || 1;
  const limit = 50;
  const skip = (page - 1) * limit;

  const query = {
    userid: userid
  };

  if (searchText && searchText.trim() !== "") {
    const regex = new RegExp(searchText.trim(), "i"); // case-insensitive search
    query.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { phone: regex }
    ];
  }

  const [customers,to, totalCustomers, optin] = await Promise.all([
    ShopifyCustomer.find(query)
      .skip(skip)
      .limit(limit)
      .exec(),
    ShopifyCustomer.countDocuments({userid:userid}),
    ShopifyCustomer.countDocuments(query),

    ShopifyCustomer.countDocuments({
      userid: userid,
      "emailMarketingConsent.marketingState": "SUBSCRIBED"
    })
  ]);

  const per = to > 0 ? (optin / to) * 100 : 0;
  const n = Math.round(per * 10) / 10;
  
  res.status(200).json({
    customers,
    currentPage: page,
    totalPages: Math.ceil(totalCustomers / limit),
    totalCustomers,
    optin: n
  });
} catch (err) {
  console.error(err);
  res.status(500).json({ message: "Problem fetching the customers" });
}

}

