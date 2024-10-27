const { default: axios } = require("axios")
const fs = require('fs');

async function getRealTimeStockData() {
    const url = 'http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHKStockData';
    const params = {
        page: '1',
        num: '3000',
        sort: 'symbol',
        asc: '1',
        node: 'qbgg_hk',
        _s_r_a: 'page'
    };

    try {
        const response = await axios.get(url, { params });
        const stocks = response.data;
        return stocks;
    } catch (error) {
        console.error('Error fetching stocks data:', error);
    }
}

//save to local
// async function saveStocksToJson(stocks) {
//     fs.writeFile('stocks.json', JSON.stringify(stocks, null, 2), (err) => {
//         if (err) {
//             console.error('Error writing to JSON file:', err);
//         } else {
//             console.log('Stock data saved to stocks.json');
//         }
//     });
// }

// const getStocks=async()=>{await getRealTimeStockData().then(stocks=>saveStocksToJson(stocks))}

module.exports= getRealTimeStockData;