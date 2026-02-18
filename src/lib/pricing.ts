import { RefinementType } from '@/types';
import type { LogoObject } from '@/types';
import { MIN_STICK_QTY } from './constants';

export interface PricingResult {
  totalQty: number;
  refinementCostPerItem: number;
  singleItemPrice: number;
  totalPrice: number;
  hasBasePrice: boolean;
  hasStick: boolean;
  isMoqValid: boolean;
}

export function calculatePricing(
  logos: LogoObject[],
  quantities: Record<string, number>,
  isUnsureAboutSizes: boolean,
  totalEstimatedQuantity: number,
  basePrice: number | null,
): PricingResult {
  const totalQty = isUnsureAboutSizes
    ? totalEstimatedQuantity
    : (Object.values(quantities) as number[]).reduce((a, b) => a + b, 0);

  const refinementCostPerItem = logos.reduce((sum, logo) => {
    return sum + (logo.refinement === RefinementType.STICK ? 5.00 : 3.00);
  }, 0);

  const base = basePrice || 0;
  const singleItemPrice = base + refinementCostPerItem;
  const totalPrice = singleItemPrice * totalQty;

  const hasStick = logos.some(l => l.refinement === RefinementType.STICK);
  const isMoqValid = !hasStick || totalQty >= MIN_STICK_QTY;

  return {
    totalQty,
    refinementCostPerItem,
    singleItemPrice,
    totalPrice,
    hasBasePrice: basePrice !== null,
    hasStick,
    isMoqValid,
  };
}
