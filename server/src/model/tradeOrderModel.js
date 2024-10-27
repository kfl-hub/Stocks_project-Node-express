const { AutoIncrementID } = require('@typegoose/auto-increment');
const mongoose = require('mongoose');


const tradeOrderSchema = new mongoose.Schema({
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
}    ,{ timestamps: true });

tradeOrderSchema.plugin(AutoIncrementID, {});

module.exports=mongoose.model('TradeOrder',tradeOrderSchema);



