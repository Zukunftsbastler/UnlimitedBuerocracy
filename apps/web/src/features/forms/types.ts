/**
 * Form Stamping System Types
 * Defines interfaces for the bureaucratic form stamping gameplay
 */

export interface FormTemplate {
  id: string;
  rotation: number; // Initial rotation in degrees (-15 to +15)
  textFields: TextField[];
  stampFieldRadius?: number; // Optional radius for stamp field (default: 0.15)
}

export interface TextField {
  id: string;
  x: number; // Normalized position 0-1
  y: number; // Normalized position 0-1
  width: number; // Normalized width 0-1
  height: number; // Normalized height 0-1
  fontSize?: number; // Optional font size multiplier
  align?: 'left' | 'center' | 'right';
}

export interface StampField {
  x: number; // Normalized position 0-1
  y: number; // Normalized position 0-1
  radius: number; // Normalized radius
}

export interface FormContent {
  title: string;
  text: string;
}

export interface StampResult {
  success: boolean; // True if clicked within stamp field
  accuracy: number; // Distance from center (0-1, 0 = perfect)
  position: { x: number; y: number }; // Click position in normalized coords
  type: 'approved' | 'failed' | 'special'; // Type of stamp/smudge
}

export interface StampVisual {
  image: string; // Path to stamp/smudge image
  rotation: number; // Random rotation for visual variety
  x: number; // Position where stamp was placed
  y: number; // Position where stamp was placed
  scale?: number; // Optional scale factor
  opacity?: number; // Optional opacity (for low concentration)
}

export interface FormAnimationConfig {
  entryDuration: number; // ms
  exitDuration: number; // ms
  entryDelay: number; // ms
  displayDuration: number; // ms after stamp
  springStiffness: number;
  springDamping: number;
}

export interface FormState {
  template: FormTemplate;
  content: FormContent;
  backgroundImage: string;
  stampField: StampField;
  stamp: StampVisual | null;
  isExiting: boolean;
}
