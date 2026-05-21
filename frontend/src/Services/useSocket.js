/**
 * useSocket — manages the Socket.IO connection for a collaboration room.
 *
 * Usage:
 *   const { clients, socketRef, emitCodeChange, emitLangChange } = useSocket({
 *     roomId, username, onCodeChange, onLangChange,
 *   });
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

// ─── Match your backend URL ────────────────────────────────────────────────────
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

// Actions must match backend/Actions.js
const ACTIONS = {
  JOIN:         'join',
  JOINED:       'joined',
  DISCONNECTED: 'disconnected',
  CODE_CHANGE:  'code-change',
  SYNC_CODE:    'sync-code',
  LANG_CHANGE:  'lang-change',
};

export default function useSocket({ roomId, username, onCodeChange, onLangChange, onUserJoin, onUserLeave }) {
  const socketRef          = useRef(null);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (!roomId || !username) return;

    // ── Connect ──────────────────────────────────────────────────────────────
    const socket = io(SERVER_URL, {
      transports:      ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay:    1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[socket] connected:', socket.id);
      socket.emit(ACTIONS.JOIN, { roomId, username });
    });

    socket.on('connect_error', (err) => {
      console.error('[socket] connection error:', err.message);
    });

    // ── JOINED — update client list & sync code to new joiner ────────────────
    socket.on(ACTIONS.JOINED, ({ clients: c, username: joinedUser, socketId }) => {
      setClients(c);

      // If someone else just joined, notify and send them the current code
      if (joinedUser !== username && socketId !== socket.id) {
        onUserJoin?.(joinedUser);
        const currentCode = document.querySelector('.cs-collab-editor-textarea')?.value || '';
        socket.emit(ACTIONS.SYNC_CODE, { socketId, code: currentCode });
      }
    });

    // ── CODE_CHANGE — update editor with incoming code ────────────────────────
    socket.on(ACTIONS.CODE_CHANGE, ({ code }) => {
      if (code !== undefined) onCodeChange?.(code);
    });

    // ── LANG_CHANGE — switch language for all clients ─────────────────────────
    socket.on(ACTIONS.LANG_CHANGE, ({ language }) => {
      if (language) onLangChange?.(language);
    });

    // ── DISCONNECTED — remove client from list ────────────────────────────────
    socket.on(ACTIONS.DISCONNECTED, ({ socketId, username: leftUser }) => {
      setClients(prev => prev.filter(c => c.socketId !== socketId));
      if (leftUser) onUserLeave?.(leftUser);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, username]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Emit helpers ─────────────────────────────────────────────────────────────
  const emitCodeChange = useCallback((code) => {
    socketRef.current?.emit(ACTIONS.CODE_CHANGE, { roomId, code });
  }, [roomId]);

  const emitLangChange = useCallback((language) => {
    socketRef.current?.emit(ACTIONS.LANG_CHANGE, { roomId, language });
  }, [roomId]);

  return { clients, socketRef, emitCodeChange, emitLangChange };
}