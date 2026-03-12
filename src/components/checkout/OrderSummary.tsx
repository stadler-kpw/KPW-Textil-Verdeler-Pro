import React from 'react';
import { Eye, Layers, Package, Euro } from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import { useUiStore } from '@/stores/useUiStore';
import { useImageDimensions } from '@/hooks/useImageDimensions';
import { usePricing } from '@/hooks/usePricing';
import { RefinementType } from '@/types';

const VIEW_LABELS = ['Vorderseite', 'Links', 'Rechts', 'Rückseite'];

const fmtEur = (v: number) => v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

export const OrderSummary: React.FC = () => {
  const logos = useConfigStore((s) => s.logos);
  const productImages = useConfigStore((s) => s.productImages);
  const quantities = useConfigStore((s) => s.quantities);
  const isUnsureAboutSizes = useConfigStore((s) => s.isUnsureAboutSizes);
  const productRef = useConfigStore((s) => s.productRef);
  const basePrice = useConfigStore((s) => s.basePrice);
  const canvasRenderedDimensions = useUiStore((s) => s.canvasRenderedDimensions);
  const imageDimensions = useImageDimensions();
  const { totalQty, totalPrice, hasBasePrice, refinementCostPerItem, singleItemPrice } = usePricing();

  const viewsWithLogos = Array.from(new Set(logos.map(l => l.viewIndex))).sort();
  const sizeEntries = Object.entries(quantities).filter(([, q]) => q > 0);

  return (
    <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">B2B Anfrage</h2>
        <p className="text-sm text-slate-500 mt-0.5">Ihre Konfiguration im Überblick</p>
      </div>

      {/* Vorschaubilder */}
      {viewsWithLogos.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Eye size={14} /> Vorschau
          </div>
          <div className={`grid gap-3 ${viewsWithLogos.length === 1 ? 'grid-cols-1 max-w-xs' : 'grid-cols-2'}`}>
            {viewsWithLogos.map(viewIdx => {
              const viewLogos = logos.filter(l => l.viewIndex === viewIdx);
              const viewImage = productImages[viewIdx];
              const dims = imageDimensions[viewIdx] || { width: 1000, height: 1000 };
              const canvasDims = canvasRenderedDimensions[viewIdx] || dims;
              const aspectRatio = dims.width / dims.height;

              return (
                <div key={viewIdx} className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {viewIdx < VIEW_LABELS.length ? VIEW_LABELS[viewIdx] : `Ansicht ${viewIdx + 1}`}
                  </span>
                  <div
                    className="relative bg-slate-100 border border-slate-200 rounded-lg overflow-hidden"
                    style={{ aspectRatio: `${aspectRatio}` }}
                  >
                    <img src={viewImage} className="w-full h-full object-contain" alt="Produkt" />
                    <div className="absolute inset-0">
                      {viewLogos.map(logo => (
                        <div
                          key={logo.id}
                          className="absolute z-10"
                          style={{
                            left: `${logo.x}%`,
                            top: `${logo.y}%`,
                            transform: `rotate(${logo.rotation}deg)`,
                            width: `${(150 * logo.scale / canvasDims.width) * 100}%`,
                            aspectRatio: '1/1',
                          }}
                        >
                          <img src={logo.url} className="w-full h-full object-contain" alt="Logo" />
                          <span className={`absolute -top-3 left-0 text-[9px] font-bold px-1.5 py-0.5 rounded border shadow-sm whitespace-nowrap ${
                            logo.refinement === RefinementType.STICK
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-blue-50 text-blue-700 border-blue-300'
                          }`}>
                            {logo.refinement}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Positionen */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          <Layers size={14} /> Positionen
        </div>
        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
          {logos.map((logo, idx) => {
            const viewName = logo.viewIndex < VIEW_LABELS.length
              ? VIEW_LABELS[logo.viewIndex]
              : `Ansicht ${logo.viewIndex + 1}`;
            const pricePerItem = logo.refinement === RefinementType.STICK ? 5.00 : 3.00;
            const isStick = logo.refinement === RefinementType.STICK;

            return (
              <div key={logo.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xs font-bold text-slate-300 w-5 shrink-0">#{idx + 1}</span>
                <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                  <img src={logo.url} className="w-full h-full object-contain" alt={`Logo ${idx + 1}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-slate-700">{viewName}</span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isStick
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {logo.refinement}
                </span>
                <span className="text-sm font-semibold text-slate-500 tabular-nums w-20 text-right shrink-0">
                  {fmtEur(pricePerItem)}/Stk.
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mengen */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          <Package size={14} /> Mengen
        </div>
        <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
          {isUnsureAboutSizes ? (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Geschätzte Gesamtmenge</span>
              <span className="font-bold text-slate-900">{totalQty.toLocaleString('de-DE')} Stk.</span>
            </div>
          ) : (
            <>
              {sizeEntries.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                  {sizeEntries.map(([size, qty]) => (
                    <span key={size}>
                      <span className="text-slate-400">{size}:</span>{' '}
                      <span className="font-semibold text-slate-800">{qty}</span>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                <span className="text-sm text-slate-600">Gesamt</span>
                <span className="font-bold text-slate-900">{totalQty.toLocaleString('de-DE')} Stk.</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Preisaufstellung */}
      <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 space-y-2">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Veredelungskosten / Stk. ({logos.length} {logos.length === 1 ? 'Motiv' : 'Motive'})</span>
          <span className="font-semibold text-slate-800 tabular-nums">{fmtEur(refinementCostPerItem)}</span>
        </div>
        {hasBasePrice && (
          <div className="flex justify-between text-sm text-slate-600">
            <span>Artikelpreis inkl. Veredelung / Stk.</span>
            <span className="font-semibold text-slate-800 tabular-nums">{fmtEur(singleItemPrice)}</span>
          </div>
        )}
        {hasBasePrice && totalQty > 0 ? (
          <div className="flex justify-between items-end pt-2 border-t border-slate-200">
            <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <Euro size={16} className="text-emerald-600" /> Geschätzter Gesamtpreis
            </span>
            <span className="text-lg font-bold text-emerald-600 tabular-nums">{fmtEur(totalPrice)}</span>
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-200 text-sm text-slate-500 italic text-right">
            Preis auf Anfrage
          </div>
        )}
      </div>

      {/* Referenz */}
      {productRef && (
        <p className="text-slate-400 text-[11px] truncate">
          Ref: {productRef}
        </p>
      )}
    </div>
  );
};
