const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
uid:{
    type:Number,
    required:true,
    unique:true
},
stocks:[
    {
        code:String,
        quantity:Number,
        averagePrice:Number
    }
]
},
{timestamps:true});


module.exports=mongoose.model('Portfolio',portfolioSchema);

