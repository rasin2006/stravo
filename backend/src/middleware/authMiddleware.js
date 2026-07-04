const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Missing auth header' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey'); // Added fallback for JWT_SECRET
    req.user = await User.findByPk(payload.userId);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
