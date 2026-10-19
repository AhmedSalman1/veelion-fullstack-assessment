const fs = require('node:fs');

const config = require('../../../config');

function loadDataA() {
  const filePath = config.activityFilePath();

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
  }

  let raw = fs.readFileSync(filePath, 'utf8');
  if (!raw) {
    raw = '[]';
  }

  return JSON.parse(raw);
}

function loadDataB() {
  const filePath = config.activityFilePath();

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
  }

  let raw = fs.readFileSync(filePath, 'utf8');
  if (!raw) {
    raw = '[]';
  }

  return JSON.parse(raw);
}

function getAllActivity() {
  const arr = loadDataA();
  return arr;
}

function createNewActivity(b) {
  const list = loadDataB();
  const one = {
    id: String(Date.now()),
    action: b.action,
    info: b.info,
    when: new Date().toISOString(),
  };

  list.push(one);
  fs.writeFileSync(config.activityFilePath(), JSON.stringify(list, null, 2));
  return one;
}

module.exports = {
  getAllActivity,
  createNewActivity,
};
