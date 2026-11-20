const { Router } = require('express');
const { getJobs, getJobById, createJob, updateJob, deleteJob, getEmployerJobs } = require('../controllers/jobController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errors');
const { validateId } = require('../middleware/validation');
const limit = require('../middleware/limits');

module.exports = function jobRoutes() {
  const router = Router();
  const manage = [protect, authorizeRoles('employer', 'admin')];
  router.param('id', validateId);
  router.get('/', limit(60_000, 120), asyncHandler(getJobs));
  router.get('/employer/myjobs', protect, authorizeRoles('employer'), asyncHandler(getEmployerJobs));
  router.get('/:id', asyncHandler(getJobById));
  router.post('/', manage, asyncHandler(createJob));
  router.put('/:id', manage, asyncHandler(updateJob));
  router.delete('/:id', manage, asyncHandler(deleteJob));
  return router;
};
