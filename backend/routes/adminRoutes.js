const { Router } = require('express');
const { getStats, getAllUsers, getAllJobs, deleteUser, deleteJob } = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errors');
const { validateId } = require('../middleware/validation');

module.exports = function adminRoutes() {
  const router = Router();
  router.use(protect, authorizeRoles('admin'));
  router.param('id', validateId);
  router.get('/stats', asyncHandler(getStats));
  router.get('/users', asyncHandler(getAllUsers));
  router.get('/jobs', asyncHandler(getAllJobs));
  router.delete('/users/:id', asyncHandler(deleteUser));
  router.delete('/jobs/:id', asyncHandler(deleteJob));
  return router;
};
