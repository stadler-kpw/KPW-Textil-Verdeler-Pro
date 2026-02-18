import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { useStore } from 'zustand';
import { useConfigStore } from '@/stores/useConfigStore';

export const UndoRedoControls: React.FC = () => {
  const { undo, redo, pastStates, futureStates } = useStore(useConfigStore.temporal);

  return (
    <div className="absolute top-4 left-4 z-30 flex gap-2">
      <button
        onClick={() => undo()}
        disabled={pastStates.length === 0}
        className="bg-white p-2 rounded shadow-md text-slate-700 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Undo2 size={20} />
      </button>
      <button
        onClick={() => redo()}
        disabled={futureStates.length === 0}
        className="bg-white p-2 rounded shadow-md text-slate-700 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Redo2 size={20} />
      </button>
    </div>
  );
};
