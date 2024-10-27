const express = require('express');
require('dotenv').config();
const connectDB=require('./config/mongodb')
const userRouter = require('./router/userRouter');
const watchlistRouter = require('./router/watchlistRouter');
const stockRouter = require('./router/stockRouter');
const commentRouter = require('./router/commentRouter');
const tradeOrderRouter = require('./router/tradeOrderRouter');
const portfolioRouter = require('./router/portfolioRouter');
const cookieParser=require('cookie-parser')
const {getStocks}=require('./service/stockService')
const app=express();
const port=3000;

connectDB();

//  const intervalId = setInterval(async () => {
//     try {
//         await getStocks();
//     } catch (error) {
//         console.error("Error fetching stocks:", error);
//     }
// }, 5000);

app.use(express.json());
app.use(cookieParser());

app.use('/api/user',userRouter);
app.use('/api/watchlist',watchlistRouter);
app.use('/api/stock',stockRouter);
app.use('/api/comment',commentRouter);
app.use('/api/trade_Order',tradeOrderRouter);
app.use('/api/portfolio',portfolioRouter);

app.get('*', (req, res) => {
    res.status(404).send('404 not found')
return 	
});


app.listen(port,()=>console.log('Stocks server running on port: '+port))