const mongoose = require('mongoose');

const commentModel = new mongoose.Schema({
uid:{
    type:String,
    required:true,
},
code:{
    type:String,
    required:true,
},
content:{
    type:String,
    required:true,
    maxlength:500
}
},
{timestamps:true});


module.exports=mongoose.model('Comment',commentModel);

