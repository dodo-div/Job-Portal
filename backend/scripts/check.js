const { readdirSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const directories = ['config', 'controllers', 'middleware', 'models', 'routes', 'scripts', 'services', 'test'];
const files = ['server.js', 'app.js'];

for (const directory of directories) {
  for (const name of readdirSync(path.join(root, directory))) {
    if (name.endsWith('.js')) files.push(path.join(directory, name));
  }
}
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = 1;
}
