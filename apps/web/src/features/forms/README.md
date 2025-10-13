# Form Stamping System

A kafkaesque, satirical form stamping mini-game for **Bürokratie der Unendlichkeit**.

## Overview

The Form Stamping System implements an interactive, animated bureaucratic form processing experience where players must accurately stamp forms to approve them. Forms fly in and out with physics-based animations, and stamping accuracy is affected by the player's concentration level.

## Features

### 🎯 Core Gameplay
- **Dynamic Form Generation**: Random form templates with unique layouts
- **Stamp Accuracy System**: Success depends on hitting the designated stamp field
- **Concentration Mechanics**: Low concentration causes smudges and missed stamps
- **Visual Feedback**: Different stamp types (approved, failed, coffee stains)
- **Retry on Failure**: Missed stamps allow for multiple attempts

### 🎨 Visual Design
- **Animated Entries/Exits**: Forms fly in and out with spring physics
- **Random Rotations**: Each form appears at a unique angle (-15° to +15°)
- **Dynamic Text Overlay**: Satirical bureaucratic texts rendered on form backgrounds
- **Transparent Stamps**: Realistic stamp visuals with rotation and opacity
- **Debug Mode**: Optional visualization of stamp field boundaries

### 🎭 Content System
- **9 Form Backgrounds**: Varied form designs from `form_canvas01.png` to `form_canvas09.png`
- **30 Satirical Texts**: Kafkaesque form content from `form_texts.json`
- **10 Approval Stamps**: Different approval stamp designs
- **5 Smudge Variants**: Failed stamp visualizations
- **1 Coffee Stain**: Special miss indicator

## Architecture

```
apps/web/src/features/forms/
├── components/
│   ├── FormCanvas.tsx         # Renders form with text overlay
│   ├── StampOverlay.tsx       # Displays stamps/smudges
│   └── FormManager.tsx        # Orchestrates the entire system
├── hooks/
│   └── useFormAnimation.ts    # Animation timing & calculations
├── data/
│   └── formTemplates.json     # Form layout configurations
├── types.ts                   # TypeScript interfaces
├── index.ts                   # Public API exports
├── FormStampingDemo.tsx       # Standalone demo component
└── README.md                  # This file
```

## Usage

### Basic Integration

```tsx
import { FormManager } from './features/forms';
import formTemplates from './features/forms/data/formTemplates.json';
import formTexts from './data/form_texts.json';

function MyComponent() {
  const handleStamp = (result: StampResult) => {
    console.log('Stamp result:', result);
    // Update game state, score, etc.
  };

  return (
    <FormManager
      templates={formTemplates as FormTemplate[]}
      contents={formTexts as FormContent[]}
      onStamp={handleStamp}
      concentration={0.8}  // 0-1, affects stamp quality
      showDebug={false}    // Show stamp field boundaries
    />
  );
}
```

### Demo Mode

To test the system standalone:

```tsx
import { FormStampingDemo } from './features/forms/FormStampingDemo';

function App() {
  return <FormStampingDemo />;
}
```

## API Reference

### FormManager Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `templates` | `FormTemplate[]` | Yes | - | Array of form layout configurations |
| `contents` | `FormContent[]` | Yes | - | Array of form text content |
| `onStamp` | `(result: StampResult) => void` | No | - | Callback when form is stamped |
| `concentration` | `number` | No | `1.0` | Player concentration (0-1) |
| `showDebug` | `boolean` | No | `false` | Show stamp field boundaries |
| `animationConfig` | `Partial<FormAnimationConfig>` | No | - | Override animation settings |

### StampResult Interface

```typescript
interface StampResult {
  success: boolean;        // True if clicked within stamp field
  accuracy: number;        // 0-1, distance from center
  position: { x: number; y: number };  // Normalized click position
  type: 'approved' | 'failed' | 'special';  // Stamp type
}
```

### FormTemplate Interface

```typescript
interface FormTemplate {
  id: string;
  rotation: number;           // Initial rotation in degrees
  textFields: TextField[];    // Text field positions
  stampFieldRadius?: number;  // Stamp field size (default: 0.12)
}
```

### FormContent Interface

```typescript
interface FormContent {
  title: string;  // Form title
  text: string;   // Form body text
}
```

## Customization

### Animation Configuration

Customize timing and physics:

```tsx
<FormManager
  {...props}
  animationConfig={{
    entryDuration: 1000,      // Entry animation duration (ms)
    exitDuration: 800,        // Exit animation duration (ms)
    displayDuration: 600,     // Time after stamp before exit (ms)
    springStiffness: 80,      // Spring physics stiffness
    springDamping: 20,        // Spring physics damping
  }}
/>
```

### Adding New Form Templates

Edit `apps/web/src/features/forms/data/formTemplates.json`:

```json
{
  "id": "form_custom",
  "rotation": -4,
  "textFields": [
    {
      "id": "title",
      "x": 0.15,
      "y": 0.12,
      "width": 0.7,
      "height": 0.08,
      "fontSize": 1.2,
      "align": "center"
    },
    {
      "id": "body",
      "x": 0.15,
      "y": 0.25,
      "width": 0.7,
      "height": 0.5,
      "align": "left"
    }
  ],
  "stampFieldRadius": 0.13
}
```

### Adding New Form Content

Edit `apps/web/src/data/form_texts.json`:

```json
{
  "title": "Ihre satirische Überschrift",
  "text": "Ihr kafkaesker Formulartext..."
}
```

## Game Integration

### Connecting to Vital Parameters

```tsx
function GameIntegration() {
  const concentration = useGameState(state => state.concentration);
  const energy = useGameState(state => state.energy);
  
  const handleStamp = (result: StampResult) => {
    if (result.success) {
      // Reward player
      addOrdnungspunkte(10);
      if (result.accuracy > 0.8) {
        addBonus('perfect_stamp');
      }
    } else {
      // Penalty for failure
      reduceConcentration(0.1);
    }
  };

  return (
    <FormManager
      {...formData}
      concentration={concentration}
      onStamp={handleStamp}
    />
  );
}
```

### Audio Integration

```tsx
import { AudioService } from '../../services/audio/AudioService';

function IntegratedFormManager() {
  const audio = AudioService.getInstance();
  
  const handleStamp = (result: StampResult) => {
    if (result.success) {
      audio.playSFX('stamp_success');
    } else if (result.type === 'failed') {
      audio.playSFX('stamp_smudge');
    } else {
      audio.playSFX('stamp_miss');
    }
  };

  return <FormManager onStamp={handleStamp} {...props} />;
}
```

## Performance Considerations

- **Image Optimization**: All stamps and forms use optimized PNG files
- **Animation Performance**: Uses Framer Motion with GPU-accelerated transforms
- **Memory Management**: Images are imported as modules, cached by browser
- **Responsive Design**: Normalized coordinates scale to any screen size

## Testing

Run the demo mode to test all features:

```bash
pnpm run dev
# Navigate to the FormStampingDemo component
```

Test checklist:
- [ ] Forms fly in with rotation
- [ ] Text renders correctly on forms
- [ ] Stamp field is clickable
- [ ] Successful stamps show approval stamp
- [ ] Missed stamps show coffee stain
- [ ] Low concentration shows smudges
- [ ] Forms exit after successful stamp
- [ ] Failed stamps allow retry
- [ ] Multiple forms cycle correctly

## Future Enhancements

- [ ] Sound effects integration
- [ ] Particle effects on stamp
- [ ] Combo system for consecutive successes
- [ ] Time pressure mechanics
- [ ] Special event forms
- [ ] Achievement tracking
- [ ] Form pile visualization
- [ ] Multi-page forms

## License

Part of **Bürokratie der Unendlichkeit** game project.

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-13  
**Maintainer**: Game Development Team
