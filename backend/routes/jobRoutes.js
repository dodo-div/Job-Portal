const express = require('express');
const router = express.Router();
const { getJobs, getJobById, createJob, updateJob, deleteJob, getEmployerJobs } = require('../controllers/jobController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getJobs);
router.get('/employer/myjobs', protect, authorizeRoles('employer'), getEmployerJobs);
router.get('/:id', getJobById);
router.post('/', protect, authorizeRoles('employer', 'admin'), createJob);
router.put('/:id', protect, authorizeRoles('employer', 'admin'), updateJob);
router.delete('/:id', protect, authorizeRoles('employer', 'admin'), deleteJob);

module.exports = router;