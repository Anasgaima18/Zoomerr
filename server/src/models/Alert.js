const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    callId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Call',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userName: String, // Fallback if user ID not available
    matchedWords: [String],
    context: String, // The sentence/segment where words were found
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Alert', AlertSchema);
