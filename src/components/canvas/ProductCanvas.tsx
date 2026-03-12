import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useConfigStore } from '@/stores/useConfigStore';
import { useUiStore } from '@/stores/useUiStore';
import { LogoOverlay } from './LogoOverlay';
import { CanvasZoomControls } from './CanvasZoomControls';
import { UndoRedoControls } from './UndoRedoControls';
import { ImageThumbnailBar } from './ImageThumbnailBar';


export const ProductCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [imageError, setImageError] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const productImages = useConfigStore((s) => s.productImages);
  const activeImageIndex = useConfigStore((s) => s.activeImageIndex);
  const selectLogo = useConfigStore((s) => s.selectLogo);
  const canvasZoom = useUiStore((s) => s.canvasZoom);
  const canvasPanX = useUiStore((s) => s.canvasPanX);
  const canvasPanY = useUiStore((s) => s.canvasPanY);
  const setCanvasZoom = useUiStore((s) => s.setCanvasZoom);
  const setCanvasPan = useUiStore((s) => s.setCanvasPan);
  const setCanvasRenderedDimensions = useUiStore((s) => s.setCanvasRenderedDimensions);

  const activeImageUrl = productImages[activeImageIndex];
  const isZoomed = canvasZoom > 1;

  useEffect(() => {
    setImageError(false);
  }, [activeImageIndex, activeImageUrl]);

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

  // Wheel: pinch-to-zoom (ctrlKey) or scroll-to-zoom, trackpad pan (no ctrlKey + zoomed)
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    const zoom = useUiStore.getState().canvasZoom;

    if (e.ctrlKey) {
      // Trackpad pinch or Ctrl+scroll → zoom
      const delta = -e.deltaY * 0.01;
      setCanvasZoom(zoom + delta);
    } else if (zoom > 1) {
      // Trackpad two-finger scroll or mouse wheel when zoomed → pan
      const { canvasPanX: px, canvasPanY: py } = useUiStore.getState();
      setCanvasPan(px - e.deltaX, py - e.deltaY);
    } else {
      // Not zoomed: scroll wheel zooms
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      setCanvasZoom(zoom + delta);
    }
  }, [setCanvasZoom, setCanvasPan]);

  // Attach wheel with { passive: false } to allow preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Middle-mouse pan
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button === 1) {
      // Middle mouse button
      e.preventDefault();
      const { canvasPanX: px, canvasPanY: py } = useUiStore.getState();
      panStartRef.current = { x: e.clientX, y: e.clientY, panX: px, panY: py };
      setIsPanning(true);
    }
  }, []);

  useEffect(() => {
    if (!isPanning) return;

    const handleMove = (e: PointerEvent) => {
      const { x, y, panX, panY } = panStartRef.current;
      setCanvasPan(panX + (e.clientX - x), panY + (e.clientY - y));
    };

    const handleUp = () => setIsPanning(false);

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [isPanning, setCanvasPan]);

  const canvasCursor = isPanning ? 'grabbing' : isZoomed ? 'grab' : 'default';

  return (
    <div className="flex-1 bg-slate-100 relative flex flex-col h-full overflow-hidden">
      <UndoRedoControls />
      <CanvasZoomControls />

      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-8 overflow-hidden bg-slate-100 relative"
        style={{ cursor: canvasCursor }}
        onClick={() => selectLogo(null)}
        onPointerDown={handlePointerDown}
      >
        <div
          ref={canvasRef}
          className="relative shadow-2xl bg-white transition-transform duration-100 ease-out origin-center"
          style={{ transform: `scale(${canvasZoom}) translate(${canvasPanX / canvasZoom}px, ${canvasPanY / canvasZoom}px)` }}
        >
          {activeImageUrl && !imageError ? (
            <img
              src={activeImageUrl}
              className="max-h-[75vh] max-w-[85vw] w-auto h-auto block select-none pointer-events-none"
              alt="Produkt"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`w-[300px] h-[400px] flex items-center justify-center text-sm ${imageError ? 'text-red-400 bg-red-50 border border-red-200 rounded-lg' : 'text-slate-400 bg-slate-50'}`}>
              {imageError ? 'Bild konnte nicht geladen werden' : 'Kein Bild geladen'}
            </div>
          )}
          <LogoOverlay />
        </div>
      </div>

      <ImageThumbnailBar />
    </div>
  );
};
