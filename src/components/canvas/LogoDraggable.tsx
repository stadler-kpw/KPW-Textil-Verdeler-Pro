import React, { useRef, useState, useEffect } from 'react';
import { ArrowUpLeft, RotateCw } from 'lucide-react';

interface Props {
  id: string;
  imageSrc: string;
  isSelected: boolean;
  onSelect: () => void;
  // Position is now in Percentages (0-100)
  xPercent: number;
  yPercent: number;
  initialScale: number;
  initialRotation: number;
  canvasZoom: number;
  onUpdate: (id: string, updates: { x: number; y: number; scale: number; rotation: number }) => void;
}

type Mode = 'none' | 'drag' | 'resize' | 'rotate';

export const LogoDraggable: React.FC<Props> = ({ 
  id,
  imageSrc, 
  isSelected, 
  onSelect,
  xPercent,
  yPercent,
  initialScale,
  initialRotation,
  canvasZoom,
  onUpdate
}) => {
  // We keep local state in pixels for smooth dragging, but sync with props
  // Actually, keeping local state in Percent is harder for drag math, so we calculate pixels on drag start
  
  // To avoid layout thrashing, we rely on the props for rendering position usually.
  // But during drag, we need immediate feedback.
  
  // Strategy: 
  // 1. Render using style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
  // 2. On Drag Start: capture parent dimensions in pixels.
  // 3. On Drag Move: calculate new % based on pixels.
  // 4. Update parent state immediately (or local state then parent on up). 
  //    Updating parent immediately makes it responsive but might be slow if parent rerenders heavy.
  //    Let's try updating parent immediately as App is small.
  
  const [mode, setMode] = useState<Mode>('none');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Mouse Screen Pos
  
  // Snapshots for drag calculations
  const [startProps, setStartProps] = useState({ x: 0, y: 0, scale: 1, rotation: 0 }); 
  const [parentDim, setParentDim] = useState({ w: 1, h: 1 });

  const boxRef = useRef<HTMLDivElement>(null);
  const baseSize = 150;

  // Global Event Listeners for Dragging
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (mode === 'none') return;
      
      const deltaScreenX = (e.clientX - dragStart.x) / canvasZoom;
      const deltaScreenY = (e.clientY - dragStart.y) / canvasZoom;

      if (mode === 'drag') {
        // Convert delta pixels to delta percent
        const deltaPercentX = (deltaScreenX / parentDim.w) * 100;
        const deltaPercentY = (deltaScreenY / parentDim.h) * 100;

        let newX = startProps.x + deltaPercentX;
        let newY = startProps.y + deltaPercentY;

        // Clamp (optional, allows going slightly off)
        newX = Math.max(0, Math.min(newX, 100));
        newY = Math.max(0, Math.min(newY, 100));

        onUpdate(id, { x: newX, y: newY, scale: startProps.scale, rotation: startProps.rotation });
      } 
      else if (mode === 'resize') {
        const sensitivity = 0.005;
        const newScale = Math.max(0.2, startProps.scale + (deltaScreenX + deltaScreenY) * sensitivity);
        onUpdate(id, { x: startProps.x, y: startProps.y, scale: newScale, rotation: startProps.rotation });
      }
      else if (mode === 'rotate') {
        if (!boxRef.current) return;
        const rect = boxRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const startAngle = Math.atan2(dragStart.y - centerY, dragStart.x - centerX);
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        
        const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
        onUpdate(id, { x: startProps.x, y: startProps.y, scale: startProps.scale, rotation: startProps.rotation + angleDiff });
      }
    };

    const handlePointerUp = () => {
      if (mode !== 'none') {
        setMode('none');
      }
    };

    if (mode !== 'none') {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [mode, dragStart, startProps, parentDim, onUpdate, id, canvasZoom]);


  const startInteraction = (e: React.PointerEvent, newMode: Mode) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect();
    
    if (boxRef.current && boxRef.current.offsetParent) {
        const parent = boxRef.current.offsetParent as HTMLElement;
        setParentDim({ w: parent.clientWidth, h: parent.clientHeight });
    }

    setDragStart({ x: e.clientX, y: e.clientY });
    setStartProps({ x: xPercent, y: yPercent, scale: initialScale, rotation: initialRotation });
    setMode(newMode);
  };

  // Inverse scale for UI handles
  const handleScale = 1 / canvasZoom;

  return (
    <div
      ref={boxRef}
      onPointerDown={(e) => startInteraction(e, 'drag')}
      onClick={(e) => e.stopPropagation()}
      style={{
        // Position using Percentages
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        // We assume x/y is the top-left corner of the box. 
        // If we want center-based positioning, we would do transform: translate(-50%, -50%). 
        // But dragging logic above assumes top-left mapping. Let's keep top-left for simplicity 
        // or ensure consistent behavior. 
        // With standard drag drop, usually top-left is easier.
        transform: `rotate(${initialRotation}deg)`, 
        width: baseSize * initialScale,
        height: baseSize * initialScale,
        touchAction: 'none',
        position: 'absolute',
        cursor: mode === 'drag' ? 'grabbing' : 'grab',
        zIndex: isSelected ? 20 : 10,
      }}
      className={`group select-none ${isSelected ? 'ring-2 ring-sky-400 ring-offset-2' : ''}`}
    >
      <img 
        src={imageSrc} 
        alt="Logo" 
        className="w-full h-full object-contain pointer-events-none" 
      />
      
      {isSelected && (
        <>
            <div
                onPointerDown={(e) => startInteraction(e, 'rotate')}
                style={{
                  transform: `scale(${handleScale})`,
                  transformOrigin: 'bottom left',
                }}
                className="absolute -top-3 -right-3 w-6 h-6 bg-white border border-slate-300 rounded-full shadow-sm flex items-center justify-center cursor-alias hover:bg-slate-50 z-30"
                title="Drehen"
            >
                <RotateCw size={12} className="text-slate-600" />
            </div>

            <div
                onPointerDown={(e) => startInteraction(e, 'resize')}
                style={{
                  transform: `scale(${handleScale})`,
                  transformOrigin: 'top left',
                }}
                className="absolute -bottom-3 -right-3 w-6 h-6 bg-sky-400 border border-sky-500 rounded-full shadow-sm flex items-center justify-center cursor-nwse-resize hover:bg-sky-500 z-30"
                title="Größe ändern"
            >
                <ArrowUpLeft size={12} className="text-slate-900 transform -rotate-90" />
            </div>
        </>
      )}
    </div>
  );
};