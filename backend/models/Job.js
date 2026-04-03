const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // references the User model
      required: true,
    },
    // Extra useful fields
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'contract'],
      default: 'full-time',
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    isOpen: {
      type: Boolean,
      default: true, // false = job closed/filled
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);