// @ts-nocheck
import { useState, useCallback } from 'react';
import { demoStorage, DEMO_KEYS } from '../services/demoStorage';
import type { Squad, TrainingSession } from '../types';

export function useSquads() {
  const [squads, setSquads] = useState<Squad[]>(() => {
    return demoStorage.get<Squad[]>(DEMO_KEYS.SQUADS, []);
  });

  const saveSquads = useCallback((newSquads: Squad[]) => {
    demoStorage.set(DEMO_KEYS.SQUADS, newSquads);
    setSquads(newSquads);
  }, []);

  const createSquad = useCallback((squad: Omit<Squad, 'id' | 'createdAt'>) => {
    const newSquad: Squad = {
      ...squad,
      id: 'sq' + Date.now(),
      createdAt: Date.now(),
    };
    const updated = [...squads, newSquad];
    saveSquads(updated);
    return newSquad;
  }, [squads, saveSquads]);

  const joinSquad = useCallback((squadId: string, userId: string) => {
    const updated = squads.map(s => 
      s.id === squadId && !s.members.includes(userId)
        ? { ...s, members: [...s.members, userId] }
        : s
    );
    saveSquads(updated);
  }, [squads, saveSquads]);

  const leaveSquad = useCallback((squadId: string, userId: string) => {
    const updated = squads.map(s => 
      s.id === squadId 
        ? { ...s, members: s.members.filter(m => m !== userId) }
        : s
    );
    saveSquads(updated);
  }, [squads, saveSquads]);

  const getSquadById = useCallback((id: string) => {
    return squads.find(s => s.id === id);
  }, [squads]);

  return {
    squads,
    createSquad,
    joinSquad,
    leaveSquad,
    getSquadById,
    saveSquads,
  };
}
