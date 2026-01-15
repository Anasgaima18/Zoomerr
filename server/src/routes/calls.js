const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Call = require('../models/Call');
const Transcript = require('../models/Transcript');
const Alert = require('../models/Alert');
const { summarizeText } = require('../utils/openRouter');
const auth = require('../middleware/auth');
const debugLog = require('../utils/debugLogger');

// @route   GET /api/calls/history
// @desc    Get paginated call history with filters
// @access  Private
router.get('/history', auth, async (req, res) => {
    try {
        const { search = '', status = 'all', page = 1, limit = 6 } = req.query;

        let query = { 'participants.userId': req.user.id };

        // Apply search filter
        if (search) {
            query.$or = [
                { roomId: { $regex: search, $options: 'i' } }
            ];
        }

        // Get all calls matching criteria
        const calls = await Call.find(query)
            .populate('participants', 'name')
            .sort({ createdAt: -1 });

        // Get alerts and transcripts for status filtering
        const callsWithStatus = await Promise.all(calls.map(async (call) => {
            const alerts = await Alert.find({ callId: call._id, severity: { $in: ['high', 'critical'] } });

            return {
                id: call.roomId,
                date: call.createdAt.toLocaleDateString(),
                time: call.createdAt.toLocaleTimeString(),
                participants: call.participants.map(p => p.name),
                duration: call.endTime ?
                    Math.floor((call.endTime - call.startTime) / 60000) + 'm' :
                    'Ongoing',
                status: alerts.length > 0 ? 'Flagged' : 'Safe',
                risk: alerts.length > 2 ? 'High' : alerts.length > 0 ? 'Medium' : 'Low',
                _id: call._id
            };
        }));

        // Filter by status
        const filteredCalls = status === 'all' ? callsWithStatus :
            status === 'safe' ? callsWithStatus.filter(c => c.status === 'Safe') :
                status === 'flagged' ? callsWithStatus.filter(c => c.status === 'Flagged') :
                    callsWithStatus;

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedCalls = filteredCalls.slice(startIndex, endIndex);

        res.json({
            calls: paginatedCalls,
            total: filteredCalls.length,
            page: parseInt(page),
            totalPages: Math.ceil(filteredCalls.length / limit)
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/calls/:callId/summarize
// @desc    Generate summary for a call
// @access  Private
router.post('/:callId/summarize', async (req, res) => {
    debugLog('Request received: POST /summarize', { params: req.params });
    try {
        const { callId } = req.params;

        let call;
        if (mongoose.Types.ObjectId.isValid(callId)) {
            call = await Call.findOne({ _id: callId });
        }

        if (!call) {
            call = await Call.findOne({ roomId: callId, isActive: true });
        }

        if (!call) {
            debugLog('Call not found', { callId });
            return res.status(404).json({ msg: 'Call not found' });
        }

        const transcripts = await Transcript.find({ callId: call._id }).populate('userId', 'name');
        debugLog(`Found transcripts: ${transcripts.length}`, { callId: call._id });

        if (!transcripts || transcripts.length === 0) {
            return res.status(400).json({ msg: 'No transcripts found for this call' });
        }

        const fullText = transcripts.map(t => {
            const userName = t.userName || t.userId?.name || 'Unknown';
            const userSegments = t.segments.map(s => `${userName}: ${s.text}`).join('\n');
            return userSegments;
        }).join('\n\n');

        debugLog('Combined text length', { length: fullText.length });

        debugLog('Generating summary via OpenRouter...');
        const summary = await summarizeText(fullText);
        debugLog('Summary generation successful', { summaryLength: summary?.length });

        res.json({ summary });
    } catch (err) {
        debugLog('Summarize Route Error', err);
        console.error('Summarize Route Error:', err.message);
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
});

// @route   GET /api/calls/:callId/transcripts
router.get('/:callId/transcripts', async (req, res) => {
    try {
        const { callId } = req.params;

        let call;
        if (mongoose.Types.ObjectId.isValid(callId)) {
            call = await Call.findOne({ _id: callId });
        }

        if (!call) {
            call = await Call.findOne({ roomId: callId }).sort({ startedAt: -1 }).limit(1);
        }

        if (!call) return res.status(404).json({ msg: 'Call not found' });

        const transcripts = await Transcript.find({ callId: call._id });
        res.json(transcripts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/calls/:callId/alerts
router.get('/:callId/alerts', async (req, res) => {
    try {
        const { callId } = req.params;

        let call;
        if (mongoose.Types.ObjectId.isValid(callId)) {
            call = await Call.findOne({ _id: callId });
        }

        if (!call) {
            call = await Call.findOne({ roomId: callId }).sort({ startedAt: -1 }).limit(1);
        }

        if (!call) return res.status(404).json({ msg: 'Call not found' });

        const alerts = await Alert.find({ callId: call._id }).populate('userId', 'name');
        res.json(alerts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/calls/:callId
// @desc    Delete a call record
// @access  Private
router.delete('/:callId', auth, async (req, res) => {
    try {
        const { callId } = req.params;
        const call = await Call.findById(callId);

        if (!call) {
            return res.status(404).json({ msg: 'Call not found' });
        }

        // Check ownership (participants includes user)
        // Since we are using embedded docs now, we need to check if ANY participant matches
        // But for deletion, usually only admin or host can delete?
        // For personal history, maybe just hide it? 
        // Let's assume hard delete for now if user was a participant.
        const isParticipant = call.participants.some(p => p.userId.toString() === req.user.id);

        if (!isParticipant) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Call.findByIdAndDelete(callId);
        // Optionally delete associated transcripts/alerts
        await Transcript.deleteMany({ callId: call._id });
        await Alert.deleteMany({ callId: call._id });

        res.json({ msg: 'Call deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
