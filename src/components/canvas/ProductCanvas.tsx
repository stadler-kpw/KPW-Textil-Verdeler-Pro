import React, { useRef, useEffect } from 'react';
import { useConfigStore } from '@/stores/useConfigStore';
import { useUiStore } from '@/stores/useUiStore';
import { LogoOverlay } from './LogoOverlay';
import { CanvasZoomControls } from './CanvasZoomControls';
import { UndoRedoControls } from './UndoRedoControls';
import { ImageThumbnailBar } from './ImageThumbnailBar';

export const ProductCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const productImages = useConfigStore((s) => s.productImages);
  const activeImageIndex = useConfigStore((s) => s.activeImageIndex);
  const selectLogo = useConfigStore((s) => s.selectLogo);
  const canvasZoom = useUiStore((s) => s.canvasZoom);
  const setCanvasRenderedDimensions = useUiStore((s) => s.setCanvasRenderedDimensions);

  const activeImageUrl = productImages[activeImageIndex];

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setCanvasRenderedDimensions(activeImageIndex, {
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeImageIndex, setCanvasRenderedDimensions]);

  return (
    <div className="flex-1 bg-slate-100 relative flex flex-col h-full overflow-hidden">
      <UndoRedoControls />
      <CanvasZoomControls />

      <div
        className="flex-1 flex items-center justify-center p-8 overflow-hidden bg-slate-100 relative"
        onClick={() => selectLogo(null)}
      >
        <div
          ref={canvasRef}
          className="relative shadow-2xl bg-white transition-transform duration-100 ease-out origin-center"
          style={{ transform: `scale(${canvasZoom})` }}
        >
          {activeImageUrl ? (
            <img
              src={activeImageUrl}
              className="max-h-[75vh] max-w-[85vw] w-auto h-auto block select-none pointer-events-none"
              alt="Produkt"
            />
          ) : (
            <div className="w-[300px] h-[400px] flex items-center justify-center text-slate-400 bg-slate-50">Kein Bild geladen</div>
          )}
          <LogoOverlay />
        </div>
      </div>

      <ImageThumbnailBar />
    </div>
  );
};
