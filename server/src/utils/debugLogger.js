const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../debug_server.log');

const log = (message, data = null) => {
    const timestamp = new Date().toISOString();
    let logMsg = `[${timestamp}] ${message}`;
    if (data) {
        if (data instanceof Error) {
            logMsg += `\nERROR: ${data.message}\nSTACK: ${data.stack}`;
        } else {
            try {
                logMsg += `\nDATA: ${JSON.stringify(data, null, 2)}`;
            } catch (e) {
                logMsg += `\nDATA: [Circular or Non-Stringifiable]`;
            }
        }
    }
    logMsg += '\n----------------------------------------\n';

    fs.appendFileSync(logFile, logMsg, 'utf8');
};

module.exports = log;
