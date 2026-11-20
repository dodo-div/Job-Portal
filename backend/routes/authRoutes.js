const { Router } = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errors');
const limit = require('../middleware/limits');

module.exports = function authRoutes() {
  const router = Router();
  router.post('/register', limit(15 * 60_000, 10), asyncHandler(registerUser));
  router.post('/login', limit(15 * 60_000, 30), asyncHandler(loginUser));
  router.get('/me', protect, getMe);
  return router;
};
