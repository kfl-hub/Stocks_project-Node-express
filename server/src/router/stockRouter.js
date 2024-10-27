const express = require('express');
const router = express.Router();
const stockService = require('../service/stockService'); // Adjust path as necessary



router.get('/:code', stockService.getStockByCode);


module.exports = router;