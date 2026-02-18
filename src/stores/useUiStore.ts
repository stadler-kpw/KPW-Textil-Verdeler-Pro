import { create } from 'zustand';
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from '@/lib/constants';

interface UiState {
  canvasZoom: number;
  showShareModal: boolean;
  errorMsg: string | null;
  canvasRenderedDimensions: Record<number, { width: number; height: number }>;
}

interface UiActions {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  setShowShareModal: (show: boolean) => void;
  setErrorMsg: (msg: string | null) => void;
  setCanvasRenderedDimensions: (viewIndex: number, dims: { width: number; height: number }) => void;
}

export const useUiStore = create<UiState & UiActions>()((set) => ({
  canvasZoom: 1,
  showShareModal: false,
  errorMsg: null,
  canvasRenderedDimensions: {},

  zoomIn: () => set((state) => ({
    canvasZoom: Math.min(MAX_ZOOM, state.canvasZoom + ZOOM_STEP),
  })),

  zoomOut: () => set((state) => ({
    canvasZoom: Math.max(MIN_ZOOM, state.canvasZoom - ZOOM_STEP),
  })),

  zoomReset: () => set({ canvasZoom: 1 }),

  setShowShareModal: (show) => set({ showShareModal: show }),

  setErrorMsg: (msg) => set({ errorMsg: msg }),

  setCanvasRenderedDimensions: (viewIndex, dims) => set((state) => ({
    canvasRenderedDimensions: { ...state.canvasRenderedDimensions, [viewIndex]: dims },
  })),
}));
