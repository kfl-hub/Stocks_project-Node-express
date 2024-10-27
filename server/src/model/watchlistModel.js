const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
    },
    stockCodeList: [String], //stock.code

});


module.exports = mongoose.model('Watchlist', watchlistSchema);

