// src/api.js
// Axios-first API wrapper that reads VITE_API_URL from .env and falls back to a tiny in-memory mock.
// TODO: When you deploy/finish, remove fallback or replace TODO areas with real backend-only calls.

import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- tiny fallback mock (keeps UI usable when backend not reachable) ---
const fallback = {
  sessions: [],
  history: {}, // { sessionId: [entries] }
};

// small helper
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * getClientId()
 * Generate or retrieve a stable clientId from localStorage
 */
export const getClientId = () => {
  const STORAGE_KEY = 'chat_app_client_id';
  let clientId = localStorage.getItem(STORAGE_KEY);
  if (!clientId) {
    clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, clientId);
  }
  return clientId;
};

/**
 * newSession(firstQuestion?)
 * POST /api/sessions/new
 */
export const newSession = async (firstQuestion = '') => {
  // try real backend first
  try {
    const res = await axios.post(`${BASE}/sessions/new`, { firstQuestion });
    if (res?.data?.success) return { success: true, session: res.data.session };
  } catch (err) {
    // fallback to mock below
  }

  // fallback: create offline session
  await wait(300);
  const id = `offline-${Date.now()}`;
  const title = firstQuestion ? firstQuestion.slice(0, 40) : `Session ${fallback.sessions.length + 1}`;
  const createdAt = new Date().toISOString();
  const session = { id, title, createdAt };

  fallback.sessions.unshift(session);
  fallback.history[id] = [];
  if (firstQuestion) {
    const entry = {
      id: `entry-${Date.now()}`,
      question: firstQuestion,
      answer: {
        description: `Offline answer for "${firstQuestion}"`,
        table: { columns: ['A', 'B'], rows: [['x', 'y']] },
        feedback: { like: 0, dislike: 0 },
      },
      timestamp: new Date().toISOString(),
    };
    fallback.history[id].push(entry);
  }

  return { success: true, session };
};

/**
 * getSessions()
 * GET /api/sessions
 */
export const getSessions = async () => {
  try {
    const res = await axios.get(`${BASE}/sessions`);
    if (res?.data?.success) return { success: true, sessions: res.data.sessions };
  } catch (err) {
    // fallback
  }

  await wait(150);
  return { success: true, sessions: fallback.sessions.map(({ id, title, createdAt }) => ({ id, title, createdAt })) };
};

/**
 * getHistory(sessionId)
 * GET /api/sessions/:id  (server returns full session or history)
 */
export const getHistory = async (sessionId) => {
  try {
    // backend variant: GET /api/sessions/:id returns full session (matching many earlier implementations)
    const res = await axios.get(`${BASE}/sessions/${sessionId}`);
    if (res?.data?.success) {
      // server returns full session spread (e.g. { success: true, id, title, createdAt, history: [...] })
      // or some versions return { success: true, history: [...] }
      if (res.data.history) return { success: true, history: res.data.history };
      // else rebuild history from spread
      const copy = { ...res.data };
      delete copy.success;
      const hist = copy.history || [];
      return { success: true, history: hist };
    }
  } catch (err) {
    // fallback
  }

  await wait(150);
  return { success: true, history: fallback.history[sessionId] || [] };
};

/**
 * askQuestion(sessionId, question)
 * POST /api/sessions/:id/ask
 */
export const askQuestion = async (sessionId, question) => {
  try {
    const res = await axios.post(`${BASE}/sessions/${sessionId}/ask`, { question });
    if (res?.data?.success) return { success: true, entry: res.data.entry };
  } catch (err) {
    // fallback
  }

  await wait(600);
  // fallback entry with semantic table example
  const entry = {
    id: `entry-${Date.now()}`,
    question,
    answer: {
      description: `Offline mock answer for "${question}"`,
      table: { columns: ['Metric', 'Value'], rows: [['Total', '42'], ['Count', '2']] },
      feedback: { like: 0, dislike: 0 },
    },
    timestamp: new Date().toISOString(),
  };

  fallback.history[sessionId] = fallback.history[sessionId] || [];
  fallback.history[sessionId].push(entry);
  return { success: true, entry };
};

/**
 * sendFeedback(sessionId, entryId, action)
 * POST /api/sessions/:id/feedback  (body: { entryId, action, clientId })
 */
export const sendFeedback = async (sessionId, entryId, action) => {
  const clientId = getClientId();
  
  try {
    const res = await axios.post(`${BASE}/sessions/${sessionId}/feedback`, { 
      entryId, 
      action, 
      clientId 
    });
    if (res?.data?.success) {
      return { 
        success: true, 
        entry: res.data.entry, 
        userVote: res.data.userVote || null 
      };
    }
  } catch (err) {
    // fallback
  }

  await wait(100);
  const hist = fallback.history[sessionId] || [];
  const entry = hist.find((e) => e.id === entryId);
  if (entry) {
    entry.answer = entry.answer || { feedback: { like: 0, dislike: 0 }, votes: {} };
    entry.answer.feedback = entry.answer.feedback || { like: 0, dislike: 0 };
    entry.answer.votes = entry.answer.votes || {};
    
    const currentVote = entry.answer.votes[clientId] || null;
    let newVote = null;
    
    if (action === 'like') {
      if (currentVote === 'like') {
        delete entry.answer.votes[clientId];
        newVote = null;
      } else {
        entry.answer.votes[clientId] = 'like';
        newVote = 'like';
      }
    } else if (action === 'dislike') {
      if (currentVote === 'dislike') {
        delete entry.answer.votes[clientId];
        newVote = null;
      } else {
        entry.answer.votes[clientId] = 'dislike';
        newVote = 'dislike';
      }
    }
    
    // Recalculate counts
    const counts = { like: 0, dislike: 0 };
    Object.values(entry.answer.votes).forEach(vote => {
      if (vote === 'like') counts.like++;
      if (vote === 'dislike') counts.dislike++;
    });
    entry.answer.feedback = counts;
    
    return { success: true, entry, userVote: newVote };
  }
  return { success: false, error: 'entry not found (fallback)' };
};

// default export (optional)
export default {
  newSession,
  getSessions,
  getHistory,
  askQuestion,
  sendFeedback,
  getClientId,
};
