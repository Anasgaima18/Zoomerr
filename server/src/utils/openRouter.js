const axios = require('axios');

/**
 * Summarize text using OpenRouter
 * @param {string} text - Text to summarize
 * @returns {Promise<string>} - Summary
 */
// Cache for free models to avoid fetching on every request
let cachedFreeModels = [];
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const getFreeModels = async () => {
    try {
        if (cachedFreeModels.length > 0 && Date.now() - lastFetchTime < CACHE_DURATION) {
            return cachedFreeModels;
        }

        console.log('Fetching available free models from OpenRouter...');
        const response = await axios.get('https://openrouter.ai/api/v1/models');
        const allModels = response.data.data;

        // Filter for models with 0 pricing
        const freeModels = allModels
            .filter(m => m.pricing.prompt === '0' && m.pricing.completion === '0')
            .map(m => m.id);

        if (freeModels.length > 0) {
            cachedFreeModels = freeModels;
            lastFetchTime = Date.now();
            console.log(`Found ${freeModels.length} free models:`, freeModels.slice(0, 3), '...');
            return freeModels;
        }
    } catch (err) {
        console.error('Error fetching models list:', err.message);
    }

    // Fallback if fetch fails
    return [
        'google/gemini-2.0-flash-exp:free',
        'meta-llama/llama-3-8b-instruct:free',
        'microsoft/phi-3-mini-128k-instruct:free',
        'huggingfaceh4/zephyr-7b-beta:free',
        'openchat/openchat-7b:free'
    ];
};

const summarizeText = async (text) => {
    // Get currently available free models
    const models = await getFreeModels();

    // Prioritize "smart" models if available in the free list
    const preferredOrder = ['gemini', 'llama-3', 'mistral', 'phi', 'zephyr'];
    const sortedModels = models.sort((a, b) => {
        const aIndex = preferredOrder.findIndex(p => a.includes(p));
        const bIndex = preferredOrder.findIndex(p => b.includes(p));
        // If both in preference list, sort by index
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        // If a is in list, it comes first
        if (aIndex !== -1) return -1;
        // If b is in list, it comes first
        if (bIndex !== -1) return 1;
        return 0;
    });

    for (const model of sortedModels) {
        try {
            console.log(`Attempting summary with model: ${model}`);
            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: model,
                    messages: [
                        {
                            role: 'system',
                            content: `You are a meeting transcript summarizer. 

STRICT RULES:
1. ONLY summarize what was ACTUALLY said in the transcript below.
2. DO NOT invent, hallucinate, or add ANY content that is not explicitly in the transcript.
3. If the transcript is short (1-2 sentences), provide a proportionally short summary.
4. If there are no action items or decisions, say "None identified."
5. Use the exact speaker names from the transcript.
6. Be literal and accurate, NOT creative.

Format:
## Summary
[Brief summary of what was discussed]

## Speakers
[List speakers mentioned]

## Key Points
[Only points actually mentioned]

## Action Items
[Only if explicitly stated, otherwise "None identified"]`
                        },
                        {
                            role: 'user',
                            content: `Transcript to summarize:\n\n${text}`
                        }
                    ],
                    temperature: 0.1
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        'HTTP-Referer': 'https://zoomervideocall.com',
                        'X-Title': 'Zoomer Video Call'
                    }
                }
            );

            if (response.data?.choices?.[0]?.message?.content) {
                return response.data.choices[0].message.content;
            }
        } catch (error) {
            console.error(`OpenRouter Error (${model}):`, error.response?.data || error.message);
            // Verify 401
            if (error.response?.status === 401) {
                throw new Error('Summary Service Unauthorized (Check API Key)');
            }
            // Continue to next model unless it's the last one
            if (model === sortedModels[sortedModels.length - 1]) {
                throw new Error('Failed to generate summary after multiple attempts');
            }
        }
    }
};

module.exports = { summarizeText };
