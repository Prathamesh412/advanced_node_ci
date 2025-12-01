const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || "Flying Wolf";

const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    let token = null;

    // Check Authorization header first
    if (req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    // Fallback to cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Fallback to query string
    if (!token && req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      console.log('No token found in headers, cookies, or query');
      return res.status(401).json({ error: 'Token required for authentication' });
    }

    console.log('Token found:', token.substring(0, 20) + '...');

    const decoded = jwt.verify(token, secret);
    console.log('Token verified successfully for user:', decoded.email);
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;