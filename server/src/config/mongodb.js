const mongoose = require('mongoose');

const connectDB=async()=>{

try {
    mongoose.set('strictQuery', false);
    const db= await mongoose.connect(process.env.MONGODB_URL)
    console.log(`DB Connected: ${db.connection.host}`)
} catch (error) {
    console.log(error)
}
}

module.exports=connectDB;