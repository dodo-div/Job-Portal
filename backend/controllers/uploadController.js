const User = require('../models/User');

const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    await User.findByIdAndUpdate(req.user._id, { resume: req.file.filename });
    res.json({ message: 'Resume uploaded successfully', resume: req.file.filename });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadResume };
