const net = require('node:net');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { setTimeout: delay } = require('node:timers/promises');
const { mongo: { MongoClient } } = require('mongoose');

async function freePort() {
  const server = net.createServer().listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}

async function untilReady(attempt, child) {
  const expires = Date.now() + 20000;
  let error;
  while (Date.now() < expires) {
    if (child.exitCode !== null || child.spawnError) throw child.spawnError || new Error('Test process exited: ' + child.exitCode);
    try {
      return await attempt();
    } catch (failure) {
      error = failure;
      await delay(200);
    }
  }
  throw error;
}

function spawnLocal(command, args, options = {}) {
  const child = spawn(command, args, { stdio: 'ignore', windowsHide: true, ...options });
  child.on('error', error => { child.spawnError = error; });
  return child;
}

async function stop(child) {
  if (child.exitCode !== null || child.spawnError) return;
  const finished = once(child, 'exit');
  child.kill();
  await finished;
}

async function startMongo(t, binary) {
  const tmp = await fs.realpath(os.tmpdir());
  const root = await fs.mkdtemp(path.join(tmp, 'job-portal-test-'));
  const data = path.join(root, 'db');
  await fs.mkdir(data);
  const port = await freePort();
  const address = '127.0.0.1:' + port;
  const process = spawnLocal(binary, ['--dbpath', data, '--bind_ip', '127.0.0.1', '--port', String(port), '--replSet', 'jobPortalTest']);
  t.after(async () => {
    await stop(process);
    const resolved = await fs.realpath(root);
    if (path.dirname(resolved) !== tmp || !path.basename(resolved).startsWith('job-portal-test-')) {
      throw new Error('Unexpected MongoDB test directory');
    }
    await fs.rm(resolved, { recursive: true, force: true, maxRetries: 5 });
  });

  // The URI is built here from a loopback port. Tests never read MONGO_URI.
  async function withAdmin(operation) {
    const client = new MongoClient('mongodb://' + address + '/?directConnection=true', { serverSelectionTimeoutMS: 500 });
    try {
      return await operation(client.db('admin'));
    } finally {
      await client.close();
    }
  }
  await untilReady(() => withAdmin(admin => admin.command({ ping: 1 })), process);
  await withAdmin(async admin => {
    const options = await admin.command({ getCmdLineOpts: 1 });
    if (options.parsed.storage.dbPath !== data) throw new Error('Unexpected MongoDB test instance');
    await admin.command({
      replSetInitiate: { _id: 'jobPortalTest', members: [{ _id: 0, host: address }] },
    });
  });
  await untilReady(() => withAdmin(async admin => {
    const result = await admin.command({ hello: 1 });
    if (!result.isWritablePrimary || result.setName !== 'jobPortalTest') throw new Error('Test replica set is not ready');
  }), process);
  return { root, uri: 'mongodb://' + address + '/job_portal_test?replicaSet=jobPortalTest' };
}

module.exports = { startMongo, freePort, spawnLocal, stop, untilReady };
