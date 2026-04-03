const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, getAllJobs, deleteUser, deleteJob } = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorizeRoles('admin'), getStats);
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
router.get('/jobs', protect, authorizeRoles('admin'), getAllJobs);
router.delete('/users/:id', protect, authorizeRoles('admin'), deleteUser);
router.delete('/jobs/:id', protect, authorizeRoles('admin'), deleteJob);

module.exports = router;
