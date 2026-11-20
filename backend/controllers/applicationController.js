const mongoose = require('mongoose');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { HttpError } = require('../middleware/errors');
const { body, choice, paginate, string } = require('../middleware/validation');
const requireManagedJob = require('../services/jobAccess');
const { readResume } = require('../services/resumeStorage');

const sort = { appliedAt: -1, _id: -1 };
const jobFields = 'title companyName location salary jobType isOpen';

async function applyForJob(req, res) {
  const coverLetter = string(body(req).coverLetter, 'cover letter', 5000, { optional: true, empty: true });
  const jobId = req.params.jobId;
  const userId = req.user._id;
  try {
    const application = await mongoose.connection.transaction(async session => {
      // Parent writes conflict with concurrent deletion, job closure, or resume replacement.
      const job = await Job.findOneAndUpdate({ _id: jobId, isOpen: true }, { $inc: { __v: 1 } }, { session, timestamps: false });
      if (!job) {
        if (await Job.exists({ _id: jobId }).session(session)) throw new HttpError(400, 'Job is closed');
        throw new HttpError(404, 'Job not found');
      }
      const user = await User.findOneAndUpdate({ _id: userId, role: 'seeker' }, { $inc: { __v: 1 } }, { session, timestamps: false });
      if (!user) throw new HttpError(401, 'Invalid token');
      if (!user.resume) throw new HttpError(400, 'Please upload a resume first');
      try {
        await readResume(req.app.locals.config, user.resume);
      } catch (error) {
        if (error.status === 404) throw new HttpError(400, 'Please upload a valid PDF resume first');
        throw error;
      }
      const [created] = await Application.create([{ jobId, userId, resume: user.resume, coverLetter }], { session });
      return created;
    });
    res.status(201).json(application);
  } catch (error) {
    if (error.code === 11000) throw new HttpError(409, 'Already applied');
    throw error;
  }
}

async function getMyApplications(req, res) {
  const applications = Application.find({ userId: req.user._id }).populate('jobId', jobFields).sort(sort);
  res.json(await paginate(req, res, applications));
}

async function getApplicantsForJob(req, res) {
  const job = await requireManagedJob(req.params.jobId, req.user);
  const applications = Application.find({ jobId: job._id }).populate('userId', 'name email skills bio').sort(sort);
  res.json(await paginate(req, res, applications));
}

async function updateApplicationStatus(req, res) {
  const status = choice(body(req).status, 'application status', Application.schema.path('status').enumValues);
  const application = await Application.findById(req.params.id);
  if (!application) throw new HttpError(404, 'Application not found');
  await requireManagedJob(application.jobId, req.user);
  const updated = await Application.findOneAndUpdate(
    { _id: application._id, jobId: application.jobId },
    { $set: { status } },
    { new: true, runValidators: true },
  ).populate('jobId');
  if (!updated) throw new HttpError(404, 'Application not found');
  res.json(updated);
}

module.exports = { applyForJob, getMyApplications, getApplicantsForJob, updateApplicationStatus };
