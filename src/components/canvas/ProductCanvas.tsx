import React, { useRef, useEffect } from 'react';
import { Shirt } from 'lucide-react';
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
  const blueprintStatus = useConfigStore((s) => s.blueprintStatus);
  const blueprintError = useConfigStore((s) => s.blueprintError);
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
        {blueprintStatus === 'loading' ? (
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                <Shirt className="w-10 h-10 text-primary-400 animate-pulse" />
              </div>
              <div className="absolute -inset-2 rounded-3xl border-4 border-slate-200 border-t-primary-400 animate-spin" />
            </div>
            <div className="text-center mt-2">
              <p className="text-slate-700 font-semibold text-lg">
                Veredelungskonfigurator lädt...
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Blueprint-Ansichten werden generiert
              </p>
            </div>
          </div>
        ) : (
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
        )}

        {blueprintStatus === 'error' && blueprintError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg shadow-lg text-sm z-30 animate-fade-in">
            {blueprintError}
          </div>
        )}
      </div>

      <ImageThumbnailBar />
    </div>
  );
};
