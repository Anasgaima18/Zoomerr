const WebSocket = require('ws');
const Transcript = require('../models/Transcript');
const Call = require('../models/Call');
const Alert = require('../models/Alert');
const { scanForThreats } = require('../utils/threatDetection');
const mongoose = require('mongoose');

module.exports = (io, socket) => {
    let sarvamWs = null;
    let currentCallId = null; // MongoDB ID
    let currentRoomId = null; // LiveKit/UI Room ID
    let currentLanguage = 'en-IN';
    let userId = null;
    let userName = 'Participant';

    // Handle Start Transcription
    socket.on('transcription:start', async ({ roomId, language, user }) => {
        currentRoomId = roomId;
        userId = user?.id || null; // Accessing nested ID if passed
        userName = user?.name || 'Participant';

        console.log(`Starting Sarvam for Room: ${roomId}, User: ${userName}`);

        // 1. Find or Create Call Record
        try {
            // Check if active call exists for this room
            let call = await Call.findOne({ roomId, isActive: true });
            if (!call) {
                call = await Call.create({
                    roomId,
                    participants: [{
                        userId: userId ? new mongoose.Types.ObjectId(userId) : null,
                        name: userName,
                        joinAt: new Date()
                    }]
                });
            } else {
                // Add participant if not exists
                const existingPart = call.participants.find(p =>
                    (userId && p.userId && p.userId.toString() === userId) || p.name === userName
                );
                if (!existingPart) {
                    call.participants.push({
                        userId: userId ? new mongoose.Types.ObjectId(userId) : null,
                        name: userName,
                        joinAt: new Date()
                    });
                    await call.save();
                }
            }
            currentCallId = call._id;
        } catch (err) {
            console.error('Error managing Call record:', err);
        }

        // Map language
        const langCode = language === 'auto' ? 'en-IN' : (language.length === 2 ? `${language}-IN` : language);
        currentLanguage = langCode;

        // Initialize Sarvam WebSocket
        sarvamWs = new WebSocket(`wss://api.sarvam.ai/speech-to-text/ws?model=saarika:v2.5&language-code=${langCode}&sample_rate=16000&input_audio_codec=wav`, {
            headers: {
                'api-subscription-key': process.env.SARVAM_API_KEY || ''
            }
        });

        sarvamWs.on('open', () => {
            console.log('✅ Connected to Sarvam AI');
            socket.emit('transcript:status', { status: 'active', provider: 'sarvam' });
        });

        sarvamWs.on('message', async (data) => {
            try {
                const response = JSON.parse(data);

                if (response.type === 'data' && response.data?.transcript) {
                    const transcriptText = response.data.transcript;
                    if (!transcriptText.trim()) return;

                    // 2. Threat Detection
                    const threats = scanForThreats(transcriptText);
                    if (threats.length > 0) {
                        try {
                            const alert = await Alert.create({
                                callId: currentCallId,
                                userId: userId ? new mongoose.Types.ObjectId(userId) : null,
                                userName,
                                matchedWords: threats,
                                context: transcriptText,
                                severity: 'high' // Logic could be improved
                            });

                            // Emit Alert
                            io.to(currentRoomId).emit('alert:new', {
                                userId,
                                userName,
                                alert
                            });
                        } catch (e) { console.error('Alert processing error:', e); }
                    }

                    // 3. Emit Transcript
                    const segment = {
                        text: transcriptText,
                        isPartial: true,
                        timestamp: Date.now(),
                        language: currentLanguage
                    };

                    io.to(currentRoomId).emit('transcript:new', {
                        userId,
                        userName,
                        segment
                    });

                    // 4. Save Transcript (Debounced/Aggregated in production, distinct segments here)
                    if (currentCallId) {
                        // Find existing transcript doc for user/call or create new
                        let transcriptDoc = await Transcript.findOne({ callId: currentCallId, userId: userId ? new mongoose.Types.ObjectId(userId) : null });

                        if (!transcriptDoc) {
                            transcriptDoc = new Transcript({
                                callId: currentCallId,
                                userId: userId ? new mongoose.Types.ObjectId(userId) : null,
                                userName,
                                segments: []
                            });
                        }

                        transcriptDoc.segments.push({
                            text: transcriptText,
                            startTime: new Date(),
                            endTime: new Date(), // Approximate
                            language: currentLanguage
                        });
                        transcriptDoc.lastUpdatedAt = new Date();
                        await transcriptDoc.save();
                    }
                }
            } catch (e) {
                // Ignore parse errors
            }
        });

        sarvamWs.on('error', (err) => {
            console.error('❌ Sarvam Error:', err);
            socket.emit('transcript:status', { status: 'error', reason: 'Sarvam connection failed' });
        });

        sarvamWs.on('close', () => {
            socket.emit('transcript:status', { status: 'idle' });
        });
    });

    // Handle Audio Chunks
    socket.on('transcription:audio', ({ chunk }) => {
        if (sarvamWs && sarvamWs.readyState === WebSocket.OPEN) {
            const payload = {
                audio: {
                    data: chunk,
                    sample_rate: "16000",
                    encoding: "audio/wav"
                }
            };
            sarvamWs.send(JSON.stringify(payload));
        }
    });

    // Handle Stop
    socket.on('transcription:stop', async () => {
        if (sarvamWs) {
            sarvamWs.close();
            sarvamWs = null;
        }
    });

    // Handle Disconnect
    socket.on('disconnect', async () => {
        if (sarvamWs) sarvamWs.close();
    });

    // Join Room (for broadcasting)
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
    });
};
