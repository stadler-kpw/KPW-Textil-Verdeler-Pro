import React from 'react';
import type { LogoObject } from '@/types';

interface PrintableQuoteProps {
  productImages: string[];
  logos: LogoObject[];
  activeImageIndex: number;
  quantities: Record<string, number>;
  isUnsureAboutSizes: boolean;
  totalPrice: number;
  totalQty: number;
  hasBasePrice: boolean;
  imageDimensions: Record<number, { width: number; height: number }>;
  canvasRenderedDimensions: Record<number, { width: number; height: number }>;
}

export const PrintableQuote: React.FC<PrintableQuoteProps> = ({
  productImages,
  logos,
  activeImageIndex,
  quantities,
  isUnsureAboutSizes,
  totalPrice,
  totalQty,
  hasBasePrice,
  imageDimensions,
  canvasRenderedDimensions,
}) => {
  const dateStr = new Date().toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const viewsWithLogosIndices = Array.from(new Set(logos.map(l => l.viewIndex))).sort();
  const viewsToShow = viewsWithLogosIndices.length > 0 ? viewsWithLogosIndices : [activeImageIndex];

  return (
    <div id="printable-content" className="bg-white w-[210mm] min-h-[297mm] p-[15mm] text-slate-900 relative">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-slate-900">Konfiguration</h1>
          <p className="text-slate-500 font-medium mt-1">Veredelungs-Zusammenfassung</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-400 uppercase">Datum</p>
          <p className="text-lg font-bold">{dateStr}</p>
        </div>
      </div>

      {/* Product & Visuals Grid */}
      <div className="mb-8">
        <h3 className="text-sm font-bold uppercase text-slate-500 mb-4 border-b border-slate-200 pb-2">Visuelle Vorschau</h3>
        <div className="grid grid-cols-2 gap-8">
          {viewsToShow.map(viewIdx => {
            const viewLogos = logos.filter(l => l.viewIndex === viewIdx);
            const viewImage = productImages[viewIdx];
            const dims = imageDimensions[viewIdx] || { width: 1000, height: 1000 };
            const canvasDims = canvasRenderedDimensions[viewIdx] || dims;
            const aspectRatio = dims.width / dims.height;

            return (
              <div key={viewIdx} className="flex flex-col gap-2 page-break-inside-avoid">
                <span className="text-xs font-bold text-slate-400 uppercase">Ansicht {viewIdx + 1}</span>
                <div
                  className="relative w-full bg-slate-50 border border-slate-200 rounded overflow-hidden"
                  style={{ aspectRatio: `${aspectRatio}` }}
                >
                  <img src={viewImage} className="w-full h-full block object-contain" alt="Preview" />
                  <div className="absolute inset-0 top-0 left-0 w-full h-full">
                    {viewLogos.map(logo => (
                      <div
                        key={logo.id + 'print'}
                        style={{
                          left: `${logo.x}%`,
                          top: `${logo.y}%`,
                          transform: `rotate(${logo.rotation}deg)`,
                          width: `${(150 * logo.scale / canvasDims.width) * 100}%`,
                          aspectRatio: '1/1',
                          position: 'absolute',
                          zIndex: 10,
                        }}
                      >
                        <img src={logo.url} className="w-full h-full object-contain" alt="logo" />
                        <div className="absolute -top-4 left-0 bg-white border border-slate-900 text-slate-900 text-[10px] leading-none font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-50">
                          {logo.refinement}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Table */}
      <div className="mb-8 page-break-inside-avoid">
        <h3 className="text-sm font-bold uppercase text-slate-500 mb-4 border-b border-slate-200 pb-2">Details & Mengen</h3>
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Größenaufteilung</p>
              {isUnsureAboutSizes ? (
                <p className="font-mono text-slate-700">Größen noch unklar / gemischt</p>
              ) : (
                <ul className="space-y-1 font-mono text-sm">
                  {Object.entries(quantities).filter(([, q]) => q > 0).map(([size, qty]) => (
                    <li key={size} className="flex justify-between border-b border-slate-200 last:border-0 py-1">
                      <span>{size}</span>
                      <span className="font-bold">{qty}</span>
                    </li>
                  ))}
                  {Object.values(quantities).every(q => q === 0) && <li>Keine Mengen gewählt</li>}
                </ul>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Veredelungen</p>
              <ul className="space-y-1 font-mono text-sm">
                {logos.map((logo, idx) => (
                  <li key={logo.id} className="flex justify-between border-b border-slate-200 last:border-0 py-1">
                    <span>Logo {idx + 1} (Ansicht {logo.viewIndex + 1})</span>
                    <span className="font-bold">{logo.refinement}</span>
                  </li>
                ))}
                {logos.length === 0 && <li>Keine Logos platziert</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Total Section */}
      <div className="mt-auto border-t-2 border-slate-900 pt-6 page-break-inside-avoid">
        <div className="flex justify-end">
          <div className="w-1/2 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Gesamtmenge Artikel</span>
              <span className="font-bold">{totalQty} Stk.</span>
            </div>
            {hasBasePrice && (
              <div className="flex justify-between items-end pt-2 border-t border-slate-200">
                <span className="text-slate-900 font-bold">Geschätzter Gesamtpreis</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {totalPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            )}
            {!hasBasePrice && (
              <div className="text-right text-sm text-slate-500 italic mt-2">
                Preis auf Anfrage
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 text-[10px] text-slate-400 text-center uppercase tracking-wider">
          Dieses Dokument wurde automatisch generiert. Alle Preise sind unverbindliche Schätzungen zzgl. MwSt.
        </div>
      </div>
    </div>
  );
};
