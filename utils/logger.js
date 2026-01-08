/**
 * Simple logging utility
 */
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
}

const logger = {
  info: (message, data) => log('info', message, data),
  error: (message, data) => log('error', message, data),
  warn: (message, data) => log('warn', message, data),
  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      log('debug', message, data);
    }
  }
};

module.exports = logger;
