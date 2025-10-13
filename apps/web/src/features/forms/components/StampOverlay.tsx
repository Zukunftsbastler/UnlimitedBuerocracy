import React from 'react';
import type { StampVisual } from '../types';

interface StampOverlayProps {
  stamp: StampVisual;
  className?: string;
}

/**
 * StampOverlay component renders stamp/smudge images with rotation and positioning
 * Uses absolute positioning to place stamps at specific coordinates
 */
export const StampOverlay: React.FC<StampOverlayProps> = ({
  stamp,
  className = '',
}) => {
  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        left: `${stamp.x * 100}%`,
        top: `${stamp.y * 100}%`,
        transform: `translate(-50%, -50%) rotate(${stamp.rotation}deg) scale(${stamp.scale || 1})`,
        opacity: stamp.opacity || 1,
        transition: 'opacity 0.2s ease-out',
      }}
    >
      <img
        src={stamp.image}
        alt="Stamp"
        className="w-32 h-32 object-contain"
        draggable={false}
        style={{
          filter: stamp.opacity && stamp.opacity < 0.5 ? 'blur(2px)' : undefined,
        }}
      />
    </div>
  );
};
