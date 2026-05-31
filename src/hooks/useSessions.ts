// @ts-nocheck
import { useState, useCallback } from 'react';
import { demoStorage, DEMO_KEYS } from '../services/demoStorage';
import type { TrainingSession, SessionMessage } from '../types';

export function useSessions() {
  const [sessions, setSessions] = useState<TrainingSession[]>(() => {
    return demoStorage.get<TrainingSession[]>(DEMO_KEYS.SESSIONS, []);
  });

  const [sessionMessages, setSessionMessages] = useState<Record<string, SessionMessage[]>>(() => {
    return demoStorage.get<Record<string, SessionMessage[]>>(DEMO_KEYS.SESSION_MESSAGES, {});
  });

  const saveSessions = useCallback((newSessions: TrainingSession[]) => {
    demoStorage.set(DEMO_KEYS.SESSIONS, newSessions);
    setSessions(newSessions);
  }, []);

  const saveSessionMessages = useCallback((msgs: Record<string, SessionMessage[]>) => {
    demoStorage.set(DEMO_KEYS.SESSION_MESSAGES, msgs);
    setSessionMessages(msgs);
  }, []);

  const addSession = useCallback((session: TrainingSession) => {
    const updated = [...sessions, session];
    saveSessions(updated);
  }, [sessions, saveSessions]);

  const joinSession = useCallback((sessionId: string, userId: string) => {
    const updated = sessions.map(s => 
      s.id === sessionId && !s.participants.includes(userId)
        ? { ...s, participants: [...s.participants, userId] }
        : s
    );
    saveSessions(updated);
  }, [sessions, saveSessions]);

  return {
    sessions,
    sessionMessages,
    saveSessions,
    saveSessionMessages,
    addSession,
    joinSession,
  };
}
