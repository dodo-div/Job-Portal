const Application = require('../models/Application');
const Job = require('../models/Job');

const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (!job.isOpen) return res.status(400).json({ message: 'Job is closed' });
    const alreadyApplied = await Application.findOne({ jobId: req.params.jobId, userId: req.user._id });
    if (alreadyApplied) return res.status(400).json({ message: 'Already applied' });
    const resume = req.user.resume;
    if (!resume) return res.status(400).json({ message: 'Please upload a resume first' });
    const application = await Application.create({ jobId: req.params.jobId, userId: req.user._id, resume, coverLetter: req.body.coverLetter || '' });
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id }).populate('jobId', 'title companyName location salary jobType isOpen').sort({ appliedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getApplicantsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.employerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    const applications = await Application.find({ jobId: req.params.jobId }).populate('userId', 'name email skills resume bio').sort({ appliedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('jobId');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.jobId.employerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    application.status = req.body.status;
    await application.save();
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { applyForJob, getMyApplications, getApplicantsForJob, updateApplicationStatus };
