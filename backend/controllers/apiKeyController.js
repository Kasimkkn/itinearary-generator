
const ApiKey = require('../models/ApiKey');

exports.createApiKey = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'API key name is required'
            });
        }

        const key = ApiKey.generateKey();

        const apiKey = await ApiKey.create({
            userId: req.user.id,
            key,
            name,
            active: false,
        });

        res.status(201).json({
            success: true,
            message: 'API key created successfully',
            data: {
                id: apiKey._id,
                key: apiKey.key,
                name: apiKey.name,
                active: apiKey.active,
                createdAt: apiKey.createdAt
            }
        });
    } catch (error) {
        console.error('Error creating API key:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create API key',
            error: error.message
        });
    }
};

exports.getUserApiKeys = async (req, res) => {
    try {
        const apiKeys = await ApiKey.find({ userId: req.user.id });

        res.status(200).json({
            success: true,
            count: apiKeys.length,
            data: apiKeys.map(key => ({
                id: key._id,
                name: key.name,
                key: key.key,
                active: key.active,
                lastUsed: key.lastUsed,
                createdAt: key.createdAt
            }))
        });
    } catch (error) {
        console.error('Error getting API keys:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get API keys',
            error: error.message
        });
    }
};

exports.getAllApiKeys = async (req, res) => {
    try {
        const apiKeys = await ApiKey.find().populate('userId', 'name email');

        res.status(200).json({
            success: true,
            count: apiKeys.length,
            data: apiKeys.map(key => ({
                id: key._id,
                key: key.key,
                name: key.name,
                user: key.userId,
                active: key.active,
                lastUsed: key.lastUsed,
                createdAt: key.createdAt
            }))
        });
    } catch (error) {
        console.error('Error getting all API keys:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get all API keys',
            error: error.message
        });
    }
};

exports.deactivateApiKey = async (req, res) => {
    try {
        const keyId = req.params.id;

        const apiKey = await ApiKey.findById(keyId);

        if (!apiKey) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }

        if (req.user.role !== 'admin' && apiKey.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to manage this API key'
            });
        }

        apiKey.active = false;
        await apiKey.save();

        res.status(200).json({
            success: true,
            message: 'API key deactivated successfully',
            data: {
                id: apiKey._id,
                name: apiKey.name,
                key: apiKey.key,
                active: apiKey.active
            }
        });
    } catch (error) {
        console.error('Error deactivating API key:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate API key',
            error: error.message
        });
    }
};

exports.activateApiKey = async (req, res) => {
    try {
        const keyId = req.params.id;

        const apiKey = await ApiKey.findById(keyId);

        if (!apiKey) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }

        if (req.user.role !== 'admin' && apiKey.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to manage this API key'
            });
        }

        apiKey.active = true;
        await apiKey.save();

        res.status(200).json({
            success: true,
            message: 'API key activated successfully',
            data: {
                id: apiKey._id,
                name: apiKey.name,
                key: apiKey.key,
                active: apiKey.active
            }
        });
    } catch (error) {
        console.error('Error activating API key:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to activate API key',
            error: error.message
        });
    }
};

exports.deleteApiKey = async (req, res) => {
    try {
        const keyId = req.params.id;

        const apiKey = await ApiKey.findById(keyId);

        if (!apiKey) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }

        if (req.user.role !== 'admin' && apiKey.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this API key'
            });
        }

        await apiKey.deleteOne();

        res.status(200).json({
            success: true,
            message: 'API key deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting API key:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete API key',
            error: error.message
        });
    }
};