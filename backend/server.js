// backend/server.js
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { readSessions, writeSessions } = require('./mockData');

const app = express();
app.use(cors());
app.use(express.json());

function createDummyAnswer(question) {
  const columns = ['Metric', 'Value', 'Notes'];
  const rows = [
    ['Total', (question.length * 7) % 1000, 'auto-estimate'],
    ['Average', ((question.length * 3) % 100).toFixed(2), 'avg'],
    ['Count', (question.length % 10) + 1, 'count']
  ];
  const description = `Mock answer for: "${question}".`;
  return { description, table: { columns, rows }, feedback: { like: 0, dislike: 0 }, votes: {} };
}

/* POST /api/sessions/new */
app.post('/api/sessions/new', (req, res) => {
  const { firstQuestion } = req.body || {};
  const sessions = readSessions();
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const title = firstQuestion && firstQuestion.trim().length > 0
    ? (firstQuestion.split(' ').slice(0, 6).join(' ') + (firstQuestion.length > 30 ? '...' : ''))
    : `Session ${sessions.length + 1}`;

  const session = { id, title, createdAt, history: [] };

  if (firstQuestion && firstQuestion.trim()) {
    const entry = {
      id: uuidv4(),
      question: firstQuestion,
      answer: createDummyAnswer(firstQuestion),
      timestamp: new Date().toISOString()
    };
    session.history.push(entry);
  }

  sessions.unshift(session);
  writeSessions(sessions);

  return res.json({ success: true, session: { id: session.id, title: session.title, createdAt: session.createdAt } });
});

/* GET /api/sessions */
app.get('/api/sessions', (req, res) => {
  const sessions = readSessions();
  const list = sessions.map(s => ({ id: s.id, title: s.title, createdAt: s.createdAt }));
  return res.json({ success: true, sessions: list });
});

/* GET /api/sessions/:id */
app.get('/api/sessions/:id', (req, res) => {
  const id = req.params.id;
  const sessions = readSessions();
  const session = sessions.find(s => s.id === id);
  if (!session) return res.status(404).json({ success: false, error: 'session not found' });
  return res.json({ success: true, ...session });
});

/* POST /api/sessions/:id/ask */
app.post('/api/sessions/:id/ask', (req, res) => {
  const id = req.params.id;
  const { question } = req.body || {};
  if (!question || typeof question !== 'string' || question.trim() === '') {
    return res.status(400).json({ success: false, error: 'question required' });
  }

  const sessions = readSessions();
  const session = sessions.find(s => s.id === id);
  if (!session) return res.status(404).json({ success: false, error: 'session not found' });

  const entry = {
    id: uuidv4(),
    question,
    answer: createDummyAnswer(question),
    timestamp: new Date().toISOString()
  };

  session.history = session.history || [];
  session.history.push(entry);
  writeSessions(sessions);

  return res.json({ success: true, entry });
});

/* POST /api/sessions/:id/feedback */
app.post('/api/sessions/:id/feedback', (req, res) => {
  const id = req.params.id;
  const { entryId, action, clientId } = req.body || {};
  if (!entryId || !action || !clientId) {
    return res.status(400).json({ success: false, error: 'entryId, action, and clientId required' });
  }
  if (!['like', 'dislike'].includes(action)) {
    return res.status(400).json({ success: false, error: 'invalid action' });
  }

  const sessions = readSessions();
  const session = sessions.find(s => s.id === id);
  if (!session) return res.status(404).json({ success: false, error: 'session not found' });

  const entry = (session.history || []).find(e => e.id === entryId);
  if (!entry) return res.status(404).json({ success: false, error: 'entry not found' });

  entry.answer = entry.answer || { feedback: { like: 0, dislike: 0 }, votes: {} };
  entry.answer.feedback = entry.answer.feedback || { like: 0, dislike: 0 };
  entry.answer.votes = entry.answer.votes || {};

  const currentVote = entry.answer.votes[clientId] || null;

  // Calculate current counts based on all votes
  const voteCounts = { like: 0, dislike: 0 };
  Object.values(entry.answer.votes).forEach(vote => {
    if (vote === 'like') voteCounts.like++;
    if (vote === 'dislike') voteCounts.dislike++;
  });

  let newVote = null;

  if (action === 'like') {
    if (currentVote === 'like') {
      // Undo: remove like vote
      delete entry.answer.votes[clientId];
      newVote = null;
    } else {
      // Add like vote, remove dislike if present
      entry.answer.votes[clientId] = 'like';
      newVote = 'like';
    }
  } else if (action === 'dislike') {
    if (currentVote === 'dislike') {
      // Undo: remove dislike vote
      delete entry.answer.votes[clientId];
      newVote = null;
    } else {
      // Add dislike vote, remove like if present
      entry.answer.votes[clientId] = 'dislike';
      newVote = 'dislike';
    }
  }

  // Recalculate counts from all votes
  const updatedCounts = { like: 0, dislike: 0 };
  Object.values(entry.answer.votes).forEach(vote => {
    if (vote === 'like') updatedCounts.like++;
    if (vote === 'dislike') updatedCounts.dislike++;
  });

  entry.answer.feedback = updatedCounts;

  writeSessions(sessions);
  return res.json({ success: true, entry, userVote: newVote });
});

/* Health */
app.get('/api/health', (req, res) => res.json({ ok: true }));

/* Start server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Mock backend listening on port ${PORT}`);
});
