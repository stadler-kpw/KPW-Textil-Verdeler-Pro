import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import { useUiStore } from '@/stores/useUiStore';
import { useImageDimensions } from '@/hooks/useImageDimensions';
import { usePricing } from '@/hooks/usePricing';
import { PrintableQuote } from './PrintableQuote';

export const ShareModal: React.FC = () => {
  const showShareModal = useUiStore((s) => s.showShareModal);
  const setShowShareModal = useUiStore((s) => s.setShowShareModal);

  const productImages = useConfigStore((s) => s.productImages);
  const logos = useConfigStore((s) => s.logos);
  const activeImageIndex = useConfigStore((s) => s.activeImageIndex);
  const quantities = useConfigStore((s) => s.quantities);
  const isUnsureAboutSizes = useConfigStore((s) => s.isUnsureAboutSizes);

  const canvasRenderedDimensions = useUiStore((s) => s.canvasRenderedDimensions);

  const imageDimensions = useImageDimensions();
  const { totalQty, totalPrice, hasBasePrice } = usePricing();

  if (!showShareModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 print:bg-white print:p-0 print:static print:block">
      <div className="bg-slate-200 rounded-2xl shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden print:shadow-none print:h-auto print:w-auto print:bg-white print:overflow-visible">
        <div className="p-4 border-b border-slate-300 flex justify-between items-center bg-slate-100 shrink-0 print:hidden">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <FileText size={20} /> Dokumentenvorschau (PDF)
          </h3>
          <button onClick={() => setShowShareModal(false)} className="text-slate-500 hover:text-slate-800">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex justify-center print:p-0 print:overflow-visible">
          <div id="printable-area" className="transform origin-top scale-75 md:scale-100 transition-transform duration-200 shadow-xl print:transform-none print:shadow-none print:w-full print:h-full">
            <PrintableQuote
              productImages={productImages}
              logos={logos}
              activeImageIndex={activeImageIndex}
              quantities={quantities}
              isUnsureAboutSizes={isUnsureAboutSizes}
              totalPrice={totalPrice}
              totalQty={totalQty}
              hasBasePrice={hasBasePrice}
              imageDimensions={imageDimensions}
              canvasRenderedDimensions={canvasRenderedDimensions}
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-300 bg-white flex justify-between items-center print:hidden">
          <p className="text-sm text-slate-500 hidden md:block">
            Nutze "Als PDF speichern" im Druckdialog.
          </p>
          <div className="flex gap-3 ml-auto">
            <button
              onClick={() => setShowShareModal(false)}
              className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50"
            >
              Schließen
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-primary-400 text-slate-900 rounded-lg font-bold hover:bg-primary-500 shadow-md flex items-center gap-2"
            >
              <Printer size={18} /> Drucken / PDF speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
