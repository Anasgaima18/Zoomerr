const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: '',
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    bio: {
        type: String,
        default: '',
    },
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            meeting: { type: Boolean, default: true },
            chat: { type: Boolean, default: true },
        },
        theme: { type: String, default: 'dark' },
    },
    integrations: {
        slack: { type: Boolean, default: false },
        google: { type: Boolean, default: false },
        zoom: { type: Boolean, default: false },
        teams: { type: Boolean, default: false },
        notion: { type: Boolean, default: false },
        zapier: { type: Boolean, default: false },
    },
    billing: {
        plan: { type: String, default: 'free' }, // free, pro, enterprise
        status: { type: String, default: 'active' },
        periodEnd: { type: Date },
    },
    security: {
        twoFactorEnabled: { type: Boolean, default: false },
        lastPasswordChange: { type: Date },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', UserSchema);
