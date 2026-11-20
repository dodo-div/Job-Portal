const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { HttpError } = require('../middleware/errors');
const requireManagedJob = require('./jobAccess');

function deleteJobAndApplications(id, actor) {
  return mongoose.connection.transaction(async session => {
    const job = await requireManagedJob(id, actor, session);
    await job.deleteOne({ session });
    await Application.deleteMany({ jobId: job._id }, { session });
  });
}

function deleteUserAndRecords(id) {
  return mongoose.connection.transaction(async session => {
    const user = await User.findById(id).session(session);
    if (!user) throw new HttpError(404, 'User not found');
    if (user.role === 'admin') throw new HttpError(400, 'Cannot delete admin');

    await user.deleteOne({ session });
    const filter = { userId: user._id };
    const jobs = await Job.find({ employerId: user._id }).select('_id').session(session).lean();
    await Job.deleteMany({ employerId: user._id }, { session });
    const applications = jobs.length ? { $or: [filter, { jobId: { $in: jobs.map(job => job._id) } }] } : filter;
    await Application.deleteMany(applications, { session });
  });
}

module.exports = { deleteJobAndApplications, deleteUserAndRecords };
