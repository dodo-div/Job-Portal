const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { paginate } = require('../middleware/validation');
const { deleteJobAndApplications, deleteUserAndRecords } = require('../services/deletion');

const sort = { createdAt: -1, _id: -1 };

async function getStats(req, res) {
  const [totalUsers, totalJobs, totalApplications, totalSeekers, totalEmployers, openJobs] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    User.countDocuments({ role: 'seeker' }),
    User.countDocuments({ role: 'employer' }),
    Job.countDocuments({ isOpen: true }),
  ]);
  res.json({ totalUsers, totalJobs, totalApplications, totalSeekers, totalEmployers, openJobs });
}

async function getAllUsers(req, res) {
  res.json(await paginate(req, res, User.find().select('-resume').sort(sort)));
}

async function getAllJobs(req, res) {
  res.json(await paginate(req, res, Job.find().populate('employerId', 'name companyName').sort(sort)));
}

async function deleteUser(req, res) {
  await deleteUserAndRecords(req.params.id);
  res.json({ message: 'User deleted' });
}

async function deleteJob(req, res) {
  await deleteJobAndApplications(req.params.id, req.user);
  res.json({ message: 'Job deleted' });
}

module.exports = { getStats, getAllUsers, getAllJobs, deleteUser, deleteJob };
