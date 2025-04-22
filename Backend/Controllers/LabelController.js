const express= require("express")
const Label= require("../Models/Label")

exports.addlabel = async (req, res) => {
  try {
    const { color, name, userid } = req.body;

    // Check if a label with the same name already exists for the user
    const check = await Label.find({ userid: userid, "label.name": name });
  
    if (check.length > 0) {
      return res.status(201).json({ message: "Name is already taken" }); // Use 409 Conflict
    } else {
      const newLabel = await Label.create({
        userid: userid,
        label: {
          name: name,
          col: color
        }
      });
      return res.status(201).json({ message: newLabel });
    }
  } catch (err) {
   
    res.status(500).json({ message: "Error on adding labels" });
  }
};

exports.getlabels=async(req,res)=>{
 try{
       const {id}=req.body;
       const data=await Label.find({userid:id});
   
       res.status(201).json({data:data});
 }
 catch(err)
 {
   res.status(201).json({message:"error on getting availabel labels"})
 }
}

exports.dellabel=async(req,res)=>{
  try{
    const {id}=req.body
    const d= await Label.deleteOne({_id:id});
   
    res.status(201).json({data:data});
  }
  catch(err)
  {
    res.status(201).json({message:"error on deleting availabel labels"})
  }
}