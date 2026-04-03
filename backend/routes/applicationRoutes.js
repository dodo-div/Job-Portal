const express = require('express');
const router = express.Router();
const { applyForJob, getMyApplications, getApplicantsForJob, updateApplicationStatus } = require('../controllers/applicationController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/:jobId', protect, authorizeRoles('seeker'), applyForJob);
router.get('/myapplications', protect, authorizeRoles('seeker'), getMyApplications);
router.get('/job/:jobId', protect, authorizeRoles('employer', 'admin'), getApplicantsForJob);
router.put('/:id/status', protect, authorizeRoles('employer', 'admin'), updateApplicationStatus);

module.exports = router;