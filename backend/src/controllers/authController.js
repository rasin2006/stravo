const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const {
  normalizeIdentifier,
  isValidIdentifier,
  getIdentifierFromBody,
} = require('../utils/authIdentifier');

exports.login = async (req, res, next) => {
  try {
    const { password } = req.body;
    const rawIdentifier = getIdentifierFromBody(req.body);
    const identifier = normalizeIdentifier(rawIdentifier);

    if (!isValidIdentifier(rawIdentifier)) {
      return res.status(400).json({ message: 'Enter a valid email or phone number' });
    }

    const user = await User.findOne({ where: { email: identifier } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const rawIdentifier = getIdentifierFromBody(req.body);
    const identifier = normalizeIdentifier(rawIdentifier);

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!isValidIdentifier(rawIdentifier)) {
      return res.status(400).json({ message: 'Enter a valid email or phone number' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: identifier,
      passwordHash,
      id: undefined,
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'An account with this email or phone already exists' });
    }
    next(err);
  }
};
