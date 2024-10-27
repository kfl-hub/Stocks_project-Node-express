const TradeOrder = require('../model/tradeOrderModel'); // Adjust path as necessary
const stockModel = require('../model/stockModel'); // Adjust path as necessary
const stockService = require('./stockService'); // Adjust path as necessary
const UserService = require('./userService'); // Adjust path as necessary
const TransactionService = require('./transactionService'); // Adjust path as necessary
const PortfolioService = require('./portfolioService'); // Adjust path as necessary
const mongoose = require('mongoose');
const tradeOrderModel = require('../model/tradeOrderModel');


exports.getTradeOrderByCode = async (req, res) => {

    const { uid } = req.user; // Extract uid from authenticated user
    const { code } = req.params;

    try {
        const tradeOrder = await tradeOrderModel.findOne({ uid: uid, code: code })
        if (tradeOrder) {
            return res.status(200).json(tradeOrder)
        }
        return res.status(400).json({ message: 'Trade order not found.' });
    } catch (error) {
        console.error('Deleting trade order error. ' + error)
        return res.status(500).json({ message: 'Error getting trade order.' });
    }
};

// Create a new trade order
exports.createTradeOrder = async (req, res) => {

    const { uid } = req.user; // Extract uid from authenticated user
    const { code, transactionType, quantity, pricePerShare } = req.body; // Extract data from request body

    if (!code || !transactionType || !quantity || !pricePerShare) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // if(!stockService.isTradingHours()){
    //     return res.status(400).json({ message: 'Outside trading hours.' });
    // }

    if (await isOrderExisted(uid, code)) {
        return res.status(400).json({ message: 'Only one order can exist at the same time for this stock.' });
    }

    const session = await mongoose.startSession(); // Start a session for transaction
    session.startTransaction(); // Begin transaction

    try {
        // Fetch current stock data
        const stock = await stockModel.findOne({ code }).session(session);
        if (!stock) {
            await session.abortTransaction(); // Abort transaction if stock not found
            return res.status(404).json({ message: 'Stock not found.' });
        }

        const currentPrice = stock.lasttrade; // Assuming lasttrade is the current price
        const totalValue = quantity * pricePerShare; // Calculate total value of the transaction

        // Check if the order meets price conditions
        let meetsCondition = false;

        if (transactionType === 'buy' && pricePerShare >= currentPrice) {
            meetsCondition = true; // Buy order meets condition
        } else if (transactionType === 'sell' && pricePerShare <= currentPrice) {
            meetsCondition = true; // Sell order meets condition
        }

        if (meetsCondition) {
            if (transactionType === 'buy') {

                const hasBalance = await UserService.hasSufficientBalance(uid, totalValue);

                if (!hasBalance) {
                    await session.abortTransaction(); // Abort transaction if insufficient balance
                    return res.status(400).json({ message: 'Insufficient balance for this transaction.' });
                }
                await UserService.updateUserBalance(uid, -totalValue); // Deduct total value from user's balance
                // Create a transaction using Transaction Service


                // Update user's portfolio using Portfolio Service
                await PortfolioService.updatePortfolio(uid, { code, quantity, averagePrice: pricePerShare }, session); // Pass session to ensure it's part of the transaction

            } else if (transactionType === 'sell') {
                // Check if user has enough stocks to sell
                const portfolio = await PortfolioService.getPortfolioByUid(uid, session);
                const existingStock = portfolio.stocks.find(stock => stock.code === code);

                if (!existingStock || existingStock.quantity < quantity) {
                    await session.abortTransaction(); // Abort transaction if insufficient stocks
                    return res.status(400).json({ message: 'Insufficient stocks to sell.' });
                }

                // Update user's balance with proceeds from sale
                await UserService.updateUserBalance(uid, totalValue); // Add total value to user's balance

                // Update portfolio by reducing stock quantity
                existingStock.quantity -= quantity;

                if (existingStock.quantity === 0) {
                    portfolio.stocks = portfolio.stocks.filter(stock => stock.code !== code); // Remove stock if quantity is zero
                }

                await portfolio.save({ session }); // Save updated portfolio within the session
            }

            await TransactionService.createTransaction({
                uid,
                code,
                transactionType,
                quantity,
                pricePerShare,
                totalValue,
                timestamp: new Date(),
            }, session); // Pass session to ensure it's part of the transaction

            await session.commitTransaction(); // Commit the transaction if all operations succeed
            return res.status(201).json({ message: 'Transaction completed successfully.' });
        } else {
            // Save the trade order since conditions are not met
            const newTradeOrder = new TradeOrder({
                uid,
                code,
                transactionType,
                quantity,
                pricePerShare,
            });

            const savedTradeOrder = await newTradeOrder.save({ session }); // Save trade order within the session
            await session.commitTransaction(); // Commit the transaction for saving trade order
            return res.status(201).json(savedTradeOrder);
        }
    } catch (error) {
        console.error('Error creating trade order:', error.message);
        await session.abortTransaction(); // Abort the transaction on error
        return res.status(500).json({ message: 'Error creating trade order.' });
    } finally {
        session.endSession(); // End the session after completion of operations
    }
};

exports.updateTradeOrder = async (req, res) => {
    const { uid } = req.user; // Extract uid from authenticated user
    const { _id, transactionType, quantity, pricePerShare } = req.body; // Extract data from request body

    if (!_id || !transactionType || !quantity || !pricePerShare) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const session = await mongoose.startSession(); // Start a session for transaction
    session.startTransaction(); // Begin transaction

    try {
        // Fetch the existing trade order
        const existingOrder = await TradeOrder.findById(_id).session(session);

        if (!existingOrder || existingOrder.uid !== ('' + uid)) {
            await session.abortTransaction(); // Abort transaction if order not found or doesn't belong to user
            return res.status(404).json({ message: 'Trade order not found or does not belong to you.' });
        }

        // Fetch current stock data
        const stock = await stockModel.findOne({ code: existingOrder.code }).session(session);
        if (!stock) {
            await session.abortTransaction(); // Abort transaction if stock not found
            return res.status(404).json({ message: 'Stock not found.' });
        }
        const currentPrice = stock.lasttrade; // Assuming lasttrade is the current price


        const totalValue = quantity * pricePerShare; // Calculate total value of the transaction
        if(transactionType==='buy'){
            const hasBalance = await UserService.hasSufficientBalance(uid, totalValue);
            if (!hasBalance) {
                await session.abortTransaction(); // Abort transaction if insufficient balance
                return res.status(400).json({ message: 'Insufficient balance for this transaction.' });
            }
        } else if (transactionType==='sell'){
            if (existingOrder.quantity!==Number(quantity)) {
                const portfolio=await PortfolioService.getPortfolioByUid(uid,session);
                const existingStock = portfolio.stocks.find(stock => stock.code === existingOrder.code);
                if(Number(quantity)>existingStock.quantity ){
                    return res.status(400).json({ message: 'Insufficient stocks to sell.' });
                }
            }
        }else{
            return res.status(400).json({ message: 'transactin type should be "buy" or "sell".' });
        }



        // Check if the order meets price conditions
        let meetsCondition = false;

        if (transactionType === 'buy' && pricePerShare >= currentPrice) {
            meetsCondition = true; // Buy order meets condition
        } else if (transactionType === 'sell' && pricePerShare <= currentPrice) {
            meetsCondition = true; // Sell order meets condition
        }

        if (meetsCondition) {
            if (transactionType === 'buy') {

                await UserService.updateUserBalance(uid, -totalValue); // Deduct total value from user's balance

                // Create a transaction using Transaction Service
                await TransactionService.createTransaction({
                    uid,
                    code: existingOrder.code,
                    transactionType,
                    quantity,
                    pricePerShare,
                    totalValue
                }, session); // Pass session to ensure it's part of the transaction

                // Update user's portfolio using Portfolio Service
                await PortfolioService.updatePortfolio(uid, { code: existingOrder.code, quantity, averagePrice: pricePerShare }, session);
                await tradeOrderModel.findByIdAndDelete(_id, session);
                

            } else if (transactionType === 'sell') {
                const portfolio = await PortfolioService.getPortfolioByUid(uid, session);
                const existingStock = portfolio.stocks.find(stock => stock.code === existingOrder.code);

                if (!existingStock || existingStock.quantity < quantity) {
                    await session.abortTransaction(); // Abort transaction if insufficient stocks
                    return res.status(400).json({ message: 'Insufficient stocks to sell.' });
                }

                await UserService.updateUserBalance(uid, totalValue); // Add total value to user's balance

                existingStock.quantity -= quantity;
                if (existingStock.quantity === 0) {
                    portfolio.stocks = portfolio.stocks.filter(stock => stock.code !== existingOrder.code); // Remove stock if quantity is zero
                }
                console.log('check2')
                await portfolio.save({ session }); // Save updated portfolio within the session
                await tradeOrderModel.findByIdAndDelete(_id, session);
            }
        } else {
            // Update the trade order details
            existingOrder.transactionType = transactionType;
            existingOrder.quantity = quantity;
            existingOrder.pricePerShare = pricePerShare;
            await existingOrder.save({ session }); // Save updated trade order within the session

            await session.commitTransaction(); // Commit the transaction if all operations succeed
            return res.status(200).json({ message: 'Trade order updated successfully, waiting for execute. ', updatedOrder: existingOrder });
        }
            await session.commitTransaction(); // Commit the transaction if all operations succeed
            return res.status(200).json({ message: 'Trade order executed. ' });


    } catch (error) {
        console.error('Error updating trade order:', error.message);
        await session.abortTransaction(); // Abort the transaction on error
        return res.status(500).json({ message: 'Error updating trade order.' });
    } finally {
        session.endSession(); // End the session after completion of operations
    }
};

exports.deleteTradeOrder = async (req, res) => {

    const { uid } = req.user; // Extract uid from authenticated user
    const { code } = req.params;

    try {
        const deletedTradeOrder = await tradeOrderModel.findOneAndDelete({ uid: uid, code: code })
        if (deletedTradeOrder) {
            return res.status(200).json({ message: 'delete successfully.', deletedTradeOrder })
        }
        return res.status(400).json({ message: 'Trade order not found.' });
    } catch (error) {
        console.error('Deleting trade order error. ' + error)
        return res.status(500).json({ message: 'Error deleting trade order.' });
    }
};

const isOrderExisted = async (uid, code) => {
    const existingOrder = await TradeOrder.findOne({ uid, code });
    return existingOrder !== null; // Return true if an order exists, false otherwise
};