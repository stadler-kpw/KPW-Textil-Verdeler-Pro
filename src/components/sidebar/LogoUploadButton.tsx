import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import { MAX_LOGOS } from '@/lib/constants';

export const LogoUploadButton: React.FC = () => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logos = useConfigStore((s) => s.logos);
  const activeImageIndex = useConfigStore((s) => s.activeImageIndex);
  const addLogo = useConfigStore((s) => s.addLogo);

  const maxLogosReached = logos.length >= MAX_LOGOS;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (logos.length >= MAX_LOGOS) {
        alert(`Maximal ${MAX_LOGOS} Logos erlaubt.`);
        return;
      }
      addLogo(file, activeImageIndex);
    }
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  return (
    <>
      <button
        onClick={() => !maxLogosReached && logoInputRef.current?.click()}
        disabled={maxLogosReached}
        className={`w-full py-3 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${maxLogosReached ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed' : 'border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100'}`}
      >
        <Upload size={18} />
        {maxLogosReached ? 'Maximal 5 Logos erreicht' : 'Logo auf diese Ansicht hinzufügen'}
        <span className="text-xs ml-1 opacity-70">({logos.length}/{MAX_LOGOS})</span>
      </button>
      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
    </>
  );
};
