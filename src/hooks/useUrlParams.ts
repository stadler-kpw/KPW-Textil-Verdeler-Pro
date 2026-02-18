import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseDataFromUrl } from '@/lib/url-parser';
import { useConfigStore } from '@/stores/useConfigStore';
import { generateBlueprintViews } from '@/services/geminiService';

export function useUrlParams() {
  const navigate = useNavigate();
  const setProductImages = useConfigStore((s) => s.setProductImages);

  useEffect(() => {
    const { images, sizes, productRef, price } = parseDataFromUrl(window.location.search);
    if (images.length > 0) {
      setProductImages(images, sizes, price, productRef);
      navigate('/config', { replace: true });

      // Trigger blueprint generation via store actions directly (no hooks in useEffect callbacks)
      const store = useConfigStore.getState();
      store.setOriginalImages(images);
      store.setBlueprintStatus('loading');
      store.setBlueprintError(null);

      generateBlueprintViews(images[0])
        .then((blueprints) => {
          useConfigStore.getState().replaceBlueprintImages(blueprints);
        })
        .catch((error) => {
          console.error('Blueprint generation failed:', error);
          const s = useConfigStore.getState();
          s.setBlueprintError(
            error instanceof Error
              ? error.message
              : 'Blueprint-Generierung fehlgeschlagen'
          );
          s.fallbackToOriginalImages();
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
