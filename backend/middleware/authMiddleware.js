const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { HttpError, asyncHandler } = require('./errors');
const { isObjectId } = require('./validation');

const protect = asyncHandler(async (req, res, next) => {
  const match = /^Bearer ([^\s]+)$/i.exec(req.get('Authorization') || '');
  if (!match) throw new HttpError(401, 'A valid Bearer token is required');

  let claims;
  try {
    claims = jwt.verify(match[1], req.app.locals.config.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }
  if (!isObjectId(claims?.id) || !Number.isFinite(claims.exp)) {
    throw new HttpError(401, 'Invalid token');
  }
  req.user = await User.findById(claims.id);
  if (!req.user) throw new HttpError(401, 'Invalid token');
  next();
});

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) return next(new HttpError(401, 'Authentication required'));
  if (!roles.includes(req.user.role)) return next(new HttpError(403, 'Access denied. Role not permitted.'));
  next();
};

module.exports = { protect, authorizeRoles };
