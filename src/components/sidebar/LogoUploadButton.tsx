import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import { MAX_LOGOS, MAX_LOGO_FILE_SIZE } from '@/lib/constants';

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

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
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        alert('Bitte nur Bilder im Format PNG, JPG, WebP oder SVG hochladen.');
        if (logoInputRef.current) logoInputRef.current.value = '';
        return;
      }
      if (file.size > MAX_LOGO_FILE_SIZE) {
        alert(`Die Datei ist zu groß. Maximale Dateigröße: ${MAX_LOGO_FILE_SIZE / (1024 * 1024)} MB.`);
        if (logoInputRef.current) logoInputRef.current.value = '';
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
        className={`w-full py-5 border-2 border-dashed rounded-xl transition-colors flex items-center justify-center gap-2 font-medium ${maxLogosReached ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed' : 'border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100'}`}
      >
        <Upload size={18} />
        {maxLogosReached ? 'Maximal 5 Logos erreicht' : 'Logo auf diese Ansicht hinzufügen'}
        <span className="text-xs ml-1 opacity-70">({logos.length}/{MAX_LOGOS})</span>
      </button>
      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
    </>
  );
};
