const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const User = require('../models/User');
const Application = require('../models/Application');
const { HttpError } = require('../middleware/errors');
const { MAX_RESUME_BYTES, isPdf, readResume } = require('../services/resumeStorage');
const requireManagedJob = require('../services/jobAccess');

async function uploadResume(req, res) {
  if (!req.file) throw new HttpError(400, 'No file uploaded');
  if (req.file.size > MAX_RESUME_BYTES) throw new HttpError(413, 'Resume exceeds 5 MB');
  if (!isPdf(req.file.buffer)) throw new HttpError(415, 'Resume must be a valid PDF');

  const resume = randomUUID() + '.pdf';
  const file = path.join(req.app.locals.config.resumeDir, resume);
  // Write the complete file before making it visible through a database reference.
  const handle = await fs.open(file, 'wx', 0o600);
  try {
    try {
      await handle.writeFile(req.file.buffer);
    } finally {
      await handle.close();
    }
  } catch (error) {
    await fs.unlink(file);
    throw error;
  }

  const updated = await User.updateOne({ _id: req.user._id, role: 'seeker' }, { $set: { resume } });
  if (!updated.matchedCount) {
    await fs.unlink(file);
    throw new HttpError(401, 'Invalid token');
  }
  res.json({ message: 'Resume uploaded successfully', resume });
}

async function sendResume(req, res, filename) {
  if (!filename) throw new HttpError(404, 'Resume not found');
  const contents = await readResume(req.app.locals.config, filename);
  res.attachment('resume.pdf').type('application/pdf').send(contents);
}

async function downloadOwnResume(req, res) {
  await sendResume(req, res, req.user.resume);
}

async function downloadApplicationResume(req, res) {
  const application = await Application.findById(req.params.id);
  if (!application) throw new HttpError(404, 'Application not found');
  if (req.user.role === 'seeker') {
    if (!application.userId.equals(req.user._id)) throw new HttpError(403, 'Not authorized for this application');
  } else {
    await requireManagedJob(application.jobId, req.user);
  }
  await sendResume(req, res, application.resume);
}

module.exports = { uploadResume, downloadOwnResume, downloadApplicationResume };
