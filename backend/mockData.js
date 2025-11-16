// backend/mockData.js
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const sessionsFile = path.join(dataDir, 'sessions.json');

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  if (!fs.existsSync(sessionsFile)) fs.writeFileSync(sessionsFile, JSON.stringify([], null, 2));
}

function readSessions() {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(sessionsFile, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function writeSessions(data) {
  ensureDataDir();
  fs.writeFileSync(sessionsFile, JSON.stringify(data, null, 2));
}

module.exports = { readSessions, writeSessions };
