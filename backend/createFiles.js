const fs = require('fs');

// ─── Job Controller ───────────────────────────────────────────
fs.writeFileSync('./controllers/jobController.js', `
const Job = require('../models/Job');

// @route GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const { location, salary, jobType, search } = req.query;
    let filter = { isOpen: true };

    if (location) filter.location = { $regex: location, $options: 'i' };
    if (jobType) filter.jobType = jobType;
    if (salary) filter.salary = { $gte: Number(salary) };
    if (search) filter.title = { $regex: search, $options: 'i' };

    const jobs = await Job.find(filter)
      .populate('employerId', 'name companyName')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employerId', 'name companyName companyWebsite');

    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/jobs
const createJob = async (req, res) => {
  try {
    const { title, description, salary, location, companyName, jobType, skillsRequired } = req.body;

    const job = await Job.create({
      title,
      description,
      salary,
      location,
      companyName,
      jobType,
      skillsRequired,
      employerId: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/jobs/:id
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized to update this job' });

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized to delete this job' });

    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/jobs/employer/myjobs
const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob, getEmployerJobs };
`);

// ─── Application Controller ───────────────────────────────────
fs.writeFileSync('./controllers/applicationController.js', `
const Application = require('../models/Application');
const Job = require('../models/Job');

// @route POST /api/applications/:jobId
const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (!job.isOpen) return res.status(400).json({ message: 'Job is closed' });

    const alreadyApplied = await Application.findOne({
      jobId: req.params.jobId,
      userId: req.user._id,
    });
    if (alreadyApplied) return res.status(400).json({ message: 'Already applied for this job' });

    const resume = req.user.resume;
    if (!resume) return res.status(400).json({ message: 'Please upload a resume first' });

    const application = await Application.create({
      jobId: req.params.jobId,
      userId: req.user._id,
      resume,
      coverLetter: req.body.coverLetter || '',
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/applications/myapplications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('jobId', 'title companyName location salary jobType isOpen')
      .sort({ appliedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/applications/job/:jobId
const getApplicantsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('userId', 'name email skills resume bio')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/applications/:id/status
const updateApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('jobId');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.jobId.employerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    application.status = req.body.status;
    await application.save();
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { applyForJob, getMyApplications, getApplicantsForJob, updateApplicationStatus };
`);

// ─── Job Routes ───────────────────────────────────────────────
fs.writeFileSync('./routes/jobRoutes.js', `
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
`);

// ─── Application Routes ───────────────────────────────────────
fs.writeFileSync('./routes/applicationRoutes.js', `
const express = require('express');
const router = express.Router();
const { applyForJob, getMyApplications, getApplicantsForJob, updateApplicationStatus } = require('../controllers/applicationController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/:jobId', protect, authorizeRoles('seeker'), applyForJob);
router.get('/myapplications', protect, authorizeRoles('seeker'), getMyApplications);
router.get('/job/:jobId', protect, authorizeRoles('employer', 'admin'), getApplicantsForJob);
router.put('/:id/status', protect, authorizeRoles('employer', 'admin'), updateApplicationStatus);

module.exports = router;
`);

console.log('All files created successfully!');