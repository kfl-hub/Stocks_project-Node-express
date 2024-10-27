const { AutoIncrementID } = require('@typegoose/auto-increment');
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    _id: {
        type: Number,
    },
    username: {
        type: String,
        unique:true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true,
        default: 100000
    },
    type: {
        type: String,
        default: 'normal'
    }
},
    { timestamps: true });

userSchema.plugin(AutoIncrementID, {});

module.exports = mongoose.model('User', userSchema);




