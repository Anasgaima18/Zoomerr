const mongoose = require('mongoose');

const SummarySchema = new mongoose.Schema({
    meetingId: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    risks: [{
        type: String
    }],
    actionItems: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Summary', SummarySchema);
