const mongoose = require('mongoose');

const CallSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        index: true
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String,
        joinAt: {
            type: Date,
            default: Date.now
        },
        leaveAt: Date
    }],
    isActive: {
        type: Boolean,
        default: true
    }
});

// Indexes for common queries
CallSchema.index({ 'participants.userId': 1, createdAt: -1 });
CallSchema.index({ roomId: 1, isActive: 1 });

module.exports = mongoose.model('Call', CallSchema);
