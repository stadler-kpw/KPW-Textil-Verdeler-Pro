import React, { useEffect, useState } from 'react';

export const SuccessScreen: React.FC = () => {
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      {/* Animated checkmark */}
      <div className="relative mb-8">
        <svg
          className="w-24 h-24 animate-success-circle"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="48"
            cy="48"
            r="44"
            stroke="#10b981"
            strokeWidth="4"
            className="animate-success-circle-draw"
          />
          <path
            d="M28 50 L42 64 L68 34"
            stroke="#10b981"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="animate-success-check-draw"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-4">
        Vielen Dank!
      </h2>

      <p className="text-slate-600 max-w-md leading-relaxed mb-8">
        Ihre Anfrage wurde erfolgreich an unser Team weitergeleitet.
        Wir melden uns in den nächsten 72h bei Ihnen.
      </p>

      <p className="text-sm text-slate-400">
        Sie werden in {countdown} {countdown === 1 ? 'Sekunde' : 'Sekunden'} weitergeleitet...
      </p>
    </div>
  );
};
