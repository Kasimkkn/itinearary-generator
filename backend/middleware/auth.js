const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiKey = require('../models/ApiKey');

exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id);

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route',
                error: error.message
            });
        }
    } catch (error) {
        next(error);
    }
};

exports.validateApiKey = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: 'API key is required'
            });
        }

        const keyData = await ApiKey.findOne({ active: true, key: apiKey });

        console.log('keyData', keyData);

        if (!keyData) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or inactive API key'
            });
        }

        keyData.lastUsed = Date.now();
        await keyData.save();

        req.userId = keyData.userId;

        next();
    } catch (error) {
        next(error);
    }
};

exports.isAdmin = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied: Admin privileges required'
        });
    }
    next();
};