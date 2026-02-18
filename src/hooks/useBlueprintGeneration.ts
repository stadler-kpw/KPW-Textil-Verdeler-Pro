import { useCallback } from 'react';
import { useConfigStore } from '@/stores/useConfigStore';
import { generateBlueprintViews } from '@/services/geminiService';

export function useBlueprintGeneration() {
  const setBlueprintStatus = useConfigStore((s) => s.setBlueprintStatus);
  const setBlueprintError = useConfigStore((s) => s.setBlueprintError);
  const setOriginalImages = useConfigStore((s) => s.setOriginalImages);
  const replaceBlueprintImages = useConfigStore((s) => s.replaceBlueprintImages);
  const fallbackToOriginalImages = useConfigStore((s) => s.fallbackToOriginalImages);

  const triggerBlueprintGeneration = useCallback(async (images: string[]) => {
    if (images.length === 0) return;

    setOriginalImages(images);
    setBlueprintStatus('loading');
    setBlueprintError(null);

    try {
      const blueprints = await generateBlueprintViews(images[0]);
      replaceBlueprintImages(blueprints);
    } catch (error) {
      console.error('Blueprint generation failed:', error);
      setBlueprintError(
        error instanceof Error
          ? error.message
          : 'Blueprint-Generierung fehlgeschlagen'
      );
      fallbackToOriginalImages();
    }
  }, [
    setBlueprintStatus,
    setBlueprintError,
    setOriginalImages,
    replaceBlueprintImages,
    fallbackToOriginalImages,
  ]);

  return { triggerBlueprintGeneration };
}
