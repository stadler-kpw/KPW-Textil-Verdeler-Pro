import React from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import { RefinementType } from '@/types';

export const LogoEditor: React.FC = () => {
  const logos = useConfigStore((s) => s.logos);
  const selectedLogoId = useConfigStore((s) => s.selectedLogoId);
  const deleteLogo = useConfigStore((s) => s.deleteLogo);
  const setRefinement = useConfigStore((s) => s.setRefinement);

  const selectedLogo = logos.find(l => l.id === selectedLogoId);

  if (!selectedLogo) {
    return (
      <div className="text-center py-8 text-slate-400 border rounded-xl border-slate-100 bg-slate-50/50">
        <p className="text-sm">Wähle ein Logo auf dem Produkt aus,<br />um die Veredelung einzustellen.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-primary-100 ring-1 ring-primary-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-400"></span>
          Aktuelles Logo bearbeiten
        </h3>
        <button onClick={() => deleteLogo(selectedLogo.id)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Veredelungsart für dieses Logo</label>
          <select
            value={selectedLogo.refinement}
            onChange={(e) => setRefinement(selectedLogo.id, e.target.value as RefinementType)}
            className="w-full bg-white border border-slate-200 text-slate-800 py-2 px-3 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none text-sm font-medium"
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
  );
};
