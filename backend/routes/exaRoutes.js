const { Router } = require('express');
const searchPeople = require('../controllers/exaController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errors');
const limit = require('../middleware/limits');

module.exports = function exaRoutes() {
  const router = Router();
  router.post('/search-people', protect, authorizeRoles('employer', 'admin'),
    limit(60_000, 10, true), limit(60_000, 60), asyncHandler(searchPeople));
  return router;
};
