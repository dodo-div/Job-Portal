const Job = require('../models/Job');
const { HttpError } = require('../middleware/errors');

async function requireManagedJob(id, user, session) {
  const job = await Job.findById(id).session(session ?? null);
  if (!job) throw new HttpError(404, 'Job not found');
  if (user.role !== 'admin' && !job.employerId.equals(user._id)) {
    throw new HttpError(403, 'Not authorized for this job');
  }
  return job;
}

module.exports = requireManagedJob;
