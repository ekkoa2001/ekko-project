const { activityLogsDb } = require('../db');
const { v4: uuidv4 } = require('uuid');

/**
 * Log activity to database
 */
async function logActivity(userId, actionType, metadata = {}, success = true, req) {
  try {
    await activityLogsDb.read();
    
    const log = {
      id: uuidv4(),
      userId,
      actionType,
      ipAddress: req.clientIp || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Unknown',
      metadata,
      success,
      createdAt: new Date().toISOString()
    };

    activityLogsDb.data.logs.push(log);
    await activityLogsDb.write();
    
    return log;
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

/**
 * Middleware to log all requests
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.clientIp}`);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
}

module.exports = {
  logActivity,
  requestLogger
};
