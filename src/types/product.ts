export enum RefinementType {
  STICK = 'Stick',
  DRUCK = 'Druck',
}

export const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

export interface LogoObject {
  id: string;
  url: string;
  viewIndex: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  refinement: RefinementType;
  aiSuggestion: string | null;
}
