const userModel = require('../model/userModel');
const { createPortfolio } = require('./portfolioService');
const {createWatchlist,deleteWatchlist} = require('./watchlistService')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

exports.getUser = async (req, res) => {
    let { uid } = req.user;
    try {
        const user =await userModel.findById(uid);
        if (!user) {
            return res.status(400).json({ message: "user not found." });
        }
        return res.status(200)
        .json
        ({uid:user.id,
            username:user.username,
            email:user.email,
            balance:user.balance,
            type:user.type,
            createdAt:user.createdAt
        });
    } catch (error) {
        console.error('Get user error. '+error)
        return res.status(400).json({ message: "Error getting user." });
    }
}


exports.createUserByEmail = async (req, res) => {
    let { username, email, password } = req.body;

    if (!(email && password)) {
        res.status(400).json({ message: "Missing email or password" });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    try {
        const newUser = new userModel({ username, email, hashedPassword })
        await newUser.save();
        await createWatchlist(newUser._id);
        await createPortfolio(newUser._id);

    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "Create user fail", detail: error })
        return;
    }
    res.status(200).json({ message: "Create user success. " +"Watchlist,Portfolio for new user created successfully." });
    return;
};

exports.loginByEmail = async (req, res) => {
    const { email, password } = req.body;
    let user;
    if (!(email && password)) {
        res.status(400).json({ message: 'required email & password' })
        return;
    }
    try {
        user = await userModel.findOne({ email: email }).exec()
    } catch (err) {
        res.status(400).json({ message: 'Wrong email or password' })
        return;
    }
    if (!user) {
        res.status(400).json({ message: 'Wrong username or password' })
        return;
    }
    if (await isPasswordValid(password, user)) {
        const token = getToken(user);
        res.status(200).json({ token: token })
        return;
    }
    res.status(400).json({ message: 'Wrong email or password' })
    return;
};

exports.loginByUsername = async (req, res) => {
    const { username, password } = req.body;
    let user;
    if (!(username && password)) {
        res.status(400).json({ message: 'required username & password' })
        return;
    }
    try {
        user = await userModel.findOne({ username: username }).exec()
    } catch (err) {
        res.status(400).json({ message: 'Wrong username or password' })
        return;
    }
    if (!user) {
        res.status(400).json({ message: 'Wrong username or password' })
        return;
    }

    if (await isPasswordValid(password, user)) {
        const token = getToken(user);
        res.status(200).json({ token: token })
        //.cookie('token', token, { httpOnly: true ,sameSite:'Strict'})
        return;
    }
    res.status(400).json({ message: 'Wrong username or password' })
    return;
};


exports.changeUsername = async (req, res) => {
    const { newUsername, password } = req.body;
    const { uid } = req.user;

    if (!(uid && newUsername && password)) {
        return res.status(400).json({ message: 'User ID, new username, and password are required' });
    }

    try {
        const user = await userModel.findById(uid);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!isPasswordValid(password, user)) {
            return res.status(400).json({ message: 'Password is incorrect' });
        }

        user.username = newUsername;
        await user.save();

        return res.status(200).json({ message: 'Username updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Error updating username', detail: error });
    }
};

exports.deleteUser = async (req, res) => {
    const { password } = req.body;
    const { uid } = req.user;

    if (!(uid && password)) {
        return res.status(400).json({ message: 'User ID and password are required' });
    }

    try {
        const user = await userModel.findById(uid);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        if (!isPasswordValid(password,user)) {
            return res.status(400).json({ message: 'Password is incorrect' });
        }

        await userModel.findByIdAndDelete(uid);
        await deleteWatchlist(uid);

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting user', detail: error });
    }
};

exports.updateUserBalance = async (uid, amount) => {
    try {
        const user = await userModel.findById(uid); // Fetch user details

        if (!user) throw new Error('User not found');

        user.balance += amount; // Update balance
        await user.save(); // Save updated user balance
        return user; // Return updated user
    } catch (error) {
        console.error('Error updating user balance:', error.message);
        throw error; // Rethrow error for handling in calling function
    }
};

exports.getUserById = async (uid) => {
    return await userModel.findById(uid);
};

exports.hasSufficientBalance = async (uid, totalValue) => {
    const user = await userModel.findById(uid);
    return user && user.balance >= totalValue;
};

function getToken(user) {
    return jwt.sign({
        uid: user._id
        , username: user.username
        , email: user.email
    }, jwtSecret, { expiresIn: '99h' })
}

function isPasswordValid(password, user) { return bcrypt.compare(password, user.hashedPassword) };