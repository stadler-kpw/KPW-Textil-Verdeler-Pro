import { redirect } from 'react-router-dom';
import { useConfigStore } from '@/stores/useConfigStore';
import { calculatePricing } from '@/lib/pricing';

export function configGuard() {
  const { productImages } = useConfigStore.getState();
  if (productImages.length === 0) {
    return redirect('/upload');
  }
  return null;
}

export function checkoutGuard() {
  const { productImages, logos, quantities, isUnsureAboutSizes, totalEstimatedQuantity, basePrice } = useConfigStore.getState();
  if (productImages.length === 0) {
    return redirect('/upload');
  }
  const { canProceed } = calculatePricing(logos, quantities, isUnsureAboutSizes, totalEstimatedQuantity, basePrice);
  if (!canProceed) {
    return redirect('/config');
  }
  return null;
}
