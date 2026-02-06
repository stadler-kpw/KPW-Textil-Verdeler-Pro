import React, { useRef, useState, useEffect } from 'react';
import { ArrowUpLeft, RefreshCcw, Move } from 'lucide-react';

interface Props {
  id: string;
  imageSrc: string;
  isSelected: boolean;
  onSelect: () => void;
  initialX: number;
  initialY: number;
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
  initialX,
  initialY,
  initialScale,
  initialRotation,
  canvasZoom,
  onUpdate
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [scale, setScale] = useState(initialScale);
  const [rotation, setRotation] = useState(initialRotation);
  
  const [mode, setMode] = useState<Mode>('none');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Mouse Pos at start
  const [initialState, setInitialState] = useState({ x: 0, y: 0, scale: 1, rotation: 0 }); // Object State at start

  const boxRef = useRef<HTMLDivElement>(null);
  const baseSize = 150;

  // Sync props to state if they change externally (and not currently dragging)
  useEffect(() => {
    if (mode === 'none') {
      setPosition({ x: initialX, y: initialY });
      setScale(initialScale);
      setRotation(initialRotation);
    }
  }, [initialX, initialY, initialScale, initialRotation, mode]);

  // Global Event Listeners for Dragging
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (mode === 'none') return;
      
      // Adjust delta by zoom level to keep movement 1:1 with cursor
      const deltaX = (e.clientX - dragStart.x) / canvasZoom;
      const deltaY = (e.clientY - dragStart.y) / canvasZoom;

      if (mode === 'drag') {
        let newX = initialState.x + deltaX;
        let newY = initialState.y + deltaY;

        // Boundary Constraints
        if (boxRef.current?.offsetParent) {
          const parent = boxRef.current.offsetParent as HTMLElement;
          const parentWidth = parent.clientWidth;
          const parentHeight = parent.clientHeight;
          const currentWidth = baseSize * initialState.scale;
          const currentHeight = baseSize * initialState.scale;

          newX = Math.max(0, Math.min(newX, parentWidth - currentWidth));
          newY = Math.max(0, Math.min(newY, parentHeight - currentHeight));
        }

        setPosition({ x: newX, y: newY });
      } 
      else if (mode === 'resize') {
        const sensitivity = 0.005;
        // Adjust sensitivity by zoom? Usually not needed if delta is already adjusted
        const newScale = Math.max(0.2, initialState.scale + (deltaX + deltaY) * sensitivity);
        setScale(newScale);
      }
      else if (mode === 'rotate') {
        if (!boxRef.current) return;
        const rect = boxRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate angles. 
        // Note: clientX/Y are screen coords, correct for atan2 regardless of zoom 
        // as long as rect center is also screen coords.
        const startAngle = Math.atan2(dragStart.y - centerY, dragStart.x - centerX);
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        
        const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
        setRotation(initialState.rotation + angleDiff);
      }
    };

    const handlePointerUp = () => {
      if (mode !== 'none') {
        onUpdate(id, { x: position.x, y: position.y, scale, rotation });
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
  }, [mode, dragStart, initialState, onUpdate, id, position, scale, rotation, canvasZoom]);


  const startInteraction = (e: React.PointerEvent, newMode: Mode) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect();
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialState({ x: position.x, y: position.y, scale, rotation });
    setMode(newMode);
  };

  // Inverse scale for UI handles so they stay consistent size regardless of zoom
  const handleScale = 1 / canvasZoom;

  return (
    <div
      ref={boxRef}
      onPointerDown={(e) => startInteraction(e, 'drag')}
      onClick={(e) => e.stopPropagation()}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        width: baseSize * scale,
        height: baseSize * scale,
        touchAction: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: mode === 'drag' ? 'grabbing' : 'grab',
        zIndex: isSelected ? 20 : 10,
      }}
      className={`group select-none ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
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
                  transformOrigin: 'bottom left', // Pivot at the corner of the box
                }}
                className="absolute -top-3 -right-3 w-6 h-6 bg-white border border-slate-300 rounded-full shadow-sm flex items-center justify-center cursor-alias hover:bg-slate-50 z-30"
                title="Drehen"
            >
                <RefreshCcw size={12} className="text-slate-600" />
            </div>

            <div
                onPointerDown={(e) => startInteraction(e, 'resize')}
                style={{
                  transform: `scale(${handleScale})`,
                  transformOrigin: 'top left',
                }}
                className="absolute -bottom-3 -right-3 w-6 h-6 bg-blue-600 border border-blue-700 rounded-full shadow-sm flex items-center justify-center cursor-nwse-resize hover:bg-blue-700 z-30"
                title="Größe ändern"
            >
                <ArrowUpLeft size={12} className="text-white transform -rotate-90" />
            </div>
        </>
      )}
    </div>
  );
};
