import React from 'react';
import { useConfigStore } from '@/stores/useConfigStore';
import { useUiStore } from '@/stores/useUiStore';
import { LogoDraggable } from './LogoDraggable';

export const LogoOverlay: React.FC = () => {
  const logos = useConfigStore((s) => s.logos);
  const activeImageIndex = useConfigStore((s) => s.activeImageIndex);
  const selectedLogoId = useConfigStore((s) => s.selectedLogoId);
  const selectLogo = useConfigStore((s) => s.selectLogo);
  const updateLogo = useConfigStore((s) => s.updateLogo);
  const canvasZoom = useUiStore((s) => s.canvasZoom);

  const currentLogos = logos.filter(l => l.viewIndex === activeImageIndex);

  return (
    <div className="absolute inset-0 top-0 left-0 w-full h-full">
      {currentLogos.map(logo => (
        <LogoDraggable
          key={logo.id}
          id={logo.id}
          imageSrc={logo.url}
          isSelected={selectedLogoId === logo.id}
          onSelect={() => selectLogo(logo.id)}
          xPercent={logo.x}
          yPercent={logo.y}
          initialScale={logo.scale}
          initialRotation={logo.rotation}
          canvasZoom={canvasZoom}
          onUpdate={(id, updates) => updateLogo(id, updates)}
        />
      ))}
    </div>
  );
};
