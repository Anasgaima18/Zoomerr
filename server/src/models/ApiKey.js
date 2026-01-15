const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    service: {
        type: String,
        required: true,
        enum: ['livekit', 'openai']
    },
    keyPreview: {
        type: String, // First 8 chars for display
        required: true
    },
    keyHash: {
        type: String, // Encrypted full key
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ApiKey', ApiKeySchema);
