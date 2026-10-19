const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function useTempDataDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veelion-test-'));
  process.env.DATA_DIR = dir;
  return dir;
}

function writeJson(dir, fileName, value) {
  fs.writeFileSync(path.join(dir, fileName), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function readJson(dir, fileName) {
  return JSON.parse(fs.readFileSync(path.join(dir, fileName), 'utf8'));
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  delete process.env.DATA_DIR;
}

module.exports = {
  useTempDataDir,
  writeJson,
  readJson,
  cleanup,
};
