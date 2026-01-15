const THREAT_KEYWORDS = [
    'kill', 'murder', 'bomb', 'attack', 'shoot', 'weapon',
    'threat', 'harm', 'die', 'suicide', 'terrorist', 'explode'
];

/**
 * Scans text for threatening keywords
 * @param {string} text - The transcript text to scan
 * @returns {Array<string>} - Array of found keywords
 */
const scanForThreats = (text) => {
    if (!text) return [];

    const lowerText = text.toLowerCase();
    const found = THREAT_KEYWORDS.filter(word => {
        // Simple regex to match whole words or words within boundaries
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(lowerText);
    });

    return found;
};

module.exports = {
    scanForThreats,
    THREAT_KEYWORDS
};
