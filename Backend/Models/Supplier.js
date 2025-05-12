const mongoose=require("mongoose");

const SupplierSchema= new mongoose.Schema({
    Name:{
        type:String,
    },
    Number:{
        type:String,
        default:null,
    },
    Email:{
        type:String,
        default:null
    },
    Website:{
        type:String,
        default:null
    },
    Brand:{
        type:[String],
        default:null
    },
    image:{
        type:String,
        default:null
    }
},
 { timestamps: true })

 const Supplier= mongoose.model("Supplier",SupplierSchema);

 module.exports=Supplier;