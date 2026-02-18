import { useState, useEffect } from 'react';
import { useConfigStore } from '@/stores/useConfigStore';

export function useImageDimensions() {
  const productImages = useConfigStore((s) => s.productImages);
  const [imageDimensions, setImageDimensions] = useState<Record<number, { width: number; height: number }>>({});

  useEffect(() => {
    productImages.forEach((src, idx) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageDimensions((prev) => ({
          ...prev,
          [idx]: { width: img.naturalWidth, height: img.naturalHeight },
        }));
      };
    });
  }, [productImages]);

  return imageDimensions;
}
