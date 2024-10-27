const stockModel = require('../model/stockModel')
const getRealTimeStockData = require('../api/getStocksApi')

exports.getStockByCode = async (req, res) => {
    const { code } = req.params;
    if (!code) {
        res.status(400).json({ message: 'No Stock code provided.' })
        return;
    }
    try {
        const stock = await stockModel.findOne({ code })
        res.status(200).json(stock)
        return;
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error find stock in DB.' })
        return;
    }


}


// Function to get stocks and save them periodically
exports.getStocks = async () => {
    if (!isTradingHours()) {
        console.log("Outside trading hours. Skipping API call.");
        return;
    }

    const stocks = await getRealTimeStockData();

    if (stocks.length > 0) {
        await saveStocksToDb(stocks);
        console.log("Stocks saved to DB.");
    } else {
        console.log("No stocks data available.");
    }
}

async function saveStocksToDb(stocks) {

    const stockDataArray = stocks.map(stock => ({
        code: stock.symbol,  // Map 'symbol' to 'code'
        name: stock.name,
        engname: stock.engname,
        lasttrade: parseFloat(stock.lasttrade),  // Convert string to number
        prevclose: parseFloat(stock.prevclose),
        open: parseFloat(stock.open),
        high: parseFloat(stock.high),
        low: parseFloat(stock.low),
        volume: parseInt(stock.volume, 10),  // Convert string to integer
        currentvolume: parseInt(stock.currentvolume, 10),
        amount: parseFloat(stock.amount),
        ticktime: new Date(stock.ticktime),  // Convert string to Date
        buy: parseFloat(stock.buy),
        sell: parseFloat(stock.sell),
        high_52week: parseFloat(stock.high_52week),
        low_52week: parseFloat(stock.low_52week),
        eps: parseFloat(stock.eps),
        stocks_sum: parseInt(stock.stocks_sum, 10),
        pricechange: parseFloat(stock.pricechange),
        changepercent: parseFloat(stock.changepercent),
        market_value: parseFloat(stock.market_value),
        pe_ratio: stock.pe_ratio ? parseFloat(stock.pe_ratio) : null
    }));

    // Prepare bulk operations for upsert
    const bulkOps = stockDataArray.map(stock => ({
        updateOne: {
            filter: { code: stock.code }, // Filter by code
            update: { $set: stock }, // Update the fields
            upsert: true // Insert if not found
        }
    }));

    try {
        const result = await stockModel.bulkWrite(bulkOps);
        console.log(`Processed ${result.upsertedCount} inserts and ${result.modifiedCount} updates.`);
    } catch (error) {
        console.error('Error saving stocks:', error.message);
    }
}

// Function to check if current time is within trading hours
exports.isTradingHours=()=> {
    const now = new Date();

    const day = now.getDay(); // 0 (Sun) - 6 (Sat)

    // Check if it's Monday (1) to Friday (5)
    if (day < 1 || day > 5) return false;

    const hours = now.getHours();

    // Check for trading hours
    if ((hours >= 9 && hours < 12) ||
        (hours >= 13 && hours < 16)) {
        return true;
    }

    return false;
}



