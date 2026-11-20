const assert = require('node:assert/strict');
const { test } = require('node:test');
const { randomUUID } = require('node:crypto');
const { once } = require('node:events');
const path = require('node:path');
const fs = require('node:fs/promises');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { startMongo, freePort, spawnLocal, stop, untilReady } = require('./localMongo');

const secret = 'local-test-secret-with-more-than-32-bytes';
const password = 'test password';
const pdf = '%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n';
const binary = process.env.MONGOD_BINARY;

test('isolated HTTP and MongoDB workflows', { skip: binary ? false : 'Set MONGOD_BINARY to enable integration tests' }, async t => {
  const { root, uri } = await startMongo(t, binary);
  const resumeDir = path.join(root, 'resumes');
  const port = await freePort();
  const base = 'http://127.0.0.1:' + port;
  const server = spawnLocal(process.execPath, [path.join(__dirname, '../server.js')], {
    env: {
      ...process.env, MONGO_URI: uri, JWT_SECRET: secret, EXA_API_KEY: ' ', PORT: String(port),
      TRUST_PROXY_HOPS: '0', CORS_ORIGINS: 'http://localhost:3000', RESUME_DIR: resumeDir,
    },
  });
  try {
    await untilReady(async () => {
      const response = await fetch(base);
      assert.equal(response.status, 200);
      assert.equal(await response.text(), 'Job Portal API running');
    }, server);
    await mongoose.connect(uri);

    async function request(endpoint, options = {}) {
      const { method = 'GET', token, json, form, authorization } = options;
      const headers = {};
      if (token || authorization) headers.Authorization = authorization || 'Bearer ' + token;
      if (json !== undefined) headers['Content-Type'] = 'application/json';
      const response = await fetch(base + endpoint, {
        method, headers, body: form ?? (json === undefined ? undefined : JSON.stringify(json)),
      });
      const data = response.headers.get('content-type')?.includes('application/json')
        ? await response.json() : await response.text();
      return { status: response.status, headers: response.headers, data };
    }

    const post = (endpoint, token, json) => request(endpoint, { method: 'POST', token, json });
    const put = (endpoint, token, json) => request(endpoint, { method: 'PUT', token, json });
    const get = (endpoint, token) => request(endpoint, { token });
    const remove = (endpoint, token) => request(endpoint, { method: 'DELETE', token });
    const register = (email, role) => post('/api/auth/register', null, { email, role, name: ' Test User ', password });
    function check(result, status) {
      assert.equal(result.status, status, JSON.stringify(result.data));
      return result.data;
    }

    let seeker, secondSeeker, owner, outsider, admin;
    await t.test('registration, login, profile, roles, and JWT rejection', async () => {
      check(await register('bad@example.test', 'admin'), 400);
      check(await post('/api/auth/register', null, { email: [], password, name: 'Test' }), 400);
      check(await register('missing-domain', 'seeker'), 400);
      check(await post('/api/auth/register', null, {
        email: 'long@example.test', password: '😀'.repeat(19), name: 'Test',
      }), 400);
      assert.equal(await User.countDocuments(), 0);

      seeker = check(await register(' SEEKER@Example.Test  ', 'seeker'), 201);
      secondSeeker = check(await register('second@example.test'), 201);
      owner = check(await register('owner@example.test', 'employer'), 201);
      outsider = check(await register('outsider@example.test', 'employer'), 201);
      assert.equal(seeker.email, 'seeker@example.test');
      assert.equal(seeker.name, 'Test User');
      check(await register('seeker@example.test', 'seeker'), 409);
      const login = check(await post('/api/auth/login', null, { email: ' SEEKER@Example.Test ', password }), 200);
      assert.equal(login._id, seeker._id);
      assert.equal((await User.findById(seeker._id).select('+password')).password.startsWith('$2'), true);
      const profile = check(await get('/api/auth/me', login.token), 200);
      assert.equal(profile.email, seeker.email);
      assert.equal(Object.hasOwn(profile, 'password'), false);
      check(await post('/api/auth/login', null, { email: seeker.email, password: 'wrong' }), 401);

      const adminUser = await User.create({ name: 'Local Admin', email: 'admin@example.test', password, role: 'admin' });
      admin = check(await post('/api/auth/login', null, { email: adminUser.email, password }), 200);
      assert.equal(admin.role, 'admin');
      check(await get('/api/auth/me'), 401);
      check(await request('/api/auth/me', { authorization: 'Bearer invalid extra' }), 401);
      for (const token of [
        jwt.sign({ id: 'bad-id' }, secret, { expiresIn: '1h' }),
        jwt.sign({ id: seeker._id }, secret, { expiresIn: -1 }),
        jwt.sign({ id: seeker._id }, secret),
        jwt.sign({ id: seeker._id }, secret, { algorithm: 'HS512', expiresIn: '1h' }),
        jwt.sign({ id: new mongoose.Types.ObjectId() }, secret, { expiresIn: '1h' }),
      ]) check(await get('/api/auth/me', token), 401);
      check(await get('/api/admin/users', seeker.token), 403);
      check(await get('/api/jobs/employer/myjobs', seeker.token), 403);
    });

    let job, otherJob;
    const fields = { title: 'Dev (C++)', companyName: 'Test Corp', description: 'Example job', salary: '50000', location: 'Pune', skillsRequired: ['C++', ''] };
    await t.test('job CRUD, literal search, pagination, and write ownership', async () => {
      check(await post('/api/jobs', seeker.token, fields), 403);
      check(await post('/api/jobs', owner.token, { ...fields, salary: -1 }), 400);
      job = check(await post('/api/jobs', owner.token, { ...fields, employerId: outsider._id }), 201);
      otherJob = check(await post('/api/jobs', owner.token, { ...fields, title: 'Designer' }), 201);
      assert.equal(job.employerId, owner._id);
      assert.deepEqual(job.skillsRequired, ['C++']);
      assert.equal(check(await get('/api/jobs?search=' + encodeURIComponent('(C++)')), 200).length, 1);
      assert.equal(check(await get('/api/jobs?search=' + encodeURIComponent('.*')), 200).length, 0);
      assert.equal(check(await get('/api/jobs?location=&jobType=&salary=40000'), 200).length, 2);
      check(await get('/api/jobs?search=a&search=b'), 400);
      check(await get('/api/jobs?limit=101'), 400);
      const firstPage = await get('/api/jobs?limit=1');
      assert.equal(check(firstPage, 200).length, 1);
      const next = firstPage.headers.get('link').match(/<([^>]+)>/)[1];
      assert.equal(check(await get(next), 200).length, 1);
      check(await get('/api/jobs/invalid'), 400);
      check(await get('/api/jobs/' + job._id), 200);
      check(await put('/api/jobs/' + job._id, outsider.token, { title: 'Other' }), 403);
      check(await remove('/api/jobs/' + job._id, outsider.token), 403);
      check(await put('/api/jobs/' + job._id, owner.token, { title: 'New', employerId: outsider._id }), 400);
      check(await put('/api/jobs/' + job._id, owner.token, { isOpen: 'false' }), 400);
      check(await put('/api/jobs/' + job._id, owner.token, { title: 'Updated' }), 200);
      assert.equal(check(await get('/api/jobs/employer/myjobs', owner.token), 200).length, 2);
    });

    let application;
    await t.test('PDF upload, snapshots, application statuses, and download ownership', async () => {
      function upload(token, content, name = 'candidate.pdf', type = 'application/pdf') {
        const form = new FormData();
        form.append('resume', new Blob([content], { type }), name);
        return request('/api/upload/resume', { method: 'POST', token, form });
      }
      check(await post('/api/applications/' + job._id, seeker.token), 400);
      check(await upload(owner.token, pdf), 403);
      check(await upload(seeker.token, pdf, 'resume.html', 'text/html'), 415);
      check(await upload(seeker.token, 'non-PDF content'), 415);
      check(await upload(seeker.token, Buffer.alloc(5 * 1024 * 1024 + 1)), 413);
      const { resume } = check(await upload(seeker.token, pdf), 200);
      assert.match(resume, /^[a-f0-9-]+\.pdf$/);
      assert.equal(check(await get('/api/upload/resume', seeker.token), 200), pdf);
      check(await get('/uploads/' + resume), 404);
      check(await get('/api/upload/resume'), 401);
      const legacyResume = 'resume-' + secondSeeker._id + '-1700000000000.pdf';
      await fs.writeFile(path.join(resumeDir, legacyResume), pdf);
      await User.updateOne({ _id: secondSeeker._id }, { resume: legacyResume });
      assert.equal(check(await get('/api/upload/resume', secondSeeker.token), 200), pdf);
      check(await get('/uploads/' + legacyResume), 404);
      check(await post('/api/applications/' + job._id, owner.token), 403);
      check(await post('/api/applications/' + job._id, seeker.token, { coverLetter: [] }), 400);
      const duplicateRace = await Promise.all([
        post('/api/applications/' + job._id, seeker.token),
        post('/api/applications/' + job._id, seeker.token),
      ]);
      assert.deepEqual(duplicateRace.map(result => result.status).sort(), [201, 409]);
      application = duplicateRace.find(result => result.status === 201).data;
      assert.equal(application.resume, resume);
      assert.equal(application.status, 'applied');
      assert.equal(await Application.countDocuments({ jobId: job._id }), 1);
      assert.equal(check(await get('/api/applications/myapplications', seeker.token), 200)[0].jobId._id, job._id);

      const newPdf = pdf.replace('/Catalog', '/Page');
      check(await upload(seeker.token, newPdf), 200);
      assert.equal(check(await get('/api/upload/resume', seeker.token), 200), newPdf);
      const download = '/api/applications/' + application._id + '/resume';
      check(await get(download), 401);
      check(await get(download, outsider.token), 403);
      check(await get(download, secondSeeker.token), 403);
      assert.equal(check(await get(download, seeker.token), 200), pdf);
      const ownerDownload = await get(download, owner.token);
      assert.equal(check(ownerDownload, 200), pdf);
      assert.match(ownerDownload.headers.get('content-disposition'), /^attachment/);
      assert.equal(check(await get(download, admin.token), 200), pdf);

      check(await get('/api/applications/job/' + job._id, outsider.token), 403);
      const applicants = check(await get('/api/applications/job/' + job._id, owner.token), 200);
      assert.equal(applicants[0].userId.email, seeker.email);
      assert.equal(Object.hasOwn(applicants[0].userId, 'resume'), false);
      check(await get('/api/applications/job/' + job._id, admin.token), 200);
      const status = '/api/applications/' + application._id + '/status';
      check(await put(status, outsider.token, { status: 'shortlisted' }), 403);
      check(await put(status, seeker.token, { status: 'shortlisted' }), 403);
      check(await put(status, owner.token, { status: 'unknown' }), 400);
      assert.equal(check(await put(status, owner.token, { status: 'shortlisted' }), 200).status, 'shortlisted');
      assert.equal(check(await put(status, admin.token, { status: 'rejected' }), 200).status, 'rejected');

      check(await put('/api/jobs/' + otherJob._id, owner.token, { isOpen: false }), 200);
      check(await post('/api/applications/' + otherJob._id, seeker.token), 400);
      check(await post('/api/exa/search-people', seeker.token, { query: 'developer' }), 403);
      check(await post('/api/exa/search-people', owner.token, { query: 'developer', numResults: 11 }), 400);
      assert.match(check(await post('/api/exa/search-people', owner.token, { query: 'developer' }), 503).message, /EXA_API_KEY/);
    });

    await t.test('admin reports, transaction cascades, and deleted account sessions', async () => {
      assert.equal(check(await get('/api/admin/stats', admin.token), 200).totalApplications, 1);
      assert.equal(check(await get('/api/admin/users', admin.token), 200).length, 5);
      assert.equal(check(await get('/api/admin/jobs', admin.token), 200).length, 2);
      check(await remove('/api/admin/users/' + admin._id, admin.token), 400);
      check(await remove('/api/jobs/' + job._id, owner.token), 200);
      assert.equal(await Application.findById(application._id), null);
      check(await get('/api/jobs/' + job._id), 404);

      const newJob = check(await post('/api/jobs', owner.token, fields), 201);
      const racingJob = check(await post('/api/jobs', owner.token, fields), 201);
      check(await post('/api/applications/' + newJob._id, seeker.token), 201);
      const [applying, deleting] = await Promise.all([
        post('/api/applications/' + racingJob._id, seeker.token),
        remove('/api/admin/users/' + owner._id, admin.token),
      ]);
      check(deleting, 200);
      assert.ok([201, 404].includes(applying.status), JSON.stringify(applying.data));
      assert.equal(await Job.countDocuments({ employerId: owner._id }), 0);
      assert.equal(await Application.countDocuments(), 0);
      check(await get('/api/auth/me', owner.token), 401);

      const finalJob = check(await post('/api/jobs', outsider.token, fields), 201);
      check(await post('/api/applications/' + finalJob._id, seeker.token), 201);
      check(await remove('/api/admin/users/' + seeker._id, admin.token), 200);
      assert.equal(await Application.countDocuments(), 0);
      assert.equal(await Job.countDocuments(), 1);
      check(await remove('/api/admin/jobs/' + finalJob._id, admin.token), 200);
    });
  } finally {
    await mongoose.disconnect();
    await stop(server);
  }
});

test('startup fails on missing configuration and an unreachable local database', async () => {
  const env = { ...process.env, MONGO_URI: '', JWT_SECRET: '', RESUME_DIR: 'private-resumes', TRUST_PROXY_HOPS: '0', CORS_ORIGINS: '' };
  const start = async extra => {
    const child = spawnLocal(process.execPath, [path.join(__dirname, '../server.js')], {
      env: { ...env, ...extra }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', chunk => { output += chunk; });
    child.stderr.on('data', chunk => { output += chunk; });
    const [code] = await once(child, 'close');
    return { code, output };
  };

  const missing = await start({});
  assert.equal(missing.code, 1);
  assert.match(missing.output, /MONGO_URI is required/);
  const port = await freePort();
  const uri = 'mongodb://127.0.0.1:' + port + '/test_' + randomUUID().replaceAll('-', '');
  const failed = await start({ MONGO_URI: uri, JWT_SECRET: secret, PORT: String(port) });
  assert.equal(failed.code, 1);
  assert.match(failed.output, /Startup failed/);
  assert.doesNotMatch(failed.output, /listening|mongodb:\/\//i);
});
