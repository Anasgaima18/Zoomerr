const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Call = require('../models/Call');
const Alert = require('../models/Alert');
const Transcript = require('../models/Transcript');
const User = require('../models/User');
const os = require('os');

// ... (existing imports)

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (should add admin middleware in production)
router.get('/stats', auth, async (req, res) => {
    try {
        // Active calls count
        const activeCalls = await Call.countDocuments({ isActive: true });

        // Total transcriptions
        const totalTranscriptions = await Transcript.countDocuments();

        // Get alerts in last 24 hours
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentAlerts = await Alert.countDocuments({
            createdAt: { $gte: last24Hours }
        });

        // Calculate system load (Real OS metrics)
        const cpus = os.cpus().length;
        const loadAvg = os.loadavg()[0]; // 1 minute load average
        // Normalize load percentage (0-100)
        // A load of 1.0 means full utilization of 1 CPU core.
        const systemLoadPercent = Math.min(Math.floor((loadAvg / cpus) * 100), 100);

        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const memUsage = Math.floor(((totalMem - freeMem) / totalMem) * 100);

        // Determine threat level based on alerts
        let threatLevel = 'LOW';
        if (recentAlerts > 10) threatLevel = 'MEDIUM';
        if (recentAlerts > 50) threatLevel = 'HIGH';

        res.json({
            activeCalls,
            totalTranscriptions,
            threatLevel,
            threatDescription: threatLevel === 'LOW' ? 'System Normal' : threatLevel === 'MEDIUM' ? 'Monitoring' : 'Review Required',
            systemLoad: `${systemLoadPercent}%`, // CPU Load
            memoryUsage: `${memUsage}%`, // Memory Usage
            uptime: Math.floor(os.uptime() / 60) + 'm',
            recentAlerts
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/admin/sessions
// @desc    Get high-risk sessions
// @access  Private
router.get('/sessions', auth, async (req, res) => {
    try {
        // Get calls with high-risk alerts
        const highRiskAlerts = await Alert.find({
            severity: { $in: ['high', 'critical'] }
        })
            .populate('callId')
            .sort({ createdAt: -1 })
            .limit(10);

        const sessions = highRiskAlerts.map(alert => ({
            id: alert.callId?.roomId || 'Unknown',
            risk: alert.severity === 'critical' ? 92 : 85,
            participants: alert.callId?.participants?.length || 0,
            duration: '45m', // Calculate from call start/end in production
            topic: alert.type,
            flags: [alert.type, alert.message]
        }));

        res.json(sessions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/admin/security-feed
// @desc    Get recent security alerts
// @access  Private
router.get('/security-feed', auth, async (req, res) => {
    try {
        const alerts = await Alert.find()
            .populate('callId', 'roomId')
            .sort({ createdAt: -1 })
            .limit(20);

        const feed = alerts.map(alert => ({
            priority: alert.severity === 'critical' ? 'critical' :
                alert.severity === 'high' ? 'warning' : 'info',
            title: alert.type,
            time: getTimeAgo(alert.createdAt),
            desc: alert.message,
            roomId: alert.callId?.roomId
        }));

        res.json(feed);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/admin/analytics
// @desc    Get anomaly detection chart data
// @access  Private
router.get('/analytics', auth, async (req, res) => {
    try {
        const { period = '7d' } = req.query;

        let days = 7;
        if (period === '24h') days = 1;
        if (period === '30d') days = 30;

        const data = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const count = await Transcript.countDocuments({
                createdAt: { $gte: date, $lt: nextDate }
            });

            data.push({
                time: days === 1 ? `${i}h ago` : date.toLocaleDateString('en-US', { weekday: 'short' }),
                value: count
            });
        }

        res.json(data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private
router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/admin/transcriptions
// @desc    Get all transcriptions/calls
// @access  Private
router.get('/transcriptions', auth, async (req, res) => {
    try {
        const calls = await Call.find()
            .sort({ startedAt: -1 })
            .limit(50); // Limit for performance

        // Mocking transcript status since we might not have actual transcript objects for all
        // In a real app, we'd lookup the Transcript model
        const callsWithData = await Promise.all(calls.map(async (call) => {
            const transcriptCount = await Transcript.countDocuments({ callId: call._id });
            return {
                ...call.toObject(),
                transcriptCount
            };
        }));

        res.json(callsWithData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Helper function
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return `${seconds} secs ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

module.exports = router;
