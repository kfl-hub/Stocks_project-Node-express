const express = require('express');
const router = express.Router();
const JwtAuth = require('../middleware/auth/jwtAuth');
const watchListService = require('../service/watchlistService'); // Adjust path as necessary

router.use(JwtAuth);

// Get a user's watch list
router.get('/', watchListService.getWatchlist); // No need for userId in params since it's in req.user

// Update a user's watch list (add or remove stock)
router.put('/:action/:code', watchListService.updateWatchlist); // Code is now part of URL params

// Delete a user's watch list
router.delete('/', watchListService.deleteWatchlist); // No need for userId in params since it's in req.user

module.exports = router;