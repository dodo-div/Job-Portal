const { Router } = require('express');
const { applyForJob, getMyApplications, getApplicantsForJob, updateApplicationStatus } = require('../controllers/applicationController');
const { downloadApplicationResume } = require('../controllers/uploadController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errors');
const { validateId } = require('../middleware/validation');
const limit = require('../middleware/limits');

module.exports = function applicationRoutes() {
  const router = Router();
  const seeker = authorizeRoles('seeker');
  const manage = authorizeRoles('employer', 'admin');
  router.use(protect);
  router.param('jobId', validateId);
  router.param('id', validateId);
  router.post('/:jobId', seeker, limit(60_000, 30, true), asyncHandler(applyForJob));
  router.get('/myapplications', seeker, asyncHandler(getMyApplications));
  router.get('/job/:jobId', manage, asyncHandler(getApplicantsForJob));
  router.put('/:id/status', manage, asyncHandler(updateApplicationStatus));
  router.get('/:id/resume', authorizeRoles('seeker', 'employer', 'admin'), limit(60_000, 60, true), asyncHandler(downloadApplicationResume));
  return router;
};
