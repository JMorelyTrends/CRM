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
                const exists = await StockxDatabase.findOne({ Stockxid: item.id });
            
                if (!exists && item.image) {
                const created = await StockxDatabase.create({
                    Stockxid: item.id,
                    sku: item.sku,
                    name: item.name,
                    slug: item.slug,
                    brand: item.brand,
                    image: item.image, 
                    category: item.category,
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
         
            
            
            res.status(201).json({ message: newproduct });
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
      
         
         return res.status(201).json({ message: results });
          //res.json(results);
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
    const retailPriceTrait = data.traits.find(trait => trait.name === 'Retail Price');
    const retailPrice = retailPriceTrait ? retailPriceTrait.value : null;

    if (!retailPrice) {
      return res.status(404).json({ message: 'Retail price not found in API response' });
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
   

    res.status(201).json({ price: updatedStockx });

  } catch (err) {
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