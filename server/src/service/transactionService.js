const TransactionModel = require('../model/transactionModel'); // Adjust path as necessary

exports.createTransaction = async (transactionData, session) => {
    try {
        const transaction = new TransactionModel(transactionData);
        return await transaction.save({ session }); // Save with session context
    } catch (error) {
        console.error('Error creating transaction:', error.message);
        throw error; // Rethrow error for handling in calling function
    }
};