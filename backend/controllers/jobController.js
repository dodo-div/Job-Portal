const mongoose = require('mongoose');
const Job = require('../models/Job');
const User = require('../models/User');
const { HttpError } = require('../middleware/errors');
const { body, choice, invalid, number, paginate, string } = require('../middleware/validation');
const { deleteJobAndApplications } = require('../services/deletion');
const requireManagedJob = require('../services/jobAccess');

const jobTypes = Job.schema.path('jobType').enumValues;
const employerFields = 'name companyName';
const sort = { createdAt: -1, _id: -1 };
const textFields = { title: 150, description: 12000, location: 150, companyName: 150 };
const escapeRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function jobFields(input, partial = false) {
  const fields = {};
  for (const [field, max] of Object.entries(textFields)) {
    if (!partial || Object.hasOwn(input, field)) fields[field] = string(input[field], field, max);
  }
  if (!partial || Object.hasOwn(input, 'salary')) {
    fields.salary = number(input.salary, 'salary', 0, Number.MAX_SAFE_INTEGER);
  }
  if (Object.hasOwn(input, 'jobType')) fields.jobType = choice(input.jobType, 'job type', jobTypes);
  if (Object.hasOwn(input, 'skillsRequired')) {
    if (!Array.isArray(input.skillsRequired) || input.skillsRequired.length > 30) throw invalid('skills required');
    fields.skillsRequired = input.skillsRequired
      .map(skill => string(skill, 'skill', 80, { empty: true })).filter(Boolean);
  }
  if (partial && Object.hasOwn(input, 'isOpen')) {
    if (typeof input.isOpen !== 'boolean') throw invalid('isOpen');
    fields.isOpen = input.isOpen;
  }
  if (partial && (!Object.keys(fields).length || Object.keys(input).some(field => !Object.hasOwn(fields, field)))) {
    throw invalid('job update fields');
  }
  return fields;
}

async function getJobs(req, res) {
  const { location, salary, jobType, search } = req.query;
  const filter = { isOpen: true };
  for (const [field, value] of [['location', location], ['title', search]]) {
    const term = string(value, field, 150, { optional: true, empty: true });
    if (term) filter[field] = { $regex: escapeRegex(term), $options: 'i' };
  }
  if (jobType !== undefined && jobType !== '') filter.jobType = choice(jobType, 'job type', jobTypes);
  if (salary !== undefined && salary !== '') filter.salary = { $gte: number(salary, 'salary', 0, Number.MAX_SAFE_INTEGER) };
  const jobs = await paginate(req, res, Job.find(filter).populate('employerId', employerFields).sort(sort).maxTimeMS(4000));
  res.json(jobs);
}

async function getJobById(req, res) {
  const job = await Job.findById(req.params.id).populate('employerId', employerFields);
  if (!job) throw new HttpError(404, 'Job not found');
  res.json(job);
}

async function createJob(req, res) {
  const fields = jobFields(body(req));
  const job = await mongoose.connection.transaction(async session => {
    // Take a write lock on the parent so account deletion cannot race job creation.
    const owner = await User.updateOne({ _id: req.user._id, role: req.user.role }, { $inc: { __v: 1 } }, { session, timestamps: false });
    if (!owner.matchedCount) throw new HttpError(401, 'Invalid token');
    const [created] = await Job.create([{ ...fields, employerId: req.user._id }], { session });
    return created;
  });
  res.status(201).json(job);
}

async function updateJob(req, res) {
  const fields = jobFields(body(req), true);
  const job = await requireManagedJob(req.params.id, req.user);
  const updated = await Job.findOneAndUpdate(
    { _id: job._id, employerId: job.employerId },
    { $set: fields },
    { new: true, runValidators: true },
  );
  if (!updated) throw new HttpError(404, 'Job not found');
  res.json(updated);
}

async function deleteJob(req, res) {
  await deleteJobAndApplications(req.params.id, req.user);
  res.json({ message: 'Job removed' });
}

async function getEmployerJobs(req, res) {
  res.json(await paginate(req, res, Job.find({ employerId: req.user._id }).sort(sort)));
}

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob, getEmployerJobs };
