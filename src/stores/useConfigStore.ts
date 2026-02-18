import { create } from 'zustand';
import { temporal } from 'zundo';
import { DEFAULT_SIZES, RefinementType } from '@/types';
import type { LogoObject } from '@/types';

export interface ConfigState {
  productImages: string[];
  activeImageIndex: number;
  basePrice: number | null;
  productRef: string | null;
  logos: LogoObject[];
  selectedLogoId: string | null;
  quantities: Record<string, number>;
  availableSizes: string[];
  isUnsureAboutSizes: boolean;
  totalEstimatedQuantity: number;
  blueprintStatus: 'idle' | 'loading' | 'done' | 'error';
  blueprintError: string | null;
  originalImages: string[];
}

interface ConfigActions {
  setProductImages: (images: string[], sizes?: string[] | null, price?: number | null, productRef?: string | null) => void;
  setActiveImageIndex: (index: number) => void;
  addLogo: (file: File, activeImageIndex: number) => void;
  updateLogo: (id: string, updates: Partial<LogoObject>) => void;
  deleteLogo: (id: string) => void;
  selectLogo: (id: string | null) => void;
  setRefinement: (id: string, refinement: RefinementType) => void;
  setQuantity: (size: string, qty: number) => void;
  setTotalEstimatedQuantity: (qty: number) => void;
  setIsUnsureAboutSizes: (val: boolean) => void;
  setBlueprintStatus: (status: 'idle' | 'loading' | 'done' | 'error') => void;
  setBlueprintError: (error: string | null) => void;
  setOriginalImages: (images: string[]) => void;
  replaceBlueprintImages: (images: string[]) => void;
  fallbackToOriginalImages: () => void;
  reset: () => void;
}

const initialState: ConfigState = {
  productImages: [],
  activeImageIndex: 0,
  basePrice: null,
  productRef: null,
  logos: [],
  selectedLogoId: null,
  quantities: DEFAULT_SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {} as Record<string, number>),
  availableSizes: DEFAULT_SIZES,
  isUnsureAboutSizes: false,
  totalEstimatedQuantity: 0,
  blueprintStatus: 'idle',
  blueprintError: null,
  originalImages: [],
};

export const useConfigStore = create<ConfigState & ConfigActions>()(
  temporal(
    (set) => ({
      ...initialState,

      setProductImages: (images, sizes, price, productRef) => {
        const newSizes = sizes || DEFAULT_SIZES;
        const newQuantities: Record<string, number> = {};
        newSizes.forEach(s => newQuantities[s] = 0);

        set({
          productImages: images,
          activeImageIndex: 0,
          availableSizes: newSizes,
          quantities: newQuantities,
          logos: [],
          selectedLogoId: null,
          isUnsureAboutSizes: false,
          totalEstimatedQuantity: 0,
          basePrice: price ?? null,
          productRef: productRef ?? null,
        });
      },

      setActiveImageIndex: (index) => set({ activeImageIndex: index, selectedLogoId: null }),

      addLogo: (file, activeImageIndex) => {
        const url = URL.createObjectURL(file);
        const newLogo: LogoObject = {
          id: Date.now().toString(),
          url,
          viewIndex: activeImageIndex,
          x: 40,
          y: 30,
          scale: 1,
          rotation: 0,
          refinement: RefinementType.DRUCK,
          aiSuggestion: null,
        };
        set((state) => ({
          logos: [...state.logos, newLogo],
          selectedLogoId: newLogo.id,
        }));
      },

      updateLogo: (id, updates) => set((state) => ({
        logos: state.logos.map(l => l.id === id ? { ...l, ...updates } : l),
      })),

      deleteLogo: (id) => set((state) => ({
        logos: state.logos.filter(l => l.id !== id),
        selectedLogoId: state.selectedLogoId === id ? null : state.selectedLogoId,
      })),

      selectLogo: (id) => set({ selectedLogoId: id }),

      setRefinement: (id, refinement) => set((state) => ({
        logos: state.logos.map(l => l.id === id ? { ...l, refinement } : l),
      })),

      setQuantity: (size, qty) => set((state) => ({
        quantities: { ...state.quantities, [size]: Math.max(0, qty) },
      })),

      setTotalEstimatedQuantity: (qty) => set({ totalEstimatedQuantity: Math.max(0, qty) }),

      setIsUnsureAboutSizes: (val) => set({ isUnsureAboutSizes: val }),

      setBlueprintStatus: (status) => set({ blueprintStatus: status }),
      setBlueprintError: (error) => set({ blueprintError: error }),
      setOriginalImages: (images) => set({ originalImages: images }),
      replaceBlueprintImages: (images) => set({
        productImages: images,
        activeImageIndex: 0,
        blueprintStatus: 'done',
      }),
      fallbackToOriginalImages: () => set((state) => ({
        productImages: state.originalImages.length > 0 ? state.originalImages : state.productImages,
        activeImageIndex: 0,
        blueprintStatus: 'error',
      })),

      reset: () => set(initialState),
    }),
    {
      limit: 50,
      partialize: (state) => {
        const { selectedLogoId: _, blueprintStatus: _bs, blueprintError: _be, originalImages: _oi, ...rest } = state;
        return rest;
      },
    }
  )
);
