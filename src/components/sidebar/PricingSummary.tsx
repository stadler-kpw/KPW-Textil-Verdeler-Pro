import React from 'react';
import { ArrowRight, Share2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConfigStore } from '@/stores/useConfigStore';
import { useUiStore } from '@/stores/useUiStore';
import { usePricing } from '@/hooks/usePricing';
import { MIN_STICK_QTY } from '@/lib/constants';

export const PricingSummary: React.FC = () => {
  const navigate = useNavigate();
  const isUnsureAboutSizes = useConfigStore((s) => s.isUnsureAboutSizes);
  const setShowShareModal = useUiStore((s) => s.setShowShareModal);
  const { totalQty, totalPrice, hasBasePrice, isMoqValid } = usePricing();

  return (
    <div className="mt-auto border-t border-slate-100 p-6 bg-white sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center mb-4 text-sm text-slate-600">
        <span>Gesamtmenge:</span>
        <div className="text-right">
          <div className="font-bold text-slate-900">
            {totalQty} Stk.
            {isUnsureAboutSizes && <span className="text-xs font-normal text-slate-400 ml-1">(Geschätzt)</span>}
          </div>
          {hasBasePrice && totalQty > 0 && (
            <div className="text-emerald-600 font-bold text-lg">
              {totalPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              <span className="text-[10px] text-slate-400 font-normal ml-1 block leading-none">geschätzt</span>
            </div>
          )}
        </div>
      </div>

      {!isMoqValid && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 items-start animate-in fade-in">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-800">
            <strong>Mindestmenge nicht erreicht</strong>
            <p>Für "Stick" ist eine Abnahme von mindestens {MIN_STICK_QTY} Stück erforderlich.</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setShowShareModal(true)}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 p-3.5 rounded-xl transition-colors flex items-center justify-center shadow-sm"
          title="Konfiguration teilen / Übersicht"
        >
          <Share2 size={20} />
        </button>
        <button
          onClick={() => navigate('/checkout')}
          disabled={!isMoqValid}
          className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isMoqValid ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          Weiter zur Anfrage <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
