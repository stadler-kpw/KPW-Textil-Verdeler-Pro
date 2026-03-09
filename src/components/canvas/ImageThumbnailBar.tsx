import React from 'react';
import { useConfigStore } from '@/stores/useConfigStore';

const BLUEPRINT_VIEW_LABELS = ['Vorderseite', 'Links', 'Rechts', 'Rückseite'];

export const ImageThumbnailBar: React.FC = () => {
  const productImages = useConfigStore((s) => s.productImages);
  const activeImageIndex = useConfigStore((s) => s.activeImageIndex);
  const setActiveImageIndex = useConfigStore((s) => s.setActiveImageIndex);

  if (productImages.length <= 1) return null;

  return (
    <div className="h-28 bg-white border-t border-slate-200 p-2 flex gap-3 overflow-x-auto items-center justify-center shrink-0 z-20">
      {productImages.map((img, idx) => (
        <button
          key={idx}
          onClick={() => setActiveImageIndex(idx)}
          className="flex flex-col items-center gap-1"
        >
          <div
            className={`h-16 w-16 border-2 rounded-lg overflow-hidden transition-all flex-shrink-0 ${
              activeImageIndex === idx
                ? 'border-primary-400 ring-2 ring-primary-100'
                : 'border-slate-100 hover:border-slate-300'
            }`}
          >
            <img
              src={img}
              className="w-full h-full object-cover"
              alt={idx < BLUEPRINT_VIEW_LABELS.length
                ? BLUEPRINT_VIEW_LABELS[idx]
                : `Ansicht ${idx + 1}`}
            />
          </div>
          {idx < BLUEPRINT_VIEW_LABELS.length && (
            <span className="text-[10px] text-slate-500 font-medium">
              {BLUEPRINT_VIEW_LABELS[idx]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
