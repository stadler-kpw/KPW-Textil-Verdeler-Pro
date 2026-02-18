import React from 'react';
import { useConfigStore } from '@/stores/useConfigStore';
import { LogoUploadButton } from './LogoUploadButton';
import { LogoEditor } from './LogoEditor';
import { SizeQuantitySection } from './SizeQuantitySection';
import { PricingSummary } from './PricingSummary';

export const ConfigSidebar: React.FC = () => {
  const productImages = useConfigStore((s) => s.productImages);
  const activeImageIndex = useConfigStore((s) => s.activeImageIndex);

  return (
    <div className="w-full md:w-[400px] bg-white border-l border-slate-200 flex flex-col h-[50vh] md:h-auto overflow-y-auto relative z-40 shadow-xl">
      <div className="p-6 space-y-6 pb-24">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Konfiguration</h2>
            <p className="text-slate-500 text-sm">Ansicht {activeImageIndex + 1} von {productImages.length}</p>
          </div>
        </div>

        <LogoUploadButton />
        <LogoEditor />

        <hr className="border-slate-100" />

        <SizeQuantitySection />
      </div>

      <PricingSummary />
    </div>
  );
};
