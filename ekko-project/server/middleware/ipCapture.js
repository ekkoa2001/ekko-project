/**
 * Middleware to capture client IP address
 * Handles both direct connections and proxied requests
 * Supports IPv4 and IPv6
 */
function ipCapture(req, res, next) {
  // Try to get IP from X-Forwarded-For header (for proxied requests)
  const forwardedFor = req.headers['x-forwarded-for'];
  
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one (original client)
    req.clientIp = forwardedFor.split(',')[0].trim();
  } else {
    // Fall back to direct connection IP
    req.clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  }

  // Clean up IPv6 localhost format
  if (req.clientIp === '::1' || req.clientIp === '::ffff:127.0.0.1') {
    req.clientIp = '127.0.0.1';
  }

  // Remove IPv6 prefix if present
  if (req.clientIp && req.clientIp.startsWith('::ffff:')) {
    req.clientIp = req.clientIp.substring(7);
  }

  next();
}

module.exports = ipCapture;
