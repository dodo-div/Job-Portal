const fs = require('node:fs/promises');
const path = require('node:path');
const { HttpError } = require('../middleware/errors');

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const currentName = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}\.pdf$/;
const legacyName = /^resume-[a-f0-9]{24}-\d{10,17}\.pdf$/i;

function isPdf(buffer) {
  return buffer.length <= MAX_RESUME_BYTES &&
    /^%PDF-(?:1\.[0-7]|2\.0)(?:\r|\n)/.test(buffer.subarray(0, 12).toString('latin1')) &&
    /%%EOF\s*$/.test(buffer.subarray(-1024).toString('latin1'));
}

async function readResume(config, name) {
  const directories = currentName.test(name) ? [config.resumeDir]
    : legacyName.test(name) ? [config.resumeDir, ...config.legacyResumeDirs] : [];
  for (const directory of directories) {
    const file = path.join(directory, name);
    try {
      const info = await fs.lstat(file);
      if (!info.isFile() || info.size > MAX_RESUME_BYTES) continue;
      const buffer = await fs.readFile(file);
      if (isPdf(buffer)) return buffer;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  throw new HttpError(404, 'Resume not found. Please upload a valid PDF.');
}

module.exports = { MAX_RESUME_BYTES, isPdf, readResume };
