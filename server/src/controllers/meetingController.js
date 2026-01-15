const { AccessToken } = require('livekit-server-sdk');
const Meeting = require('../models/Meeting');
const crypto = require('crypto');

const createToken = (roomName, participantName, participantIdentity) => {
    const at = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        {
            identity: participantIdentity,
            name: participantName,
        }
    );

    at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });

    return at.toJwt();
};

exports.startInstantMeeting = async (req, res) => {
    try {
        const meetingId = crypto.randomUUID(); // Simple unique ID

        // Create meeting doc
        const newMeeting = new Meeting({
            meetingId,
            host: req.user.id,
            topic: 'Instant Meeting',
            participants: [req.user.id]
        });

        await newMeeting.save();

        res.json({ meetingId });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.joinMeeting = async (req, res) => {
    const { meetingId } = req.params;

    try {
        const meeting = await Meeting.findOne({ meetingId });
        if (!meeting) {
            return res.status(404).json({ msg: 'Meeting not found' });
        }

        // Generate LiveKit Token
        const token = await createToken(meetingId, req.user.name, req.user.id);

        // Add user to participants if not already
        if (!meeting.participants.includes(req.user.id)) {
            meeting.participants.push(req.user.id);
            await meeting.save();
        }

        res.json({
            token,
            meetingId,
            livekitUrl: process.env.LIVEKIT_URL // Send env var to client just in case (or client uses its own) 
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ meetingId: req.params.meetingId }).populate('host', 'name avatar');
        if (!meeting) return res.status(404).json({ msg: 'Meeting not found' });
        res.json(meeting);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
