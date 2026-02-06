import React, { useState, useRef, useEffect } from 'react';
import { Upload, Link as LinkIcon, ShoppingBag, ArrowRight, Image as ImageIcon, Loader2, Trash2, Undo2, Redo2, ZoomIn, ZoomOut, Maximize, Share2, Copy, X, Check, ImageDown, Euro, AlertTriangle, AlertCircle, Printer, FileText } from 'lucide-react';
import { extractShopifyImage } from './services/imageUtils'; // Still imported, though we use local parsing mainly now
import { LogoDraggable } from './components/LogoDraggable';
import { DEFAULT_SIZES, RefinementType, AppState, ContactFormData, LogoObject } from './types';

// --- Sub-Component: Printable Quote (A4 Layout) ---
const PrintableQuote = ({ state, totalPrice, totalQty, hasBasePrice, imageDimensions }: { 
    state: AppState, 
    totalPrice: number, 
    totalQty: number, 
    hasBasePrice: boolean,
    imageDimensions: Record<number, {width: number, height: number}>
}) => {
    const dateStr = new Date().toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const viewsWithLogosIndices = Array.from(new Set(state.logos.map(l => l.viewIndex))).sort();
    const viewsToShow = viewsWithLogosIndices.length > 0 ? viewsWithLogosIndices : [state.activeImageIndex];

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
                        const viewLogos = state.logos.filter(l => l.viewIndex === viewIdx);
                        const viewImage = state.productImages[viewIdx];
                        const dims = imageDimensions[viewIdx] || { width: 1000, height: 1000 };
                        // Calculate aspect ratio for the container
                        const aspectRatio = dims.width / dims.height;

                        return (
                            <div key={viewIdx} className="flex flex-col gap-2 page-break-inside-avoid">
                                <span className="text-xs font-bold text-slate-400 uppercase">Ansicht {viewIdx + 1}</span>
                                {/* Container that matches the aspect ratio of the image exactly */}
                                <div 
                                    className="relative w-full bg-slate-50 border border-slate-200 rounded overflow-hidden"
                                    style={{ aspectRatio: `${aspectRatio}` }}
                                >
                                    <img 
                                        src={viewImage} 
                                        className="w-full h-full block object-contain" 
                                        alt="Preview" 
                                    />
                                    {/* Overlay Layer for Logos */}
                                    <div className="absolute inset-0 top-0 left-0 w-full h-full">
                                        {viewLogos.map(logo => (
                                            <div key={logo.id + 'print'} 
                                                style={{
                                                    // Position using Percentages
                                                    left: `${logo.x}%`,
                                                    top: `${logo.y}%`,
                                                    transform: `rotate(${logo.rotation}deg)`,
                                                    // Scaling for Print:
                                                    // Since we don't know exact pixels on paper, but we know the 'container' is 100% width of the column.
                                                    // The logo.scale is based on a 150px base relative to the SCREEN viewer.
                                                    // To make it look consistent, we calculated width as percentage of the image width.
                                                    width: `${(150 * logo.scale / dims.width) * 100}%`,
                                                    aspectRatio: '1/1', // Square logos
                                                    position: 'absolute',
                                                    zIndex: 10
                                                }}>
                                                <img src={logo.url} className="w-full h-full object-contain" alt="logo" />
                                                <div className="absolute -top-4 left-0 bg-white border border-slate-900 text-slate-900 text-[10px] leading-none font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-50">
                                                    {logo.refinement}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
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
                            {state.isUnsureAboutSizes ? (
                                <p className="font-mono text-slate-700">Größen noch unklar / gemischt</p>
                            ) : (
                                <ul className="space-y-1 font-mono text-sm">
                                    {Object.entries(state.quantities).filter(([_, q]) => q > 0).map(([size, qty]) => (
                                        <li key={size} className="flex justify-between border-b border-slate-200 last:border-0 py-1">
                                            <span>{size}</span>
                                            <span className="font-bold">{qty}</span>
                                        </li>
                                    ))}
                                    {Object.values(state.quantities).every(q => q === 0) && <li>Keine Mengen gewählt</li>}
                                </ul>
                            )}
                         </div>
                         <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Veredelungen</p>
                            <ul className="space-y-1 font-mono text-sm">
                                {state.logos.map((logo, idx) => (
                                    <li key={logo.id} className="flex justify-between border-b border-slate-200 last:border-0 py-1">
                                        <span>Logo {idx + 1} (Ansicht {logo.viewIndex + 1})</span>
                                        <span className="font-bold">{logo.refinement}</span>
                                    </li>
                                ))}
                                {state.logos.length === 0 && <li>Keine Logos platziert</li>}
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
                                <span className="text-2xl font-bold text-slate-900">
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


function App() {
  // --- Constants ---
  const MAX_LOGOS = 5;
  const MIN_STICK_QTY = 5;

  // --- State ---
  const [state, setState] = useState<AppState>({
    step: 'upload',
    productImages: [],
    activeImageIndex: 0,
    logos: [],
    selectedLogoId: null,
    quantities: DEFAULT_SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}),
    availableSizes: DEFAULT_SIZES,
    isUnsureAboutSizes: false,
    totalEstimatedQuantity: 0,
    basePrice: null,
  });

  // Keep track of natural dimensions for accurate export/print positioning
  const [imageDimensions, setImageDimensions] = useState<Record<number, {width: number, height: number}>>({});

  useEffect(() => {
    // Load images to get natural dimensions
    state.productImages.forEach((src, idx) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            setImageDimensions(prev => ({ ...prev, [idx]: { width: img.naturalWidth, height: img.naturalHeight } }));
        };
    });
  }, [state.productImages]);

  // History State
  const [history, setHistory] = useState<AppState[]>([]);
  const [future, setFuture] = useState<AppState[]>([]);

  // Canvas State
  const [canvasZoom, setCanvasZoom] = useState(1);
  const minZoom = 0.5;
  const maxZoom = 3.0;
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);

  const [shopifyUrl, setShopifyUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // --- Logic: Parse Parameters ---
  const parseDataFromUrl = (urlString: string) => {
      let params: URLSearchParams;
      
      if (urlString.startsWith('?')) {
          params = new URLSearchParams(urlString);
      } else if (urlString.includes('?')) {
          try {
             const u = new URL(urlString);
             params = u.searchParams;
          } catch (e) {
             const split = urlString.split('?');
             params = new URLSearchParams(split[1]);
          }
      } else {
          return { images: [], sizes: null, productRef: null, price: null };
      }

      let productRef = null;
      const productParam = params.get('product');
      if (productParam) {
          let clean = productParam.trim();
          if (clean.includes('%3A') || clean.includes('%2F')) {
                try { clean = decodeURIComponent(clean); } catch(e) {}
          }
          productRef = clean;
      }

      const sizesParam = params.get('sizes');
      let sizes = null;
      if (sizesParam) {
          const parsed = sizesParam.split(',').map(s => s.trim()).filter(Boolean);
          if (parsed.length > 0) sizes = parsed;
      }

      const imagesParam = params.get('images');
      let images: string[] = [];
      if (imagesParam) {
           images = imagesParam.split(',').map(img => {
                let clean = img.trim();
                if (clean.includes('%3A') || clean.includes('%2F')) {
                    try { clean = decodeURIComponent(clean); } catch(e) {}
                }
                if (clean.startsWith('//')) {
                    clean = 'https:' + clean;
                }
                return clean;
            }).filter(Boolean);
      }

      const priceParam = params.get('price');
      let price: number | null = null;
      if (priceParam) {
          try {
              price = parseFloat(priceParam.replace(',', '.'));
          } catch(e) {}
      }

      return { images, sizes, productRef, price };
  };

  const applyConfig = (images: string[], sizes: string[] | null, productRef: string | null, price: number | null) => {
        if (images.length > 0) {
            const newSizes = sizes || DEFAULT_SIZES;
            const newQuantities: Record<string, number> = {};
            newSizes.forEach(s => newQuantities[s] = 0);

            if (productRef) setShopifyUrl(productRef);

            setState(prev => ({
                ...prev,
                step: 'config',
                productImages: images,
                activeImageIndex: 0,
                availableSizes: newSizes,
                quantities: newQuantities,
                logos: [],
                selectedLogoId: null,
                isUnsureAboutSizes: false,
                totalEstimatedQuantity: 0,
                basePrice: price,
            }));
            setErrorMsg(null);
        } else {
            setErrorMsg("Keine Bild-Parameter ('images') in der URL gefunden.");
        }
  };

  useEffect(() => {
    const { images, sizes, productRef, price } = parseDataFromUrl(window.location.search);
    if (images.length > 0) {
        applyConfig(images, sizes, productRef, price);
    }
  }, []);

  // --- History Helpers ---

  const pushToHistory = () => {
    setHistory(prev => [...prev, state]);
    setFuture([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    
    setFuture(prev => [state, ...prev]);
    setHistory(newHistory);
    setState(previous);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    
    setHistory(prev => [...prev, state]);
    setFuture(newFuture);
    setState(next);
  };

  // --- Handlers: Upload Step ---

  const handleUrlImport = () => {
      if (!shopifyUrl) return;
      const { images, sizes, productRef, price } = parseDataFromUrl(shopifyUrl);
      if (images.length > 0) {
          applyConfig(images, sizes, productRef || shopifyUrl, price);
      } else {
          if (shopifyUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || shopifyUrl.includes('cdn/shop')) {
               applyConfig([shopifyUrl], null, shopifyUrl, null);
          } else {
               setErrorMsg("Die URL enthält keine 'images' Parameter und ist kein direktes Bild.");
          }
      }
  };

  const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setState(prev => ({ 
          ...prev, 
          productImages: [url], 
          activeImageIndex: 0,
          step: 'config',
          basePrice: null 
      }));
    }
  };

  // --- Handlers: Config Step ---

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (state.logos.length >= MAX_LOGOS) {
          alert(`Maximal ${MAX_LOGOS} Logos erlaubt.`);
          return;
      }
      pushToHistory(); 
      const url = URL.createObjectURL(file);
      const newLogo: LogoObject = {
        id: Date.now().toString(),
        url,
        viewIndex: state.activeImageIndex, 
        x: 40, // Start roughly center (40-60%)
        y: 30,
        scale: 1,
        rotation: 0,
        refinement: RefinementType.DRUCK, 
        aiSuggestion: null
      };

      setState(prev => ({
        ...prev,
        logos: [...prev.logos, newLogo],
        selectedLogoId: newLogo.id
      }));
    }
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleLogoUpdate = (id: string, updates: Partial<LogoObject>) => {
    pushToHistory();
    setState(prev => ({
        ...prev,
        logos: prev.logos.map(l => l.id === id ? { ...l, ...updates } : l)
    }));
  };

  const handleDeleteLogo = () => {
      if (!state.selectedLogoId) return;
      pushToHistory(); 
      setState(prev => ({
          ...prev,
          logos: prev.logos.filter(l => l.id !== prev.selectedLogoId),
          selectedLogoId: null
      }));
  };

  const handleRefinementChange = (val: RefinementType) => {
      if (!state.selectedLogoId) return;
      pushToHistory();
      handleLogoUpdate(state.selectedLogoId, { refinement: val });
  };

  const handleQuantityChange = (size: string, val: string) => {
    const num = parseInt(val, 10) || 0;
    setState(prev => ({
      ...prev,
      quantities: { ...prev.quantities, [size]: Math.max(0, num) }
    }));
  };

  const handleTotalQuantityChange = (val: string) => {
    const num = parseInt(val, 10) || 0;
    setState(prev => ({
        ...prev,
        totalEstimatedQuantity: Math.max(0, num)
    }));
  };

  const zoomIn = (e: React.MouseEvent) => { e.stopPropagation(); setCanvasZoom(z => Math.min(maxZoom, z + 0.25)); };
  const zoomOut = (e: React.MouseEvent) => { e.stopPropagation(); setCanvasZoom(z => Math.max(minZoom, z - 0.25)); };
  const zoomReset = (e: React.MouseEvent) => { e.stopPropagation(); setCanvasZoom(1); };

  const getEstimatedTotal = () => {
    const totalQty = (state.isUnsureAboutSizes 
        ? state.totalEstimatedQuantity 
        : (Object.values(state.quantities) as number[]).reduce((a, b) => a + b, 0)) as number;
    
    const refinementCostPerItem = state.logos.reduce((sum, logo) => {
        return sum + (logo.refinement === RefinementType.STICK ? 5.00 : 3.00);
    }, 0);

    const base = state.basePrice || 0;
    const singleItemPrice = base + refinementCostPerItem;
    const totalPrice = singleItemPrice * totalQty;

    const hasStick = state.logos.some(l => l.refinement === RefinementType.STICK);
    const isMoqValid = !hasStick || totalQty >= MIN_STICK_QTY;

    return {
        totalQty,
        refinementCostPerItem,
        singleItemPrice,
        totalPrice,
        hasBasePrice: state.basePrice !== null,
        hasStick,
        isMoqValid
    };
  };

  const handleOpenShare = () => {
      setShowShareModal(true);
  };
  
  const handlePrint = () => {
      window.print();
  };

  const [formData, setFormData] = useState<ContactFormData>({
    company: '', name: '', email: '', phone: '', message: ''
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Anfrage erfolgreich gesendet!");
    const { totalPrice } = getEstimatedTotal();
    console.log("Order Data:", { ...state, referenceProductUrl: shopifyUrl, estimatedTotal: totalPrice });
    window.location.reload();
  };

  const currentLogos = state.logos.filter(l => l.viewIndex === state.activeImageIndex);
  const selectedLogo = state.logos.find(l => l.id === state.selectedLogoId);

  const renderShareModal = () => {
      if (!showShareModal) return null;
      const { totalQty, totalPrice, hasBasePrice } = getEstimatedTotal();

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
                            state={state} 
                            totalPrice={totalPrice} 
                            totalQty={totalQty}
                            hasBasePrice={hasBasePrice}
                            imageDimensions={imageDimensions}
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
                            onClick={handlePrint}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md flex items-center gap-2"
                        >
                            <Printer size={18} /> Drucken / PDF speichern
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  };

  if (state.step === 'upload') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 print:hidden">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
              <ShoppingBag className="text-white w-8 h-8" />
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
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-600"
                  />
                </div>
                <button 
                  onClick={handleUrlImport}
                  disabled={!shopifyUrl}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center"
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
              className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
            >
              <div className="bg-slate-100 p-3 rounded-full mb-3 group-hover:bg-white transition-colors">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
              </div>
              <span className="font-medium">Eigenes Foto hochladen</span>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProductUpload} />
          </div>
        </div>
      </div>
    );
  }

  if (state.step === 'checkout') {
    const { totalQty, totalPrice, hasBasePrice } = getEstimatedTotal();
    const refinementSummary = Array.from(new Set(state.logos.map(l => l.refinement))).join(', ');
    
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center print:hidden">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-2xl font-bold text-slate-800">B2B Anfrage senden</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-600">
                <p>Menge: <span className="font-bold text-slate-900">{totalQty} Stk.</span> 
                   {state.isUnsureAboutSizes && <span className="text-amber-600 text-xs ml-1">(Größen unklar)</span>}
                </p>
                <p>Motive: <span className="font-bold text-slate-900">{state.logos.length}</span></p>
                <p>Arten: <span className="font-bold text-slate-900">{refinementSummary || '-'}</span></p>
            </div>
            {hasBasePrice && totalQty > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
                    <Euro size={18} className="text-blue-600" />
                    <span className="text-blue-900 font-medium">Geschätzter Gesamtpreis: <span className="font-bold">{totalPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></span>
                </div>
            )}
            {/* Reference URL Display */}
            {shopifyUrl && (
              <p className="text-slate-400 text-xs mt-2 truncate">
                Referenz: {shopifyUrl}
              </p>
            )}
          </div>
          <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Firma</label>
                <input required className="w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Name</label>
                <input required className="w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                   value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">E-Mail</label>
                <input required type="email" className="w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                   value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Telefon</label>
                <input className="w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                   value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Nachricht</label>
              <textarea rows={4} className="w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                 value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
            </div>
            <div className="flex justify-between items-center pt-4">
              <button type="button" onClick={() => setState(prev => ({ ...prev, step: 'config' }))} className="text-slate-500 hover:text-slate-800">Zurück</button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all">Angebot anfordern</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const activeImageUrl = state.productImages[state.activeImageIndex];
  const maxLogosReached = state.logos.length >= MAX_LOGOS;
  const { totalQty, totalPrice, hasBasePrice, isMoqValid } = getEstimatedTotal();

  return (
    <>
      {renderShareModal()}
      <div className="h-screen flex flex-col md:flex-row bg-white overflow-hidden print:hidden">
        <div className="flex-1 bg-slate-100 relative flex flex-col h-full overflow-hidden">
          
          <div className="absolute top-4 left-4 z-30 flex gap-2">
              <button onClick={handleUndo} disabled={history.length === 0} className="bg-white p-2 rounded shadow-md text-slate-700 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Undo2 size={20} />
              </button>
              <button onClick={handleRedo} disabled={future.length === 0} className="bg-white p-2 rounded shadow-md text-slate-700 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Redo2 size={20} />
              </button>
          </div>

          <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
              <button onClick={zoomIn} disabled={canvasZoom >= maxZoom} className="bg-white p-2 rounded shadow-md text-slate-700 hover:text-blue-600 disabled:opacity-50">
                  <ZoomIn size={20} />
              </button>
              <button onClick={zoomReset} className="bg-white p-2 rounded shadow-md text-slate-700 hover:text-blue-600">
                  <Maximize size={20} />
              </button>
              <button onClick={zoomOut} disabled={canvasZoom <= minZoom} className="bg-white p-2 rounded shadow-md text-slate-700 hover:text-blue-600 disabled:opacity-50">
                  <ZoomOut size={20} />
              </button>
              <div className="bg-white/80 px-2 py-1 rounded text-xs text-center font-medium text-slate-500 backdrop-blur">
                  {Math.round(canvasZoom * 100)}%
              </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden bg-slate-100 relative" 
              onClick={() => setState(prev => ({ ...prev, selectedLogoId: null }))}>
            
            <div 
              ref={canvasRef}
              className="relative shadow-2xl bg-white transition-transform duration-100 ease-out origin-center"
              style={{ 
                  transform: `scale(${canvasZoom})`,
              }}
            >
              {activeImageUrl ? (
                <img 
                  src={activeImageUrl} 
                  className="max-h-[75vh] max-w-[85vw] w-auto h-auto block select-none pointer-events-none" 
                  alt="Produkt" 
                />
              ) : (
                  <div className="w-[300px] h-[400px] flex items-center justify-center text-slate-400 bg-slate-50">Kein Bild geladen</div>
              )}

              <div className="absolute inset-0 top-0 left-0 w-full h-full">
                  {currentLogos.map(logo => (
                  <LogoDraggable 
                      key={logo.id}
                      id={logo.id}
                      imageSrc={logo.url}
                      isSelected={state.selectedLogoId === logo.id}
                      onSelect={() => setState(prev => ({ ...prev, selectedLogoId: logo.id }))}
                      xPercent={logo.x}
                      yPercent={logo.y}
                      initialScale={logo.scale}
                      initialRotation={logo.rotation}
                      canvasZoom={canvasZoom}
                      onUpdate={handleLogoUpdate}
                  />
                  ))}
              </div>
            </div>
          </div>

          {state.productImages.length > 1 && (
              <div className="h-24 bg-white border-t border-slate-200 p-2 flex gap-2 overflow-x-auto items-center justify-center shrink-0 z-20">
                  {state.productImages.map((img, idx) => (
                      <button 
                          key={idx}
                          onClick={() => setState(prev => ({ ...prev, activeImageIndex: idx, selectedLogoId: null }))}
                          className={`h-20 w-20 border-2 rounded-lg overflow-hidden transition-all flex-shrink-0 ${state.activeImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-100 hover:border-slate-300'}`}
                      >
                          <img src={img} className="w-full h-full object-cover" alt={`Ansicht ${idx+1}`} />
                      </button>
                  ))}
              </div>
          )}
        </div>

        <div className="w-full md:w-[400px] bg-white border-l border-slate-200 flex flex-col h-[50vh] md:h-auto overflow-y-auto relative z-40 shadow-xl">
          <div className="p-6 space-y-6 pb-24">
            
            <div className="flex justify-between items-start">
              <div>
                  <h2 className="text-xl font-bold text-slate-800">Konfiguration</h2>
                  <p className="text-slate-500 text-sm">Ansicht {state.activeImageIndex + 1} von {state.productImages.length}</p>
              </div>
            </div>

            <button
              onClick={() => !maxLogosReached && logoInputRef.current?.click()}
              disabled={maxLogosReached}
              className={`w-full py-3 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${maxLogosReached ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed' : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
            >
              <Upload size={18} /> 
              {maxLogosReached ? 'Maximal 5 Logos erreicht' : 'Logo auf diese Ansicht hinzufügen'}
              <span className="text-xs ml-1 opacity-70">({state.logos.length}/{MAX_LOGOS})</span>
            </button>
            <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />

            {selectedLogo ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-blue-100 ring-1 ring-blue-100 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Aktuelles Logo bearbeiten
                      </h3>
                      <button onClick={handleDeleteLogo} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1.5">Veredelungsart für dieses Logo</label>
                          <select 
                              value={selectedLogo.refinement}
                              onChange={(e) => handleRefinementChange(e.target.value as RefinementType)}
                              className="w-full bg-white border border-slate-200 text-slate-800 py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                          >
                              {Object.values(RefinementType).map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          {selectedLogo.refinement === RefinementType.STICK && (
                              <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                                  <AlertCircle size={10} /> Mindestbestellmenge bei Stick: 5 Stk.
                              </p>
                          )}
                      </div>
                  </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 border rounded-xl border-slate-100 bg-slate-50/50">
                  <p className="text-sm">Wähle ein Logo auf dem Produkt aus,<br/>um die Veredelung einzustellen.</p>
              </div>
            )}

            <hr className="border-slate-100" />

            <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Größen & Mengen</h3>
                
                <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="relative flex items-center">
                          <input 
                              type="checkbox"
                              id="unsure-sizes"
                              checked={state.isUnsureAboutSizes}
                              onChange={(e) => setState(prev => ({ ...prev, isUnsureAboutSizes: e.target.checked }))}
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                      </div>
                      <label htmlFor="unsure-sizes" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                          Ich bin mir unsicher bzgl. den Größen
                      </label>
                </div>

                {state.isUnsureAboutSizes ? (
                      <div className="space-y-1 animation-fade-in">
                          <label className="text-xs font-medium text-slate-500">Erwartete Gesamtstückzahl</label>
                          <input
                              type="number"
                              min="1"
                              value={state.totalEstimatedQuantity || ''}
                              onChange={(e) => handleTotalQuantityChange(e.target.value)}
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium"
                              placeholder="z.B. 50"
                          />
                      </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {state.availableSizes.map(size => (
                        <div key={size} className="relative">
                          <label className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-slate-400 font-medium">{size}</label>
                          <input
                            type="number"
                            min="0"
                            value={state.quantities[size] || ''}
                            onChange={(e) => handleQuantityChange(size, e.target.value)}
                            placeholder="0"
                            className="w-full text-center py-2 border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium text-slate-700 placeholder-slate-300"
                          />
                        </div>
                      ))}
                    </div>
                )}
              </div>
          </div>

          <div className="mt-auto border-t border-slate-100 p-6 bg-white sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-4 text-sm text-slate-600">
              <span>Gesamtmenge:</span>
              <div className="text-right">
                  <div className="font-bold text-slate-900">
                      {totalQty} Stk.
                      {state.isUnsureAboutSizes && <span className="text-xs font-normal text-slate-400 ml-1">(Geschätzt)</span>}
                  </div>
                  {hasBasePrice && totalQty > 0 && (
                      <div className="text-blue-600 font-bold text-lg">
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
                  onClick={handleOpenShare}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 p-3.5 rounded-xl transition-colors flex items-center justify-center shadow-sm"
                  title="Konfiguration teilen / Übersicht"
                >
                    <Share2 size={20} />
                </button>
                <button 
                  onClick={() => setState(prev => ({ ...prev, step: 'checkout' }))}
                  disabled={!isMoqValid}
                  className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isMoqValid ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  Weiter zur Anfrage <ArrowRight size={18} />
                </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;