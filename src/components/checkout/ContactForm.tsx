import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useContactStore } from '@/stores/useContactStore';
import { useConfigStore } from '@/stores/useConfigStore';
import { useUiStore } from '@/stores/useUiStore';
import { useImageDimensions } from '@/hooks/useImageDimensions';
import { usePricing } from '@/hooks/usePricing';
import { PrintableQuote } from '@/components/print/PrintableQuote';
import { generateQuotePdf } from '@/services/pdfService';
import { sendInquiry } from '@/services/inquiryService';
import { MAX_PDF_SIZE } from '@/lib/constants';

type SubmitStatus = 'idle' | 'generating-pdf' | 'sending' | 'success' | 'error';

interface ContactFormProps {
  onSuccess: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formData = useContactStore((s) => s.formData);
  const updateField = useContactStore((s) => s.updateField);
  const resetForm = useContactStore((s) => s.resetForm);

  const productImages = useConfigStore((s) => s.productImages);
  const logos = useConfigStore((s) => s.logos);
  const activeImageIndex = useConfigStore((s) => s.activeImageIndex);
  const quantities = useConfigStore((s) => s.quantities);
  const isUnsureAboutSizes = useConfigStore((s) => s.isUnsureAboutSizes);
  const canvasRenderedDimensions = useUiStore((s) => s.canvasRenderedDimensions);
  const imageDimensions = useImageDimensions();
  const { totalQty, totalPrice, hasBasePrice } = usePricing();

  const isSubmitting = submitStatus === 'generating-pdf' || submitStatus === 'sending';

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage(null);

    const trimmedCompany = formData.company.trim();
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedCompany || !trimmedName || !trimmedEmail) {
      setErrorMessage('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    try {
      setSubmitStatus('generating-pdf');
      const printElement = printRef.current;
      if (!printElement) throw new Error('PDF-Element nicht gefunden');

      const pdfBlob = await generateQuotePdf(printElement);

      if (pdfBlob.size > MAX_PDF_SIZE) {
        throw new Error(`Das PDF ist zu groß (${(pdfBlob.size / (1024 * 1024)).toFixed(1)} MB). Bitte verwenden Sie kleinere Bilder.`);
      }

      setSubmitStatus('sending');
      await sendInquiry(formData, pdfBlob);

      setSubmitStatus('success');
      onSuccess();
    } catch (error) {
      console.error('Inquiry submission failed:', error);
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Ein unbekannter Fehler ist aufgetreten.'
      );
    }
  };

  return (
    <>
      {createPortal(
        <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }} aria-hidden="true">
          <div ref={printRef}>
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
        </div>,
        document.body
      )}

      <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Firma</label>
            <input required maxLength={200} className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none"
              value={formData.company} onChange={e => updateField('company', e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input required maxLength={200} className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none"
              value={formData.name} onChange={e => updateField('name', e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">E-Mail</label>
            <input required type="email" maxLength={254} className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none"
              value={formData.email} onChange={e => updateField('email', e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Telefon</label>
            <input maxLength={30} className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none"
              value={formData.phone} onChange={e => updateField('phone', e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Nachricht</label>
          <textarea rows={4} maxLength={2000} className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none min-h-[100px] max-h-[250px]"
            value={formData.message} onChange={e => updateField('message', e.target.value)} />
        </div>

        {submitStatus === 'error' && errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={18} />
            {errorMessage}
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <button type="button" onClick={() => navigate('/config')} className="text-slate-500 hover:text-slate-800" disabled={isSubmitting}>
            Zurück
          </button>
          <button
            type="submit"
            disabled={isSubmitting || submitStatus === 'success'}
            className="bg-primary-400 hover:bg-primary-500 text-slate-900 px-8 py-3 rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 size={18} className="animate-spin" />}
            {submitStatus === 'generating-pdf' ? 'PDF wird erstellt...' :
             submitStatus === 'sending' ? 'Wird gesendet...' :
             submitStatus === 'success' ? 'Gesendet!' :
             'Angebot anfordern'}
          </button>
        </div>
      </form>
    </>
  );
};
