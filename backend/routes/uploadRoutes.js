const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadResume } = require('../controllers/uploadController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => { cb(null, 'resume-' + req.user._id + '-' + Date.now() + path.extname(file.originalname)); },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/resume', protect, authorizeRoles('seeker'), upload.single('resume'), uploadResume);

module.exports = router;
