import { redirect } from 'react-router-dom';
import { useConfigStore } from '@/stores/useConfigStore';

export function configGuard() {
  const { productImages } = useConfigStore.getState();
  if (productImages.length === 0) {
    return redirect('/upload');
  }
  return null;
}

export function checkoutGuard() {
  const { productImages } = useConfigStore.getState();
  if (productImages.length === 0) {
    return redirect('/upload');
  }
  return null;
}
