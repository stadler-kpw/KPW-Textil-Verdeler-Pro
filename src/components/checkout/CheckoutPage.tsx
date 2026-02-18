import React from 'react';
import { OrderSummary } from './OrderSummary';
import { ContactForm } from './ContactForm';

export const CheckoutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center print:hidden">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
        <OrderSummary />
        <ContactForm />
      </div>
    </div>
  );
};
