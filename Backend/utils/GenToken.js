const jwt =require("jsonwebtoken")
const key="5cdd57e209924cada574b5ffb11a2ec64fc8d58ee2e796b8612ab24d6d64873b9637f9dfc0d8692e157041325c57a29ed07569ca0b63b45947a9a6352faf08c1"
module.exports.GenToken=({id})=>{
    return jwt.sign({id},key)
}   