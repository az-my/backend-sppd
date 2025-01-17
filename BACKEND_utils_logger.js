// BACKEND_utils_logger.js
// 📦 Winston Logger Configuration for Error Logging and Tracking

const { createLogger, format, transports } = require('winston');

// ✅ Logger Setup: Console + File Logging + Timestamps
const logger = createLogger({
    level: 'info',  // Default log level
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
    ),
    transports: [
        new transports.Console(),  // Logs to console
        new transports.File({ filename: 'logs/server.log' }) // Logs to a file
    ],
});

// ✅ Export the logger for use across all files
module.exports = logger;
