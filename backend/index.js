/**
 * CodeSphere — Collaboration Backend
 *
 * Handles:
 *  - Room join / leave / disconnect lifecycle
 *  - Real-time code sync between all clients in a room
 *  - Language change broadcast
 *  - New joiner code sync (catches up late joiners)
 *  - Static file serving for production build
 */

const express    = require('express');
const http       = require('http');
const path       = require('path');
const cors       = require('cors');
const { Server } = require('socket.io');
const ACTIONS    = require('./Actions');

// ─── Config ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

const ALLOWED_ORIGINS = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

// ─── App & Server ─────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
  },
  // Graceful reconnection
  pingTimeout:  60000,
  pingInterval: 25000,
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// ─── In-memory state ─────────────────────────────────────────────────────────
/**
 * userSocketMap  : { [socketId]: username }
 * roomCodeMap    : { [roomId]:   latestCode }   — for syncing late joiners
 * roomLangMap    : { [roomId]:   language }      — track active language per room
 */
const userSocketMap = {};
const roomCodeMap   = {};
const roomLangMap   = {};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
    socketId,
    username: userSocketMap[socketId],
  }));
}

// ─── Socket Events ────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[socket] connected   ${socket.id}`);

  // ── JOIN ──────────────────────────────────────────────────────────────────
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    if (!roomId || !username) {
      socket.emit('error', { message: 'roomId and username are required.' });
      return;
    }

    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);
    console.log(`[room:${roomId}] ${username} joined — ${clients.length} client(s)`);

    // Notify ALL clients in the room (including the new joiner) that someone joined
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });

    // Catch up the new joiner — send the current room code & language if they exist
    if (roomCodeMap[roomId]) {
      io.to(socket.id).emit(ACTIONS.CODE_CHANGE, { code: roomCodeMap[roomId] });
    }
    if (roomLangMap[roomId]) {
      io.to(socket.id).emit(ACTIONS.LANG_CHANGE, { language: roomLangMap[roomId] });
    }
  });

  // ── CODE_CHANGE ───────────────────────────────────────────────────────────
  // Broadcast to everyone in the room EXCEPT the sender, and cache latest code
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    roomCodeMap[roomId] = code;                     // cache for late joiners
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // ── SYNC_CODE ─────────────────────────────────────────────────────────────
  // Send current code directly to ONE specific socket (used when a new user joins)
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // ── LANG_CHANGE ───────────────────────────────────────────────────────────
  // Broadcast language switch to all other clients in the room
  socket.on(ACTIONS.LANG_CHANGE, ({ roomId, language }) => {
    roomLangMap[roomId] = language;                 // cache for late joiners
    socket.in(roomId).emit(ACTIONS.LANG_CHANGE, { language });
  });

  // ── DISCONNECTING ─────────────────────────────────────────────────────────
  // Fires just BEFORE the socket leaves its rooms — rooms are still accessible here
  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];

    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });

      // Clean up room state when the last person leaves
      const remaining = getAllConnectedClients(roomId).filter(c => c.socketId !== socket.id);
      if (remaining.length === 0) {
        delete roomCodeMap[roomId];
        delete roomLangMap[roomId];
        console.log(`[room:${roomId}] empty — state cleared`);
      }
    });

    delete userSocketMap[socket.id];
    console.log(`[socket] disconnected ${socket.id}`);
  });
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:  'ok',
    rooms:   Object.keys(roomCodeMap).length,
    clients: Object.keys(userSocketMap).length,
  });
});

// ─── Production static build ──────────────────────────────────────────────────
// Place the Vite build output in ./build before deploying
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\nCodeSphere backend running on http://localhost:${PORT}`);
  console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}\n`);
});