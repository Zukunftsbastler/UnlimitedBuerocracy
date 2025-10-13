/**
 * Form Stamping System
 * Main entry point for the bureaucratic form stamping feature
 */

export { FormManager } from './components/FormManager';
export { FormCanvas } from './components/FormCanvas';
export { StampOverlay } from './components/StampOverlay';
export { FlyingFormsContainer } from './components/FlyingFormsContainer';
export { useFormAnimation, isClickInStampField, calculateDistance } from './hooks/useFormAnimation';

export type {
  FormTemplate,
  TextField,
  StampField,
  FormContent,
  StampResult,
  StampVisual,
  FormAnimationConfig,
  FormState,
} from './types';
