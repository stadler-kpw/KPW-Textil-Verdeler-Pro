import { create } from 'zustand';
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from '@/lib/constants';

interface UiState {
  canvasZoom: number;
  canvasPanX: number;
  canvasPanY: number;
  showShareModal: boolean;
  errorMsg: string | null;
  canvasRenderedDimensions: Record<number, { width: number; height: number }>;
}

interface UiActions {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  setCanvasZoom: (zoom: number) => void;
  setCanvasPan: (x: number, y: number) => void;
  setShowShareModal: (show: boolean) => void;
  setErrorMsg: (msg: string | null) => void;
  setCanvasRenderedDimensions: (viewIndex: number, dims: { width: number; height: number }) => void;
}

export const useUiStore = create<UiState & UiActions>()((set) => ({
  canvasZoom: 1,
  canvasPanX: 0,
  canvasPanY: 0,
  showShareModal: false,
  errorMsg: null,
  canvasRenderedDimensions: {},

  zoomIn: () => set((state) => ({
    canvasZoom: Math.min(MAX_ZOOM, state.canvasZoom + ZOOM_STEP),
  })),

  zoomOut: () => set((state) => {
    const newZoom = Math.max(MIN_ZOOM, state.canvasZoom - ZOOM_STEP);
    return newZoom <= 1
      ? { canvasZoom: newZoom, canvasPanX: 0, canvasPanY: 0 }
      : { canvasZoom: newZoom };
  }),

  zoomReset: () => set({ canvasZoom: 1, canvasPanX: 0, canvasPanY: 0 }),

  setCanvasZoom: (zoom) => set((state) => {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
    return clamped <= 1
      ? { canvasZoom: clamped, canvasPanX: 0, canvasPanY: 0 }
      : { canvasZoom: clamped };
  }),

  setCanvasPan: (x, y) => set({ canvasPanX: x, canvasPanY: y }),

  setShowShareModal: (show) => set({ showShareModal: show }),

  setErrorMsg: (msg) => set({ errorMsg: msg }),

  setCanvasRenderedDimensions: (viewIndex, dims) => set((state) => ({
    canvasRenderedDimensions: { ...state.canvasRenderedDimensions, [viewIndex]: dims },
  })),
}));
