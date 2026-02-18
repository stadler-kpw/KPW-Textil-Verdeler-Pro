import React from 'react';
import { Euro } from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import { usePricing } from '@/hooks/usePricing';

export const OrderSummary: React.FC = () => {
  const logos = useConfigStore((s) => s.logos);
  const isUnsureAboutSizes = useConfigStore((s) => s.isUnsureAboutSizes);
  const productRef = useConfigStore((s) => s.productRef);
  const { totalQty, totalPrice, hasBasePrice } = usePricing();

  const refinementSummary = Array.from(new Set(logos.map(l => l.refinement))).join(', ');

  return (
    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
      <h2 className="text-2xl font-bold text-slate-800">B2B Anfrage senden</h2>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-600">
        <p>Menge: <span className="font-bold text-slate-900">{totalQty} Stk.</span>
          {isUnsureAboutSizes && <span className="text-amber-600 text-xs ml-1">(Größen unklar)</span>}
        </p>
        <p>Motive: <span className="font-bold text-slate-900">{logos.length}</span></p>
        <p>Arten: <span className="font-bold text-slate-900">{refinementSummary || '-'}</span></p>
      </div>
      {hasBasePrice && totalQty > 0 && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
          <Euro size={18} className="text-emerald-600" />
          <span className="text-emerald-900 font-medium">Geschätzter Gesamtpreis: <span className="font-bold text-emerald-700">{totalPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></span>
        </div>
      )}
      {productRef && (
        <p className="text-slate-400 text-xs mt-2 truncate">
          Referenz: {productRef}
        </p>
      )}
    </div>
  );
};
