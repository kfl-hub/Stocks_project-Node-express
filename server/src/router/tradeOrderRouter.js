const express = require('express');
const router = express.Router();
const JwtAuth = require('../middleware/auth/jwtAuth');
const tradeOrderService = require('../service/tradeOrderService'); // Adjust path as necessary

router.use(JwtAuth);

router.get('/:code', tradeOrderService.getTradeOrderByCode); 
router.post('/', tradeOrderService.createTradeOrder); // No need for userId in params since it's in req.user
router.patch('/', tradeOrderService.updateTradeOrder); 
router.delete('/:code', tradeOrderService.deleteTradeOrder); // No need for userId in params since it's in req.user


module.exports = router;