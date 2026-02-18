import React from 'react';
import { useConfigStore } from '@/stores/useConfigStore';

const BLUEPRINT_VIEW_LABELS = ['Front', 'Links', 'Rechts', 'Rückseite'];

export const ImageThumbnailBar: React.FC = () => {
  const productImages = useConfigStore((s) => s.productImages);
  const activeImageIndex = useConfigStore((s) => s.activeImageIndex);
  const setActiveImageIndex = useConfigStore((s) => s.setActiveImageIndex);
  const blueprintStatus = useConfigStore((s) => s.blueprintStatus);

  if (blueprintStatus === 'loading') {
    return (
      <div className="h-28 bg-white border-t border-slate-200 p-2 flex gap-3 overflow-x-auto items-center justify-center shrink-0 z-20">
        {BLUEPRINT_VIEW_LABELS.map((label, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            <div className="h-16 w-16 border-2 border-slate-100 rounded-lg bg-slate-100 animate-pulse" />
            <span className="text-[10px] text-slate-400 font-medium">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (productImages.length <= 1) return null;

  const isBlueprint = blueprintStatus === 'done';

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
              alt={isBlueprint && idx < BLUEPRINT_VIEW_LABELS.length
                ? BLUEPRINT_VIEW_LABELS[idx]
                : `Ansicht ${idx + 1}`}
            />
          </div>
          {isBlueprint && idx < BLUEPRINT_VIEW_LABELS.length && (
            <span className="text-[10px] text-slate-500 font-medium">
              {BLUEPRINT_VIEW_LABELS[idx]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
