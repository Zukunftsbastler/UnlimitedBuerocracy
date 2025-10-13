# Noch fehlende Features für Form Stamping System

## Status: Vorbereitet, aber nicht vollständig implementiert

Die folgenden Features sind architektonisch vorbereitet, erfordern aber noch Backend/Worker-Integration:

### 1. OP-Penalty für fehlgeschlagene Stempel ✅ Teilweise

**Was bereits implementiert ist:**
- `PENALTY_FAILED_STAMP` Message-Type in contracts hinzugefügt
- `onFailedStamp` Callback in FormManager implementiert
- Callback wird bei jedem Fehlschlag korrekt aufgerufen
- Parameter `wasFumbled` wird übergeben

**Was noch fehlt:**
Im Worker (`apps/web/src/workers/game.worker.ts`) muss der Message-Handler hinzugefügt werden:

```typescript
case 'PENALTY_FAILED_STAMP': {
  // -1 OP für jeden fehlgeschlagenen Stempel
  zustand.ressourcen.OP = Math.max(0, zustand.ressourcen.OP - 1);
  
  // Wenn durch Fumble (niedrige Konzentration), zusätzlich Konzentration weiter senken
  if (msg.wasFumbled) {
    zustand.zustaende.konzentration = Math.max(0, zustand.zustaende.konzentration - 0.05);
  }
  break;
}
```

**Integration in RunScreen:**
```typescript
onFailedStamp={(wasFumbled: boolean) => {
  if (!worker) return;
  const msg: UiToWorkerMessage = {
    type: 'PENALTY_FAILED_STAMP',
    wasFumbled,
  };
  worker.postMessage(msg);
}}
```

### 2. Konzentrations-Blinken bei Fumbles ⏳ Nicht implementiert

**Benötigt:**
1. State in RunScreen für Blink-Trigger
2. Übergabe an VitalBar-Komponente
3. CSS-Animation

**Implementierung:**

In RunScreen:
```typescript
const [concentrationBlink, setConcentrationBlink] = useState(false);

onFailedStamp={(wasFumbled: boolean) => {
  // ... worker message ...
  
  if (wasFumbled) {
    // Trigger concentration blink
    setConcentrationBlink(true);
    setTimeout(() => setConcentrationBlink(false), 1500); // 3x blink à 500ms
  }
}}
```

VitalBar Props erweitern:
```typescript
interface VitalBarProps {
  label: string;
  value: number;
  color: 'blue' | 'purple' | 'green' | 'yellow' | 'red';
  inverted?: boolean;
  shouldBlink?: boolean; // NEU
}
```

VitalBar CSS:
```typescript
<div className={`w-full bg-gray-200 rounded-full h-2 ${shouldBlink ? 'animate-pulse-fast' : ''}`}>
```

Tailwind config (`tailwind.config.js`):
```javascript
theme: {
  extend: {
    animation: {
      'pulse-fast': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) 3',
    }
  }
}
```

### 3. Kritische Vital-States Blinken ⏳ Nicht implementiert

**Benötigt:**
Automatisches Blinken wenn:
- Energie < 10%
- Konzentration < 10%
- Motivation < 10%
- Verwirrung > 90%
- Überlastung > 90%

**Implementierung:**

VitalBar erweitern:
```typescript
function VitalBar({
  label,
  value,
  color,
  inverted = false,
  shouldBlink: manualBlink = false,
}: {
  label: string;
  value: number;
  color: 'blue' | 'purple' | 'green' | 'yellow' | 'red';
  inverted?: boolean;
  shouldBlink?: boolean;
}) {
  // Auto-blink für kritische Werte
  const isCritical = inverted ? value > 0.9 : value < 0.1;
  const shouldBlink = manualBlink || isCritical;
  
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className={`text-gray-600 ${shouldBlink ? 'font-bold text-red-600' : ''}`}>
          {label}
        </span>
        <span className={`font-mono text-gray-900 ${shouldBlink ? 'text-red-600' : ''}`}>
          {(value * 100).toFixed(0)}%
        </span>
      </div>
      <div className={`w-full bg-gray-200 rounded-full h-2 ${shouldBlink ? 'animate-pulse-fast' : ''}`}>
        <div
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}
```

## Zusammenfassung

- ✅ **Architecture**: Vollständig vorbereitet
- ✅ **Feature 1 (OP Penalty)**: **IMPLEMENTIERT!** 
  - Message-Type hinzugefügt
  - Worker-Handler implementiert (-1 OP pro Fehlschlag, -5% Konzentration bei Fumble)
  - Komplette Kette verdrahtet: FormManager → RunScreen → App → Worker
- ⏳ **Feature 2 (Concentration Blink)**: Nicht implementiert - UI-State und Animation fehlen
- ⏳ **Feature 3 (Critical Blink)**: Nicht implementiert - Logik in VitalBar fehlt

**Status:** Haupt-Features implementiert! Visuelle Feedback-Features (Blinken) optional für spätere Iteration.

**Verbleibender Aufwand für optionale visuelles Feedback:**
- Feature 2: 15 Minuten
- Feature 3: 10 Minuten
**Total: ~25 Minuten**
