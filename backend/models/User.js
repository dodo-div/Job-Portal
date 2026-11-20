const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
    validate: value => Buffer.byteLength(value) <= 72,
  },
  role: { type: String, enum: ['seeker', 'employer', 'admin'], default: 'seeker' },
  skills: { type: [String], default: [] },
  resume: { type: String, default: null },
  bio: { type: String, default: '' },
  companyName: { type: String, default: '', trim: true, maxlength: 150 },
  companyWebsite: { type: String, default: '' },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);
