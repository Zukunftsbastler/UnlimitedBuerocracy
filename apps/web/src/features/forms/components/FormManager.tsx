import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormCanvas } from './FormCanvas';
import { StampOverlay } from './StampOverlay';
import type {
  FormTemplate,
  FormContent,
  StampResult,
  StampVisual,
  StampField,
  FormAnimationConfig,
} from '../types';
import { calculateDistance, isClickInStampField } from '../hooks/useFormAnimation';

// Import stamp images
import Stempel01 from '../../../assets/stamps/approved/Stempel01.png';
import Stempel02 from '../../../assets/stamps/approved/Stempel02.png';
import Stempel03 from '../../../assets/stamps/approved/Stempel03.png';
import Stempel04 from '../../../assets/stamps/approved/Stempel04.png';
import Stempel05 from '../../../assets/stamps/approved/Stempel05.png';
import Stempel06 from '../../../assets/stamps/approved/Stempel06.png';
import Stempel07 from '../../../assets/stamps/approved/Stempel07.png';
import Stempel08 from '../../../assets/stamps/approved/Stempel08.png';
import Stempel09 from '../../../assets/stamps/approved/Stempel09.png';
import Stempel10 from '../../../assets/stamps/approved/Stempel10.png';
import Klecks01 from '../../../assets/stamps/failed/Klecks01.png';
import Klecks05 from '../../../assets/stamps/failed/Klecks05.png';
import Klecks06 from '../../../assets/stamps/failed/Klecks06.png';
import Klecks07 from '../../../assets/stamps/failed/Klecks07.png';
import Klecks08 from '../../../assets/stamps/failed/Klecks08.png';
import Kaffeefleck from '../../../assets/stamps/special/Kaffeefleck.png';

// Import form backgrounds
import form01 from '../../../assets/forms/form_canvas01.png';
import form02 from '../../../assets/forms/form_canvas02.png';
import form03 from '../../../assets/forms/form_canvas03.png';
import form04 from '../../../assets/forms/form_canvas04.png';
import form05 from '../../../assets/forms/form_canvas05.png';
import form06 from '../../../assets/forms/form_canvas06.png';
import form07 from '../../../assets/forms/form_canvas07.png';
import form08 from '../../../assets/forms/form_canvas08.png';
import form09 from '../../../assets/forms/form_canvas09.png';

const STAMP_IMAGES = {
  approved: [
    Stempel01,
    Stempel02,
    Stempel03,
    Stempel04,
    Stempel05,
    Stempel06,
    Stempel07,
    Stempel08,
    Stempel09,
    Stempel10,
  ],
  failed: [Klecks01, Klecks05, Klecks06, Klecks07, Klecks08],
  special: [Kaffeefleck],
};

const FORM_BACKGROUNDS = [
  form01,
  form02,
  form03,
  form04,
  form05,
  form06,
  form07,
  form08,
  form09,
];

interface FormManagerProps {
  templates: FormTemplate[];
  contents: FormContent[];
  onStamp?: (result: StampResult) => void;
  concentration?: number; // 0-1, affects stamp quality
  showDebug?: boolean; // Show stamp field boundaries
  animationConfig?: Partial<FormAnimationConfig>;
}

const DEFAULT_ANIMATION_CONFIG: FormAnimationConfig = {
  entryDuration: 600,
  exitDuration: 400,
  entryDelay: 0,
  displayDuration: 300,
  springStiffness: 80,
  springDamping: 18,
};

/**
 * FormManager orchestrates the entire form stamping experience
 * Manages form lifecycle, stamping logic, and animations
 */
export const FormManager: React.FC<FormManagerProps> = ({
  templates,
  contents,
  onStamp,
  concentration = 1.0,
  showDebug = false,
  animationConfig = {},
}) => {
  const config = { ...DEFAULT_ANIMATION_CONFIG, ...animationConfig };

  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [stamps, setStamps] = useState<StampVisual[]>([]);
  const [isExiting, setIsExiting] = useState(false);
  const [entryRotation, setEntryRotation] = useState(0);
  const [hasSuccessStamp, setHasSuccessStamp] = useState(false);

  // Get current template and content
  const currentTemplate = templates[currentFormIndex % templates.length];
  const currentContent = contents[currentContentIndex % contents.length];

  // Generate random background - use a seeded random based on formIndex for variety
  const backgroundImage = useMemo(() => {
    // Use a better distribution to cycle through all backgrounds
    const bgIndex = Math.floor(Math.random() * FORM_BACKGROUNDS.length);
    return FORM_BACKGROUNDS[bgIndex];
  }, [currentFormIndex]);

  const stampField = useMemo((): StampField => {
    // Random position within safe bounds - new random each form
    const x = 0.3 + Math.random() * 0.4; // 0.3 to 0.7
    const y = 0.5 + Math.random() * 0.3; // 0.5 to 0.8
    const radius = currentTemplate.stampFieldRadius || 0.12;
    return { x, y, radius };
  }, [currentFormIndex, currentTemplate.stampFieldRadius]);

  // Generate random entry rotation with more variety
  useEffect(() => {
    const newRotation = (Math.random() - 0.5) * 60; // -30 to +30 degrees for more variety
    setEntryRotation(newRotation);
  }, [currentFormIndex]);

  const selectRandomStamp = useCallback(
    (type: 'approved' | 'failed' | 'special', x: number, y: number): StampVisual => {
      const images = STAMP_IMAGES[type];
      const image = images[Math.floor(Math.random() * images.length)];
      const rotation = Math.random() * 40 - 20; // -20 to +20 degrees
      const scale = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      const opacity = concentration < 0.3 ? 0.3 + concentration * 0.7 : 1.0;

      return {
        image,
        rotation,
        x,
        y,
        scale,
        opacity,
      };
    },
    [concentration]
  );

  const handleStampClick = useCallback(
    (x: number, y: number) => {
      // Don't allow more stamps after success
      if (hasSuccessStamp) return;

      // Check if concentration is too low for proper stamping
      const isFumbled = concentration < 0.3 && Math.random() > concentration;

      // Check if click is within stamp field
      const inStampField = isClickInStampField(
        x,
        y,
        stampField.x,
        stampField.y,
        stampField.radius
      );

      let stampResult: StampResult;
      let stampType: 'approved' | 'failed' | 'special';

      if (inStampField && !isFumbled) {
        // Success! In stamp field with good concentration
        const distance = calculateDistance(x, y, stampField.x, stampField.y);
        const accuracy = 1 - distance / stampField.radius; // 0-1, 1 = perfect center
        stampType = 'approved';
        stampResult = {
          success: true,
          accuracy,
          position: { x, y },
          type: stampType,
        };
      } else if (inStampField && isFumbled) {
        // Fumbled! In stamp field but low concentration -> smudge
        stampType = 'failed';
        stampResult = {
          success: false,
          accuracy: 0,
          position: { x, y },
          type: stampType,
        };
      } else {
        // Missed stamp field: coffee stain
        stampType = 'special';
        stampResult = {
          success: false,
          accuracy: 0,
          position: { x, y },
          type: stampType,
        };
      }

      // Place stamp visual
      const stampVisual = selectRandomStamp(stampType, x, y);
      setStamps((prev) => [...prev, stampVisual]);

      // Trigger callback and exit ONLY on success
      if (stampResult.success) {
        if (onStamp) {
          onStamp(stampResult);
        }
        setHasSuccessStamp(true);
        setTimeout(() => {
          setIsExiting(true);
        }, config.displayDuration);
      }
      // If failed (coffee stain or smudge), stamp stays on form and form remains for retry
    },
    [
      hasSuccessStamp,
      stampField,
      concentration,
      selectRandomStamp,
      onStamp,
      config.displayDuration,
    ]
  );

  const handleExitComplete = useCallback(() => {
    // Reset for next form
    setIsExiting(false);
    setStamps([]);
    setHasSuccessStamp(false);
    setCurrentFormIndex((prev) => prev + 1);
    setCurrentContentIndex((prev) => prev + 1);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
        {!isExiting && (
          <motion.div
            key={currentFormIndex}
            className="absolute inset-0 flex items-center justify-center"
            initial={{
              x: '100vw',
              rotate: entryRotation,
              opacity: 0,
            }}
            animate={{
              x: 0,
              rotate: 0,
              opacity: 1,
            }}
            exit={{
              x: '-100vw',
              rotate: -entryRotation,
              opacity: 0,
            }}
            transition={{
              type: 'spring',
              stiffness: config.springStiffness,
              damping: config.springDamping,
              duration: config.entryDuration / 1000,
            }}
          >
            <div className="relative w-[600px] h-[800px] max-w-full max-h-full">
              <FormCanvas
                template={currentTemplate}
                content={currentContent}
                backgroundImage={backgroundImage}
                stampField={stampField}
                onStampClick={handleStampClick}
                showStampField={showDebug}
              />

              {/* Stamp overlays - can have multiple */}
              {stamps.map((stamp, index) => (
                <StampOverlay key={index} stamp={stamp} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
