import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FlyingForm } from './FlyingForm';

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

interface FlyingFormData {
  id: number;
  formImage: string;
}

interface FlyingFormsContainerProps {
  automationTicks?: number; // Increments when automation generates AP
}

/**
 * FlyingFormsContainer - Manages multiple flying forms
 * Spawns a new flying form each time automationTicks increments
 */
export const FlyingFormsContainer: React.FC<FlyingFormsContainerProps> = ({
  automationTicks = 0,
}) => {
  const [flyingForms, setFlyingForms] = useState<FlyingFormData[]>([]);
  const nextIdRef = useRef(0);
  const previousTicksRef = useRef(automationTicks);

  // When automationTicks changes, spawn a new flying form
  useEffect(() => {
    if (automationTicks > previousTicksRef.current) {
      const tickDiff = automationTicks - previousTicksRef.current;
      
      // Spawn one form per tick (could be multiple if many automations fired)
      for (let i = 0; i < tickDiff; i++) {
        const randomFormImage = FORM_BACKGROUNDS[
          Math.floor(Math.random() * FORM_BACKGROUNDS.length)
        ];
        
        const newForm: FlyingFormData = {
          id: nextIdRef.current++,
          formImage: randomFormImage,
        };
        
        setFlyingForms((prev) => [...prev, newForm]);
      }
    }
    
    previousTicksRef.current = automationTicks;
  }, [automationTicks]);

  const handleFormComplete = useCallback((id: number) => {
    setFlyingForms((prev) => prev.filter((form) => form.id !== id));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
      {flyingForms.map((form) => (
        <FlyingForm
          key={form.id}
          formImage={form.formImage}
          onComplete={() => handleFormComplete(form.id)}
        />
      ))}
    </div>
  );
};
