import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContactStore } from '@/stores/useContactStore';

export const ContactForm: React.FC = () => {
  const navigate = useNavigate();
  const formData = useContactStore((s) => s.formData);
  const updateField = useContactStore((s) => s.updateField);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Anfrage erfolgreich gesendet!");
    console.log("Order Data:", formData);
    window.location.reload();
  };

  return (
    <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Firma</label>
          <input required className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none"
            value={formData.company} onChange={e => updateField('company', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Name</label>
          <input required className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none"
            value={formData.name} onChange={e => updateField('name', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">E-Mail</label>
          <input required type="email" className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none"
            value={formData.email} onChange={e => updateField('email', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Telefon</label>
          <input className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none"
            value={formData.phone} onChange={e => updateField('phone', e.target.value)} />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Nachricht</label>
        <textarea rows={4} className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none"
          value={formData.message} onChange={e => updateField('message', e.target.value)} />
      </div>
      <div className="flex justify-between items-center pt-4">
        <button type="button" onClick={() => navigate('/config')} className="text-slate-500 hover:text-slate-800">Zurück</button>
        <button type="submit" className="bg-primary-400 hover:bg-primary-500 text-slate-900 px-8 py-3 rounded-lg font-bold shadow-lg transition-all">Angebot anfordern</button>
      </div>
    </form>
  );
};
