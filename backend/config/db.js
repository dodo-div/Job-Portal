const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

async function connectDB(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const topology = await mongoose.connection.db.admin().command({ hello: 1 });
  if (!topology.setName && topology.msg !== 'isdbgrid') {
    throw new Error('MongoDB must support transactions');
  }
  await Promise.all([User.init(), Job.init(), Application.init()]);
}

module.exports = connectDB;
