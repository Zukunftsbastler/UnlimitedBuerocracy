import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FlyingFormProps {
  formImage: string;
  onComplete: () => void;
  startDelay?: number;
}

/**
 * FlyingForm - A tiny form that flies from right to left across the screen
 * Used to visualize automation-generated AP
 */
export const FlyingForm: React.FC<FlyingFormProps> = ({
  formImage,
  onComplete,
  startDelay = 0,
}) => {
  // Random flight parameters
  const [params] = useState(() => ({
    // Vertical position (top 20% of screen)
    yStart: Math.random() * 20,
    yEnd: Math.random() * 20,
    
    // Duration: 2-4 seconds
    duration: 2 + Math.random() * 2,
    
    // Rotation
    rotationSpeed: (Math.random() - 0.5) * 720, // -360 to +360 degrees
    initialRotation: Math.random() * 360,
    
    // Size: very small
    size: 30 + Math.random() * 20, // 30-50px
    
    // Opacity
    opacity: 0.6 + Math.random() * 0.3, // 0.6-0.9
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, (params.duration + startDelay) * 1000);
    
    return () => clearTimeout(timer);
  }, [params.duration, startDelay, onComplete]);

  return (
    <motion.div
      className="absolute pointer-events-none"
      initial={{
        x: '100vw',
        y: `${params.yStart}vh`,
        rotate: params.initialRotation,
        opacity: 0,
      }}
      animate={{
        x: '-10vw',
        y: `${params.yEnd}vh`,
        rotate: params.initialRotation + params.rotationSpeed,
        opacity: params.opacity,
      }}
      transition={{
        duration: params.duration,
        delay: startDelay,
        ease: 'linear',
      }}
      style={{
        width: `${params.size}px`,
        height: `${params.size * 1.4}px`, // Maintain aspect ratio
        zIndex: 50,
      }}
    >
      <img
        src={formImage}
        alt="Flying form"
        className="w-full h-full object-contain drop-shadow-md"
      />
    </motion.div>
  );
};
