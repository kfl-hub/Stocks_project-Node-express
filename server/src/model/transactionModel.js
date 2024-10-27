const { AutoIncrementID } = require('@typegoose/auto-increment');
const mongoose = require('mongoose');


const transactionSchema = new mongoose.Schema({
_id:{
    type:Number,
},
uid:{
    type:String,
    required:true,
},
code:{
    type:String,
    required:true,
},
transactionType:{
    type:String,
    required:true,
},
quantity:{
    type:Number,
    required:true,
},
pricePerShare:{
    type:Number,
    required:true,
},
totalValue:{
    type:Number,
    required:true,
},
timestamp:{
    type:Date,
    required:true,
    default:Date.now
},
});
transactionSchema.plugin(AutoIncrementID, {});
module.exports=mongoose.model('Transaction',transactionSchema);



