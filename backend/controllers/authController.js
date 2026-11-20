const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { HttpError } = require('../middleware/errors');
const { body, choice, invalid, string } = require('../middleware/validation');

const dummyHash = bcrypt.hashSync('unused-password', 10);

function credentials(input, registering = false) {
  const email = string(input.email, 'email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw invalid('email');
  const { password } = input;
  // Bcrypt truncates at 72 bytes. Keep legacy login behavior for existing passwords.
  if (typeof password !== 'string' || !password || Buffer.byteLength(password) > (registering ? 72 : 1024)) {
    throw invalid('password');
  }
  if (registering && password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters');
  return { email, password };
}

function sessionResponse(user, req) {
  const { _id, name, email, role } = user;
  const token = jwt.sign({ id: _id }, req.app.locals.config.jwtSecret, { algorithm: 'HS256', expiresIn: '7d' });
  return { _id, name, email, role, token };
}

async function registerUser(req, res) {
  const input = body(req);
  const { email, password } = credentials(input, true);
  const name = string(input.name, 'name', 100);
  const role = choice(input.role === undefined ? 'seeker' : input.role, 'role', ['seeker', 'employer']);
  const companyName = role === 'employer'
    ? string(input.companyName, 'company name', 150, { optional: true, empty: true })
    : undefined;
  try {
    const user = await User.create({ name, email, password, role, companyName });
    res.status(201).json(sessionResponse(user, req));
  } catch (error) {
    if (error.code === 11000) throw new HttpError(409, 'User already exists');
    throw error;
  }
}

async function loginUser(req, res) {
  const { email, password } = credentials(body(req));
  const user = await User.findOne({ email }).select('+password');
  const matches = await bcrypt.compare(password, user?.password || dummyHash);
  if (!user || !matches) throw new HttpError(401, 'Invalid email or password');
  res.json(sessionResponse(user, req));
}

function getMe(req, res) {
  res.json(req.user);
}

module.exports = { registerUser, loginUser, getMe };
