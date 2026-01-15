const mongoose = require('mongoose');

const TranscriptSchema = new mongoose.Schema({
    callId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Call',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userName: String,
    segments: [{
        text: String,
        startTime: Date,
        endTime: Date,
        language: String,
        confidence: Number
    }],
    createdAt: {
        type: Date, // First segment time
        default: Date.now
    },
    lastUpdatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transcript', TranscriptSchema);
