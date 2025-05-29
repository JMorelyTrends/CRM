const StockxDatabase =require("../Models/StockxDatabase")
const Stockx=require("../StockX/stockx")
const SneaksAPI = require('sneaks-api');
const sneaks = new SneaksAPI();
exports.Getdatastore=async (req,res)=>{
try
{
    const {search}=req.body;
  //  console.log(search)
   const exactMatch = await StockxDatabase.find({ name: search });

   if (exactMatch.length>0) {
    //  console.log("get the exact match",exactMatch)
     return res.status(200).json({ message: exactMatch });
   }
   const partialMatch = await StockxDatabase.find({
    
     name: { $regex: `.*${search}.*`, $options: 'i' } 
   });

  //  if (partialMatch.length > 0) {
  // //  console.log("get the partial match")

  //    return res.status(200).json({ message: partialMatch });
  //  }
        const options = {
            method: 'GET',
            headers: {
            'x-api-key':process.env.RETAIL_API_KEY 
            }
        };
        const searchTerm = search;
        const url = `https://app.retailed.io/api/v1/scraper/stockx/search?query=${encodeURIComponent(searchTerm)}`;
        const data = await fetch(url, options)
        .then(res => res.json())
        .then(async(d) =>{
            const products = [];
    
            d.length>0&&
            await Promise.all(
            d.map(async (item) => {
             // console.log(item)
                const exists = await StockxDatabase.findOne({ Stockxid: item.id });
            
                if (!exists && item.image) {
                const created = await StockxDatabase.create({
                    Stockxid: item.id,
                    sku: item.sku,
                    name: item.name,
                    slug: item.slug,
                    brand: item.brand,
                    image: item.image, 
                    Category: item.category,
                    Colorway: item.colorway,
                });
             
                products.push(created); 
                }
                else{
                  products.push(exists)
                }
               
      
            })
            );

            const newproduct=[...partialMatch,...products]
         
            
            
           return res.status(201).json({ message: newproduct });
          //    for (const item of newproduct) {
          //   if (!item?.enriched) {
          //     await enrichProduct(item._id, item.slug); // Wait for enrichment
          //     await delay(1000); // Wait for 2 seconds before next iteration
          //   }
          // }
        })
        .catch(err =>{ console.error('Fetch error:', err)
            return null
        });
    
      
 

  

}
catch(err)
{
    res.status(500).json({ message: error.message });

}
}

exports.Getprepopulate=async(req,res)=>{
  
        const { q } = req.body; 
      
       
        
        const regex = new RegExp(q, 'i'); 
      
        try {
          const results = await StockxDatabase.find({
            $or: [
              { name: { $regex: regex } },
              { brand: { $regex: regex } },
              { Category: { $regex: regex } },
              { Colorway: { $regex: regex } }
            ]
          }); 
      
         
                    res.status(201).json({ message: results });
          //       for (const item of results) {
          //   if (!item.enriched) {
          //     await enrichProduct(item._id, item.slug); // Wait for enrichment
          //     await delay(2000); // Wait for 2 seconds before next iteration
          //   }
          // }
        } 
     
    catch(err)
    {
        return res.status(500).json({ message: err.message });
    
    }
}

exports.Getproductprice = async (req, res) => {
  const { itemid, search } = req.body;

  try {

    const options = {
      method: 'GET',
      headers: {
        'x-api-key': process.env.RETAIL_API_KEY
      }
    };

   

    const searchTerm = search;
    const currency = 'GBP';
    const url = `https://app.retailed.io/api/v1/scraper/stockx/product?query=${encodeURIComponent(searchTerm)}&currency=${currency}`;

    const response = await fetch(url, options);
    const data = await response.json();
   
    const d = new Date().toISOString();
    const retailPriceTrait = data?.traits?.find(trait => trait.name === 'Retail Price');
    let retailPrice = retailPriceTrait ? retailPriceTrait.value : null;
   
// Step 2: Fallback logic
if (!retailPrice || retailPrice === 0) {
  const lastSale = data.market?.sales?.last_sale;
  const highestBid = data.market?.bids?.highest_bid;
  const lowestAsk = data.market?.bids?.lowest_ask;

  if (lastSale && lastSale !== 0) {
    retailPrice = lastSale;
  } else if (highestBid && highestBid !== 0) {
    retailPrice = highestBid;
  } else if (lowestAsk && lowestAsk !== 0) {
    retailPrice = lowestAsk;
  } else {
    retailPrice = 0; // Default if no value found
  }
}

if (retailPrice === 0) {
  console.warn(`No price found for itemid=${itemid}, search="${search}"`);
}

const updatedStockx = await StockxDatabase.findOneAndUpdate(
  { _id: itemid },
  {
    $set: {
      last_sale_price: retailPrice,
      last_sale_update_date: d
    }
  },
  { new: true }
);

return res.status(201).json({ price: updatedStockx });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message || 'Something went wrong' });
  }
};

exports.getprice_github=async(req,res)=>{
   const {itemid,sku}=req.body;

  try{
    //getProducts(keyword, limit, callback) takes in a keyword and limit and returns a product array 
sneaks.getProductPrices(sku, async function (err, product){

  const d=product.retailPrice;
      //  if(d)
      // {
      //   const updatedStockx = await StockxDatabase.findOneAndUpdate(
      //     { _id: itemid },
      //     {
      //       $set: {
      //         last_sale_price: retailPrice,
      //         last_sale_update_date: d
      //       }
      //     },
      //     { new: true }
      //   );
      //  return res.status(201).json({ price: updatedStockx });
      // }

    //  res.status(201).json({ message:"dont find it" })
})
    
 res.status(201).json({ message:"dont find it" })
  }
  catch(err)
  {
  return res.status(500).json({ message: err.message });
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function enrichProduct(docId, stockxId) {
  try {
    const url = `https://app.retailed.io/api/v1/scraper/stockx/product?query=${stockxId}&currency=GBP`;
    const resp = await fetch(url, {
      method: 'GET',
      headers: { 'x-api-key': process.env.RETAIL_API_KEY }
    });
    const data = await resp.json();
    // console.log(data)
    const model = data.model;
    const primary_category = data.primary_category || data.category;
    const variant = data.variants?.[0];
    const size = variant?.sizes || null;

    // Get retail price from traits
    
    const price =data.market.sales.last_sale;
    // console.log(price)
    await StockxDatabase.findByIdAndUpdate(docId, {
      $set: {
        model,
        primary_category,
        size,
       last_sale_price: price,
        enriched: true,
        enrichedAt: new Date()
      }
    });
  } catch (err) {
    console.error('Enrichment failed for', stockxId, err.message);
  }
}