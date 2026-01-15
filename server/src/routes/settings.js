const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ApiKey = require('../models/ApiKey');
const User = require('../models/User'); // Import User model
const crypto = require('crypto');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

// Helper functions for encryption
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// @route   GET /api/settings/profile
// @desc    Get user profile and settings
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/settings/profile
// @desc    Update user profile (name, email, bio)
// @access  Private
router.put('/profile', auth, async (req, res) => {
    const { name, email, bio } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (name) user.name = name;
        if (email) user.email = email;
        if (bio !== undefined) user.bio = bio;
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/settings/security
// @desc    Update security settings (password, 2FA)
// @access  Private
router.put('/security', auth, async (req, res) => {
    const { currentPassword, newPassword, twoFactorEnabled } = req.body;
    try {
        const user = await User.findById(req.user.id);

        if (newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid current password' });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            user.security.lastPasswordChange = Date.now();
        }

        if (twoFactorEnabled !== undefined) {
            if (!user.security) user.security = {};
            user.security.twoFactorEnabled = twoFactorEnabled;
        }

        await user.save();
        res.json({ msg: 'Security settings updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/settings/notifications
// @desc    Update notification preferences
// @access  Private
router.put('/notifications', auth, async (req, res) => {
    const { email, meeting, chat } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user.preferences) user.preferences = {};
        if (!user.preferences.notifications) user.preferences.notifications = {};

        if (email !== undefined) user.preferences.notifications.email = email;
        if (meeting !== undefined) user.preferences.notifications.meeting = meeting;
        if (chat !== undefined) user.preferences.notifications.chat = chat;

        await user.save();
        res.json(user.preferences.notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/settings/integrations
// @desc    Update integration status
// @access  Private
router.put('/integrations', auth, async (req, res) => {
    const { service, enabled } = req.body; // e.g., { service: 'slack', enabled: true }
    try {
        const user = await User.findById(req.user.id);
        if (!user.integrations) user.integrations = {};

        if (user.integrations[service] !== undefined || service in user.integrations) { // check if key exists in schema default or map
            user.integrations[service] = enabled;
            // Mark modified because integrations might be a nested object or schema mixed type depending on definition
            // but here it is defined in schema so it should be fine.
            // Just in case:
            user.markModified('integrations');
            await user.save();
            res.json(user.integrations);
        } else {
            // Allow adding dynamic integrations if schema permits, or just error
            // Schema has explicit fields so we should probably stick to them or use schema logic
            user.integrations[service] = enabled;
            await user.save();
            res.json(user.integrations);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/settings/billing
// @desc    Update billing plan (mock)
// @access  Private
router.put('/billing', auth, async (req, res) => {
    const { plan } = req.body; // 'free', 'pro', etc.
    try {
        const user = await User.findById(req.user.id);
        if (!user.billing) user.billing = {};
        user.billing.plan = plan;
        await user.save();
        res.json(user.billing);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @desc    Get user's API keys (masked)
// @access  Private
router.get('/keys', auth, async (req, res) => {
    try {
        const keys = await ApiKey.find({ userId: req.user.id, isActive: true });

        const maskedKeys = keys.map(key => ({
            id: key._id,
            service: key.service,
            keyPreview: key.keyPreview + '...',
            createdAt: key.createdAt,
            updatedAt: key.updatedAt
        }));

        res.json(maskedKeys);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/settings/keys
// @desc    Save/update API key
// @access  Private
router.post('/keys', auth, async (req, res) => {
    const { service, key } = req.body;

    try {
        if (!service || !key) {
            return res.status(400).json({ msg: 'Service and key are required' });
        }

        // Check if key already exists for this service
        let apiKey = await ApiKey.findOne({ userId: req.user.id, service, isActive: true });

        const keyPreview = key.substring(0, 8);
        const keyHash = encrypt(key);

        if (apiKey) {
            // Update existing
            apiKey.keyPreview = keyPreview;
            apiKey.keyHash = keyHash;
            apiKey.updatedAt = Date.now();
            await apiKey.save();
        } else {
            // Create new
            apiKey = new ApiKey({
                userId: req.user.id,
                service,
                keyPreview,
                keyHash
            });
            await apiKey.save();
        }

        res.json({
            msg: 'API key saved successfully',
            key: {
                id: apiKey._id,
                service: apiKey.service,
                keyPreview: keyPreview + '...'
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/settings/keys/regenerate
// @desc    Regenerate API key
// @access  Private
router.post('/keys/regenerate', auth, async (req, res) => {
    const { service } = req.body;

    try {
        const apiKey = await ApiKey.findOne({ userId: req.user.id, service, isActive: true });

        if (!apiKey) {
            return res.status(404).json({ msg: 'API key not found' });
        }

        // Generate a new random key (in production, this would integrate with actual service APIs)
        const newKey = 'sk_' + crypto.randomBytes(32).toString('hex');
        const keyPreview = newKey.substring(0, 8);
        const keyHash = encrypt(newKey);

        apiKey.keyPreview = keyPreview;
        apiKey.keyHash = keyHash;
        apiKey.updatedAt = Date.now();
        await apiKey.save();

        res.json({
            msg: 'API key regenerated successfully',
            key: {
                id: apiKey._id,
                service: apiKey.service,
                keyPreview: keyPreview + '...',
                fullKey: newKey // Only returned on generation
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/settings/usage
// @desc    Get usage statistics
// @access  Private
router.get('/usage', auth, async (req, res) => {
    try {
        const Call = require('../models/Call');
        const Transcript = require('../models/Transcript');

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Count calls this month
        const monthlyCalls = await Call.countDocuments({
            'participants.userId': req.user.id,
            createdAt: { $gte: startOfMonth }
        });

        // Count transcripts today
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dailyRequests = await Transcript.countDocuments({
            userId: req.user.id,
            createdAt: { $gte: startOfDay }
        });

        // Count active sessions
        const activeSessions = await Call.countDocuments({
            'participants.userId': req.user.id,
            isActive: true
        });

        res.json({
            monthlyUsage: monthlyCalls,
            monthlyLimit: 100000,
            dailyRequests: dailyRequests,
            activeSessions: activeSessions
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
