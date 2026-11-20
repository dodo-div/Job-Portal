const path = require('node:path');
const fs = require('node:fs/promises');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const createApp = require('./app');
const getConfig = require('./config/env');
const connectDB = require('./config/db');

async function start() {
  let config;
  try {
    config = getConfig();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  try {
    await fs.mkdir(config.resumeDir, { recursive: true, mode: 0o700 });
    await fs.access(config.resumeDir, fs.constants.R_OK | fs.constants.W_OK);
    await connectDB(config.mongoUri);
    const server = createApp(config).listen(config.port);
    server.once('listening', () => console.log(`Job Portal API listening on port ${config.port}`));
    server.once('error', async () => {
      console.error('Could not listen on the configured port');
      process.exitCode = 1;
      await mongoose.disconnect();
    });
    for (const signal of ['SIGINT', 'SIGTERM']) {
      process.once(signal, () => server.close(() => mongoose.disconnect()));
    }
  } catch {
    console.error('Startup failed while preparing private resume storage or MongoDB (connection, topology, or indexes)');
    process.exitCode = 1;
    await mongoose.disconnect();
  }
}

start();
