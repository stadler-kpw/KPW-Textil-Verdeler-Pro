import React, { useRef, useState } from 'react';
import { Shirt, Link as LinkIcon, ArrowRight, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { parseDataFromUrl } from '@/lib/url-parser';
import { useConfigStore } from '@/stores/useConfigStore';
import { useUiStore } from '@/stores/useUiStore';
import { useBlueprintGeneration } from '@/hooks/useBlueprintGeneration';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [shopifyUrl, setShopifyUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setProductImages = useConfigStore((s) => s.setProductImages);
  const errorMsg = useUiStore((s) => s.errorMsg);
  const setErrorMsg = useUiStore((s) => s.setErrorMsg);
  const { triggerBlueprintGeneration } = useBlueprintGeneration();

  const handleUrlImport = () => {
    if (!shopifyUrl) return;
    const { images, sizes, productRef, price } = parseDataFromUrl(shopifyUrl);
    if (images.length > 0) {
      setProductImages(images, sizes, price, productRef || shopifyUrl);
      setErrorMsg(null);
      navigate('/config');
      triggerBlueprintGeneration(images);
    } else {
      if (shopifyUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || shopifyUrl.includes('cdn/shop')) {
        const singleImage = [shopifyUrl];
        setProductImages(singleImage, null, null, shopifyUrl);
        setErrorMsg(null);
        navigate('/config');
        triggerBlueprintGeneration(singleImage);
      } else {
        setErrorMsg("Die URL enthält keine 'images' Parameter und ist kein direktes Bild.");
      }
    }
  };

  const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProductImages([url], null, null, null);
      navigate('/config');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 print:hidden">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-primary-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
            <Shirt className="text-slate-900 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Veredelungs-Konfigurator</h1>
          <p className="text-slate-500 mt-2">Wähle dein Textil für den Start</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">URL mit Parametern</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                <input
                  type="url"
                  value={shopifyUrl}
                  onChange={(e) => setShopifyUrl(e.target.value)}
                  placeholder="https://...?images=...&price=..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none text-sm text-slate-600"
                />
              </div>
              <button
                onClick={handleUrlImport}
                disabled={!shopifyUrl}
                className="bg-primary-400 hover:bg-primary-500 text-slate-900 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                title="Parameter laden"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {errorMsg && <p className="text-red-500 text-xs mt-2">{errorMsg}</p>}
            <p className="text-xs text-slate-400 mt-2">
              Füge hier den Link mit <code>?images=...</code> ein oder lade manuell hoch.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">oder</span></div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer group"
          >
            <div className="bg-slate-100 p-3 rounded-full mb-3 group-hover:bg-white transition-colors">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-primary-500" />
            </div>
            <span className="font-medium">Eigenes Foto hochladen</span>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProductUpload} />
        </div>
      </div>
    </div>
  );
};
