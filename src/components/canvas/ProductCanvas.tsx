import React, { useRef, useEffect } from 'react';
import { useConfigStore } from '@/stores/useConfigStore';
import { useUiStore } from '@/stores/useUiStore';
import { LogoOverlay } from './LogoOverlay';
import { CanvasZoomControls } from './CanvasZoomControls';
import { UndoRedoControls } from './UndoRedoControls';
import { ImageThumbnailBar } from './ImageThumbnailBar';
import kpwLogo from '@/assets/KPW_Logo_Vector_Neu-01.webp';

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
          <div className="flex flex-col items-center justify-center gap-8 w-full max-w-md px-4">
            {/* Logo with pulse */}
            <div className="relative">
              <img
                src={kpwLogo}
                alt="KPW"
                className="h-16 w-auto object-contain animate-pulse"
              />
            </div>

            {/* Skeleton canvas placeholder */}
            <div className="w-full space-y-4">
              <div className="w-full aspect-[3/4] rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] shadow-inner" />

              {/* Skeleton thumbnail bar */}
              <div className="flex justify-center gap-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-14 h-14 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>

            <p className="text-slate-400 text-sm">
              Veredelungskonfigurator lädt...
            </p>
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
