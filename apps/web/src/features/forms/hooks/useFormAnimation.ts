import { useState, useEffect } from 'react';
import type { FormAnimationConfig } from '../types';

interface UseFormAnimationProps {
  config: FormAnimationConfig;
  isExiting: boolean;
  onExitComplete?: () => void;
}

interface AnimationState {
  isVisible: boolean;
  isEntering: boolean;
  isExiting: boolean;
}

/**
 * Hook to manage form entry and exit animations
 * Handles timing for smooth transitions between forms
 */
export const useFormAnimation = ({
  config,
  isExiting,
  onExitComplete,
}: UseFormAnimationProps): AnimationState => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    // Start entry animation after delay
    const entryTimeout = setTimeout(() => {
      setIsVisible(true);
      setIsEntering(false);
    }, config.entryDelay);

    return () => clearTimeout(entryTimeout);
  }, [config.entryDelay]);

  useEffect(() => {
    if (isExiting) {
      // Start exit animation
      const exitTimeout = setTimeout(() => {
        setIsVisible(false);
        if (onExitComplete) {
          setTimeout(onExitComplete, config.exitDuration);
        }
      }, config.displayDuration);

      return () => clearTimeout(exitTimeout);
    }
  }, [isExiting, config.displayDuration, config.exitDuration, onExitComplete]);

  return {
    isVisible,
    isEntering,
    isExiting,
  };
};

/**
 * Generate random entry rotation for natural feel
 */
export const getRandomEntryRotation = (): number => {
  return Math.random() * 30 - 15; // -15 to +15 degrees
};

/**
 * Calculate distance between two normalized points (0-1)
 */
export const calculateDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Check if click is within stamp field
 */
export const isClickInStampField = (
  clickX: number,
  clickY: number,
  stampFieldX: number,
  stampFieldY: number,
  stampFieldRadius: number
): boolean => {
  const distance = calculateDistance(clickX, clickY, stampFieldX, stampFieldY);
  return distance <= stampFieldRadius;
};
