const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, immutable: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  resume: { type: String, required: true, immutable: true },
  coverLetter: { type: String, default: '', maxlength: 5000 },
  status: { type: String, enum: ['applied', 'shortlisted', 'rejected'], default: 'applied' },
  appliedAt: { type: Date, default: Date.now },
}, { timestamps: true });

applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });
applicationSchema.index({ userId: 1, appliedAt: -1, _id: -1 });
applicationSchema.index({ jobId: 1, appliedAt: -1, _id: -1 });

module.exports = mongoose.model('Application', applicationSchema);
