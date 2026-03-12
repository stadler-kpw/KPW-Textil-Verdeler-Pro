import React, { useEffect, useState } from 'react';
import { SearchX } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = 'https://www.kp-workwear.com';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-primary-400 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
            <SearchX className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-3">
          Seite nicht gefunden
        </h1>

        <p className="text-slate-600 leading-relaxed mb-6">
          Die angeforderte Seite existiert leider nicht.
        </p>

        <a
          href="https://www.kp-workwear.com"
          className="inline-block w-full py-3 px-6 bg-primary-400 hover:bg-primary-500 text-slate-900 font-semibold rounded-lg transition-colors mb-6"
        >
          Zurück zur Startseite
        </a>

        <p className="text-sm text-slate-400">
          Sie werden in {countdown} {countdown === 1 ? 'Sekunde' : 'Sekunden'} weitergeleitet...
        </p>
      </div>
    </div>
  );
};
