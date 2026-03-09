import React, { useState } from 'react';
import { OrderSummary } from './OrderSummary';
import { ContactForm } from './ContactForm';
import { SuccessScreen } from './SuccessScreen';

export const CheckoutPage: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center print:hidden">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
        {showSuccess ? (
          <SuccessScreen />
        ) : (
          <>
            <OrderSummary />
            <ContactForm onSuccess={() => setShowSuccess(true)} />
          </>
        )}
      </div>
    </div>
  );
};
