const mongoose = require('mongoose');

const ScheduledMeetingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String, // HH:MM format
        required: true
    },
    duration: {
        type: String, // "30 min", "1 hour"
        default: "30 min"
    },
    type: {
        type: String,
        enum: ['video', 'audio', 'chat'],
        default: 'video'
    },
    participants: [{
        email: String,
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            default: 'pending'
        }
    }],
    meetingLink: {
        type: String
    },
    description: String,
    status: {
        type: String,
        enum: ['scheduled', 'cancelled', 'completed'],
        default: 'scheduled'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ScheduledMeeting', ScheduledMeetingSchema);
