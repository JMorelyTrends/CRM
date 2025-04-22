const Item = require("../Models/item");
const Stockx=require("../StockX/stockx")
// Create a new item
exports.createItem = async (req, res) => {
  try {
    const {Name,B2Bprice,Sellprice,itempics,orderid}=req.body;
    const data={
      Name,B2Bprice,Sellprice,itempics,orderid
    }
    const newItem = await Item.create(data);
  
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single item by ID
exports.getItemById = async (req, res) => {
  try {
    const {id}=req.body;
    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an item
exports.updateItem = async (req, res) => {
  try {
    const {id,Name,B2Bprice,Sellprice,itempics,orderid}=req.body;
    const data={Name,B2Bprice,Sellprice,itempics,orderid};

    const updatedItem = await Item.findByIdAndUpdate(id, data, { new: true });
    if (!updatedItem) return res.status(404).json({ message: "Item not found" });
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: "Item not found" });
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getstockxitems=async(req,res)=>
{
try{
   const {search}=req.body;
   console.log(search);
}
catch(err)
{
  res.status(500).json({ message: error.message });

}
}
