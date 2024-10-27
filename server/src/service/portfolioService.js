const PortfolioModel = require('../model/portfolioModel');


exports.getPortfolio = async (req,res) => {
    const {uid} =req.user;
    const portfolio= await PortfolioModel.findOne({ uid: uid });
    try {
        if (portfolio) {
            return res.status(200).json(portfolio)
        }
        return res.status(400).json({message:"Portfolio not found."})    
    } catch (error) {
        console.error("Get portfolio error. "+error)
        return res.status(500).json({message:"Get portfolio error."})    
    }
    

};

exports.createPortfolio = async (uid) => {
    try {
        const newPortfolio = new PortfolioModel({ uid: uid, stocks: [] });
        await newPortfolio.save();
        return true;
    } catch (error) {
        console.error(error);
        throw error;

    }
};

exports.getPortfolioByUid = async (uid, session) => {
    return await PortfolioModel.findOne({ uid: uid }).session(session);
};

exports.updatePortfolio = async (uid, stockData, session) => {
    try {
        const portfolio = await PortfolioModel.findOne({ uid: uid }).session(session);
        if (portfolio) {
            const existingStock = portfolio.stocks.find(stock => stock.code === stockData.code);
            if (existingStock) {
                stockData.quantity = Number(stockData.quantity);
                stockData.averagePrice = Number(stockData.averagePrice);

                existingStock.quantity += stockData.quantity;

                existingStock.averagePrice = ((existingStock.averagePrice * existingStock.quantity) + (stockData.averagePrice * stockData.quantity)) / (existingStock.quantity + stockData.quantity);

            } else {
                portfolio.stocks.push(stockData);
            }
            await portfolio.save({ session });
        } else {
            const newPortfolio = new PortfolioModel({
                uid: uid,
                stocks: [stockData],
            });
            await newPortfolio.save({ session });
        }
    } catch (error) {
        console.error('Error updating portfolio:', error.message);
        throw error;
    }
};

