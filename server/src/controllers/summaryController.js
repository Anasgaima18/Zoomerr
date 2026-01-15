const Transcript = require('../models/Transcript');
const Summary = require('../models/Summary');
const axios = require('axios');

exports.generateSummary = async (req, res) => {
    const { meetingId } = req.params;

    try {
        // 1. Fetch Transcripts
        const transcripts = await Transcript.find({ meetingId }).sort({ timestamp: 1 });

        if (!transcripts || transcripts.length === 0) {
            return res.status(400).json({ msg: 'No transcripts found for this meeting' });
        }

        // 2. Prepare Prompt
        const transcriptText = transcripts.map(t => `${t.speaker}: ${t.text}`).join('\n');

        const systemPrompt = `You are an expert meeting assistant. Analyze the following meeting transcript.
        Output a JSON object with the following structure:
        {
            "content": "A concise summary of the meeting.",
            "risks": ["List of potential risks, threats, or toxicity detected"],
            "actionItems": ["List of action items"]
        }
        Do not include markdown formatting, just the raw JSON.`;

        // 3. Call OpenRouter
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'openai/gpt-3.5-turbo', // Or a better model if available
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: transcriptText }
            ],
            response_format: { type: 'json_object' }
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://zoomerrrrlive.com', // Optional
                'X-Title': 'Zoomerrrrlive'
            }
        });

        const aiResponse = JSON.parse(response.data.choices[0].message.content);

        // 4. Save Summary
        const summary = new Summary({
            meetingId,
            content: aiResponse.content,
            risks: aiResponse.risks,
            actionItems: aiResponse.actionItems
        });

        await summary.save();

        res.json(summary);

    } catch (err) {
        console.error('Summary Generation Error:', err.response?.data || err.message);
        res.status(500).send('Server Error');
    }
};

exports.getSummary = async (req, res) => {
    try {
        const summary = await Summary.findOne({ meetingId: req.params.meetingId });
        if (!summary) return res.status(404).json({ msg: 'Summary not found' });
        res.json(summary);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
