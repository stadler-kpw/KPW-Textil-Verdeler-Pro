import { useConfigStore } from '@/stores/useConfigStore';
import { calculatePricing, type PricingResult } from '@/lib/pricing';

export function usePricing(): PricingResult {
  const logos = useConfigStore((s) => s.logos);
  const quantities = useConfigStore((s) => s.quantities);
  const isUnsureAboutSizes = useConfigStore((s) => s.isUnsureAboutSizes);
  const totalEstimatedQuantity = useConfigStore((s) => s.totalEstimatedQuantity);
  const basePrice = useConfigStore((s) => s.basePrice);

  return calculatePricing(logos, quantities, isUnsureAboutSizes, totalEstimatedQuantity, basePrice);
}
