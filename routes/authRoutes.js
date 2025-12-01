const jwt = require('jsonwebtoken');
const User = require('../models/User');

const secret = process.env.JWT_SECRET || "Flying Wolf";

module.exports = app => {
  app.post('/auth/register', async (req, res) => {
    try {
      const { email, password, passwordConfirm } = req.body;

      if (!email || !password || !passwordConfirm) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (password !== passwordConfirm) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const user = new User({ email, password });
      await user.save();

      const token = jwt.sign({ id: user._id.toString(), email: user.email }, secret, {
        expiresIn: '7d'
      });

      user.token = token;
      await user.save();

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(201).json({ 
        success: true, 
        message: 'User registered successfully',
        token: token,
        user: { id: user._id, email: user.email }
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id.toString(), email: user.email }, secret, {
        expiresIn: '7d'
      });

      user.token = token;
      await user.save();

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      console.log('Login successful for:', email);
      console.log('Token generated:', token.substring(0, 20) + '...');

      return res.json({ 
        success: true, 
        message: 'Login successful',
        token: token,
        user: { id: user._id, email: user.email }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
  });

  app.get('/api/current_user', (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const decoded = jwt.verify(token, secret);
      User.findById(decoded.id)
        .select('-password')
        .then(user => {
          if (!user) {
            return res.status(401).json({ error: 'User not found' });
          }
          res.json(user);
        })
        .catch(err => res.status(401).json({ error: 'Authentication failed' }));
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  });
};