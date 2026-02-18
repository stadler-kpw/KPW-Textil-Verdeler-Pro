import React from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useUiStore } from '@/stores/useUiStore';
import { MIN_ZOOM, MAX_ZOOM } from '@/lib/constants';

export const CanvasZoomControls: React.FC = () => {
  const canvasZoom = useUiStore((s) => s.canvasZoom);
  const zoomIn = useUiStore((s) => s.zoomIn);
  const zoomOut = useUiStore((s) => s.zoomOut);
  const zoomReset = useUiStore((s) => s.zoomReset);

  const handleClick = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div className="absolute top-4 right-4 z-30 flex flex-col items-center gap-2">
      <button onClick={handleClick(zoomIn)} disabled={canvasZoom >= MAX_ZOOM} className="w-10 h-10 bg-white rounded-lg shadow-md text-slate-700 hover:text-primary-600 disabled:opacity-50 flex items-center justify-center">
        <ZoomIn size={20} />
      </button>
      <button onClick={handleClick(zoomReset)} className="w-10 h-10 bg-white rounded-lg shadow-md text-slate-700 hover:text-primary-600 flex items-center justify-center">
        <Maximize size={20} />
      </button>
      <button onClick={handleClick(zoomOut)} disabled={canvasZoom <= MIN_ZOOM} className="w-10 h-10 bg-white rounded-lg shadow-md text-slate-700 hover:text-primary-600 disabled:opacity-50 flex items-center justify-center">
        <ZoomOut size={20} />
      </button>
      <div className="w-10 h-10 bg-white/80 rounded-lg text-xs font-medium text-slate-500 backdrop-blur flex items-center justify-center">
        {Math.round(canvasZoom * 100)}%
      </div>
    </div>
  );
};
