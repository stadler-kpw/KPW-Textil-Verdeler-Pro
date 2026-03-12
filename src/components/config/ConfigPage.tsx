import React, { useEffect } from 'react';
import { ProductCanvas } from '@/components/canvas/ProductCanvas';
import { ConfigSidebar } from '@/components/sidebar/ConfigSidebar';
import { ShareModal } from '@/components/print/ShareModal';
import { useConfigStore } from '@/stores/useConfigStore';

export const ConfigPage: React.FC = () => {
  const logos = useConfigStore((s) => s.logos);

  useEffect(() => {
    if (logos.length === 0) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [logos.length]);

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
