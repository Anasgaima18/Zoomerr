const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ScheduledMeeting = require('../models/ScheduledMeeting');

// @route   GET /api/scheduler/meetings
// @desc    Get all user's scheduled meetings
// @access  Private
router.get('/meetings', auth, async (req, res) => {
    try {
        const { month, year } = req.query;

        let query = { userId: req.user.id };

        // Filter by month/year if provided
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            query.date = { $gte: startDate, $lte: endDate };
        }

        const meetings = await ScheduledMeeting.find(query)
            .populate('participants', 'name email avatar')
            .sort({ date: 1, time: 1 });

        res.json(meetings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/scheduler/meetings
// @desc    Create new scheduled meeting
// @access  Private
router.post('/meetings', auth, async (req, res) => {
    const { title, date, startTime, recurrence, duration } = req.body;

    try {
        if (!title || !date || !startTime) {
            return res.status(400).json({ msg: 'Title, date, and start time are required' });
        }

        const meeting = new ScheduledMeeting({
            userId: req.user.id,
            title,
            date: new Date(date),
            startTime,
            recurrence: recurrence || 'Does not repeat',
            duration: duration || '30 min',
            meetingLink: `https://nexus-meet.com/${Math.random().toString(36).substring(7)}`, // Generate mock link for now or use real one
            description: '',
            type: 'video'
        });

        await meeting.save();

        res.json(meeting);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/scheduler/upcoming
// @desc    Get upcoming meetings for sidebar
// @access  Private
router.get('/upcoming', auth, async (req, res) => {
    try {
        const now = new Date();
        const upcomingMeetings = await ScheduledMeeting.find({
            userId: req.user.id,
            date: { $gte: now },
            status: 'scheduled'
        })
            .sort({ date: 1, time: 1 })
            .limit(5)
            .populate('participants', 'name avatar');

        res.json(upcomingMeetings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/scheduler/meetings/:id
// @desc    Update scheduled meeting
// @access  Private
router.put('/meetings/:id', auth, async (req, res) => {
    try {
        const meeting = await ScheduledMeeting.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!meeting) {
            return res.status(404).json({ msg: 'Meeting not found' });
        }

        const { title, date, time, recurrence, status } = req.body;

        if (title) meeting.title = title;
        if (date) meeting.date = new Date(date);
        if (time || req.body.startTime) meeting.startTime = time || req.body.startTime;
        if (recurrence) meeting.recurrence = recurrence;
        if (status) meeting.status = status;

        meeting.updatedAt = Date.now();
        await meeting.save();

        res.json(meeting);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/scheduler/meetings/:id
// @desc    Delete scheduled meeting
// @access  Private
router.delete('/meetings/:id', auth, async (req, res) => {
    try {
        const meeting = await ScheduledMeeting.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!meeting) {
            return res.status(404).json({ msg: 'Meeting not found' });
        }

        res.json({ msg: 'Meeting deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
