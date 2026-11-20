const { rateLimit } = require('express-rate-limit');

function limit(windowMs, max, perUser = false) {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many requests. Try again later.' },
    ...(perUser && { keyGenerator: req => req.user.id }),
  });
}

module.exports = limit;
