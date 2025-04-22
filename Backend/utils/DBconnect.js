const mongoose=require("mongoose")

const DB_Connect=async()=>{
    try
    {
     await mongoose.connect(process.env.MONGO_URI)
      this.isconnected=true;
      console.log("MongoDB is connected")
   
    }
    catch(err){
     console.log("error on mongo connection",err)
    }
}


module.exports=DB_Connect