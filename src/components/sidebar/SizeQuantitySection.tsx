import React from 'react';
import { useConfigStore } from '@/stores/useConfigStore';

export const SizeQuantitySection: React.FC = () => {
  const availableSizes = useConfigStore((s) => s.availableSizes);
  const quantities = useConfigStore((s) => s.quantities);
  const isUnsureAboutSizes = useConfigStore((s) => s.isUnsureAboutSizes);
  const totalEstimatedQuantity = useConfigStore((s) => s.totalEstimatedQuantity);
  const setQuantity = useConfigStore((s) => s.setQuantity);
  const setIsUnsureAboutSizes = useConfigStore((s) => s.setIsUnsureAboutSizes);
  const setTotalEstimatedQuantity = useConfigStore((s) => s.setTotalEstimatedQuantity);

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Größen & Mengen</h3>

      <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id="unsure-sizes"
            checked={isUnsureAboutSizes}
            onChange={(e) => setIsUnsureAboutSizes(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-400 cursor-pointer"
          />
        </div>
        <label htmlFor="unsure-sizes" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
          Ich bin mir unsicher bzgl. den Größen
        </label>
      </div>

      {isUnsureAboutSizes ? (
        <div className="space-y-1 animation-fade-in">
          <label className="text-xs font-medium text-slate-500">Erwartete Gesamtstückzahl</label>
          <input
            type="number"
            min="1"
            value={totalEstimatedQuantity || ''}
            onChange={(e) => setTotalEstimatedQuantity(parseInt(e.target.value, 10) || 0)}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none text-slate-800 font-medium"
            placeholder="z.B. 50"
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {availableSizes.map(size => (
            <div key={size} className="relative">
              <label className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-slate-400 font-medium">{size}</label>
              <input
                type="number"
                min="0"
                value={quantities[size] || ''}
                onChange={(e) => setQuantity(size, parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full text-center py-2 border border-slate-200 rounded-md focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none text-sm font-medium text-slate-700 placeholder-slate-300"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
