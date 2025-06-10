const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    key: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'API key name is required'],
        trim: true
    },
    active: {
        type: Boolean,
        default: true
    },
    lastUsed: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

apiKeySchema.statics.generateKey = function () {
    return crypto.randomBytes(32).toString('hex');
};

module.exports = mongoose.model('ApiKey', apiKeySchema);