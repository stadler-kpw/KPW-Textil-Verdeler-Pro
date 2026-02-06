export enum RefinementType {
  STICK = 'Stick',
  DRUCK = 'Druck',
}

export const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

export interface LogoObject {
  id: string;
  url: string;
  viewIndex: number; // Which product image this logo belongs to
  x: number;
  y: number;
  scale: number;
  rotation: number;
  refinement: RefinementType;
  aiSuggestion: string | null;
}

export interface AppState {
  step: 'upload' | 'config' | 'checkout';
  productImages: string[];
  activeImageIndex: number;
  logos: LogoObject[];
  selectedLogoId: string | null;
  quantities: Record<string, number>;
  availableSizes: string[];
  isUnsureAboutSizes: boolean;
  totalEstimatedQuantity: number;
  basePrice: number | null;
}

export interface ContactFormData {
  company: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}