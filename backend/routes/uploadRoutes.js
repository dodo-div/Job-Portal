const { Router } = require('express');
const multer = require('multer');
const path = require('node:path');
const { uploadResume, downloadOwnResume } = require('../controllers/uploadController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { HttpError, asyncHandler } = require('../middleware/errors');
const limit = require('../middleware/limits');
const { MAX_RESUME_BYTES } = require('../services/resumeStorage');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_BYTES + 1, files: 1, fields: 0, parts: 2 },
  fileFilter(req, file, done) {
    if (path.extname(file.originalname).toLowerCase() !== '.pdf' || file.mimetype !== 'application/pdf') {
      return done(new HttpError(415, 'Only PDF resumes are allowed'));
    }
    done(null, true);
  },
}).single('resume');

function parseUpload(req, res, next) {
  if (!req.is('multipart/form-data')) return next(new HttpError(415, 'Expected a multipart resume upload'));
  upload(req, res, error => {
    if (error && !(error instanceof HttpError) && !(error instanceof multer.MulterError)) {
      return next(new HttpError(400, 'Malformed resume upload'));
    }
    next(error);
  });
}

module.exports = function uploadRoutes() {
  const router = Router();
  router.use(protect, authorizeRoles('seeker'));
  router.post('/resume', limit(60_000, 10), limit(60_000, 5, true), parseUpload, asyncHandler(uploadResume));
  router.get('/resume', limit(60_000, 30, true), asyncHandler(downloadOwnResume));
  return router;
};
