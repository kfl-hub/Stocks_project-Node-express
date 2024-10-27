const express = require('express');
const router = express.Router();
const JwtAuth = require('../middleware/auth/jwtAuth');
const portfolioService = require('../service/portfolioService'); // Adjust path as necessary

router.use(JwtAuth);


router.get('/', portfolioService.getPortfolio); // No need for userId in params since it's in req.user


module.exports = router;