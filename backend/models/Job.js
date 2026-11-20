const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, trim: true, maxlength: 12000 },
  salary: { type: Number, required: true, min: 0, max: Number.MAX_SAFE_INTEGER },
  location: { type: String, required: true, trim: true, maxlength: 150 },
  companyName: { type: String, required: true, trim: true, maxlength: 150 },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  jobType: { type: String, enum: ['full-time', 'part-time', 'internship', 'contract'], default: 'full-time' },
  skillsRequired: { type: [{ type: String, trim: true, maxlength: 80 }], default: [], validate: values => values.length <= 30 },
  isOpen: { type: Boolean, default: true },
}, { timestamps: true });

jobSchema.index({ employerId: 1, createdAt: -1, _id: -1 });
jobSchema.index({ isOpen: 1, createdAt: -1, _id: -1 });

module.exports = mongoose.model('Job', jobSchema);
