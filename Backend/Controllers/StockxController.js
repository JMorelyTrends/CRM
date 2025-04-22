const StockxDatabase =require("../Models/StockxDatabase")
const Stockx=require("../StockX/stockx")
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

   if (partialMatch.length > 0) {
  //  console.log("get the partial match")

     return res.status(200).json({ message: partialMatch });
   }
    else
    {
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
            const newproduct = [];
           // console.log("from api ",d)
            d.length>0&&
            await Promise.all(
            d.map(async (item) => {
                const exists = await StockxDatabase.findOne({ Stockxid: item.id });
            
                if (!exists) {
                 //   console.log("not getting in database", item)
                const created = await StockxDatabase.create({
                    Stockxid: item.id,
                    sku: item.sku,
                    name: item.name,
                    slug: item.slug,
                    brand: item.brand,
                    image: item.image, 
                    category: item.category,
                    colorway: item.colorway,
                });

                newproduct.push(created); 
            
                }
                else{
                    newproduct.push(exists)
                }
            
            })
            );
            //console.log(newproduct)
            
            res.status(201).json({ message: newproduct });
        })
        .catch(err =>{ console.error('Fetch error:', err)
            return null
        });
    }
      
 

  

}
catch(err)
{
    res.status(500).json({ message: error.message });

}
}