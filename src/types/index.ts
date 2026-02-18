export { RefinementType, DEFAULT_SIZES } from './product';
export type { LogoObject } from './product';
export type { ContactFormData } from './app';

// Legacy AppState - will be removed after Zustand migration
export interface AppState {
  step: 'upload' | 'config' | 'checkout';
  productImages: string[];
  activeImageIndex: number;
  logos: import('./product').LogoObject[];
  selectedLogoId: string | null;
  quantities: Record<string, number>;
  availableSizes: string[];
  isUnsureAboutSizes: boolean;
  totalEstimatedQuantity: number;
  basePrice: number | null;
}
