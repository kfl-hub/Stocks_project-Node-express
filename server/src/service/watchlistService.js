const watchlistModel = require('../model/watchlistModel');

// Create a new watchlist
exports.createWatchlist = async (uid) => {
    try {
        const newWatchlist = new watchlistModel({ uid: uid, stockCodeList: [] });
        await newWatchlist.save();
        return true;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Get a user's watchlist
exports.getWatchlist = async (req, res) => {
    const { uid } = req.user; 

    try {
        const watchlist = await watchlistModel.findOne({uid: uid });
        if (!watchlist) {
            return res.status(404).json({ message: "Watchlist not found." });
        }
        return res.status(200).json(watchlist);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error retrieving watchlist", detail: error });
    }
};

// Update a user's watchlist by adding or removing a stock code
exports.updateWatchlist = async (req, res) => {
    const { uid } = req.user; // Get user ID from request
    const {action, code } = req.params; // Get stock code from URL parameters // Expecting action to be 'add' or 'remove'

    if (!uid || !code || !action) {
        return res.status(400).json({ message: "User ID, stock code, and action are required." });
    }

    try {
        const updateOperation =
            action === 'add'
                ? { $addToSet: { stockCodeList: code } } // Add stock code to array if it doesn't exist
                : { $pull: { stockCodeList: code } }; // Remove stock code from array

        const updatedWatchlist = await watchlistModel.findOneAndUpdate(
            { uid },
            updateOperation,
            { new: true } // Return the updated document
        );

        if (!updatedWatchlist) {
            return res.status(404).json({ message: "Watchlist not found." });
        }

        return res.status(200).json({ message: "Watchlist updated successfully.", watchlist: updatedWatchlist });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error updating watchlist", detail: error });
    }
};

// Delete a user's watchlist
exports.deleteWatchlist = async (uid) => {

    try {
        const deletedWatchlist = await watchlistModel.findOneAndDelete({ uid });

        if (!deletedWatchlist) {
            return false;
        }

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};