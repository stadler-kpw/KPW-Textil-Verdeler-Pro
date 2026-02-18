import React from 'react';
import { ProductCanvas } from '@/components/canvas/ProductCanvas';
import { ConfigSidebar } from '@/components/sidebar/ConfigSidebar';
import { ShareModal } from '@/components/print/ShareModal';

export const ConfigPage: React.FC = () => {
  return (
    <>
      <ShareModal />
      <div className="h-screen flex flex-col md:flex-row bg-white overflow-hidden print:hidden">
        <ProductCanvas />
        <ConfigSidebar />
      </div>
    </>
  );
};
