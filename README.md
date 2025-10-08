# Bürokratie der Unendlichkeit

Ein kafkaeskes Incremental-Game über Verwaltung, Selbstauflösung und die Unendlichkeit der Bürokratie.

## 🎮 Über das Spiel

**Bürokratie der Unendlichkeit** ist ein satirisches Idle/Incremental-Game, das den absurden Alltag in einer kafkaesken Verwaltung simuliert. Sammeln Sie Aktenpunkte, kaufen Sie Automatisierungen, überleben Sie Audits und steigen Sie auf durch permanente Meta-Upgrades.

### Genre
- Incremental / Idle Game
- Clicker-Mechanik
- Meta-Progression
- Kafkaesk-satirisch

### Spielzeit
- **Pro Run**: 5-15 Minuten
- **Bis Max-Level**: 10-20 Stunden
- **100% Completion**: 20-30 Stunden

## 🚀 Quick Start

### Installation

```bash
# Repository klonen
git clone <repository-url>
cd InfiniteBuerocracy

# Dependencies installieren
pnpm install

# Development Server starten
pnpm dev

# Build für Production
pnpm build
```

### Technologien

- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **State**: Zustand / Context API
- **Database**: Dexie.js (IndexedDB)
- **Styling**: TailwindCSS + ShadCN/UI
- **Worker**: Web Workers für Simulation
- **Audio**: Web Audio API

## 📁 Projekt-Struktur

```
InfiniteBuerocracy/
├── apps/
│   └── web/                    # Haupt-App
│       ├── src/
│       │   ├── app/           # App-Komponente
│       │   ├── features/      # Feature-Module
│       │   │   ├── run/       # Run-Screen
│       │   │   ├── meta/      # Meta-Progression
│       │   │   └── stats/     # Statistiken
│       │   ├── services/      # Business Logic
│       │   │   ├── audio/     # AudioService
│       │   │   ├── ContentService.ts
│       │   │   ├── EventScheduler.ts
│       │   │   └── MetaUpgradeService.ts
│       │   ├── workers/       # Web Workers
│       │   ├── data/          # Dexie DB
│       │   └── config/        # JSON Configs
│       ├── index.html
│       └── vite.config.ts
├── packages/
│   ├── game-core/             # Simulation Engine
│   │   ├── contracts/         # TypeScript Interfaces
│   │   └── sim/              # Simulation Logic
│   ├── game-design/           # Design-Docs
│   │   └── docs/
│   │       ├── architecture/
│   │       ├── balancing/
│   │       ├── content/
│   │       ├── events/
│   │       ├── progression/
│   │       └── ui_ux/
│   └── content-packs/         # Content (JSON)
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## 🎯 Features

### ✅ Vollständig Implementiert

#### Core Gameplay
- 🖱️ **Klick-Mechanik**: Sammle Aktenpunkte durch Klicken
- ⚙️ **6 Automatisierungen**: Passive AP-Generierung
- ⚡ **6 Power-Ups**: Temporäre Buffs
- 📊 **Vitalzustände**: Energie, Konzentration, Motivation, Verwirrung, Überlastung
- 🎲 **Ordnung & Aufwand**: Balance-Mechanik
- ⏱️ **Arbeitstag-System**: 15 Realminuten = 480 Spielminuten

#### Meta-Progression
- 💜 **VP-System**: Verwaltungspunkte als Meta-Währung
- 📈 **8 Upgrades**: Permanente Boni
  - Routinierte Hand (Klick +50%)
  - Belastbarkeit (Energie +30%)
  - Fokus-Training (Drift -58%)
  - Beschaffungskontakte (Kosten -27%)
  - Aktenhaufen (Start +5 AP)
  - Prozessoptimierung (DPS +75%)
  - Innere Ruhe (Motivation stabil)
  - Chaosresistenz (Aufwand -49%)
- 🔄 **Mehrfach-Kauf**: Upgrades bis Max-Stufe
- 💾 **Persistenz**: IndexedDB-Speicherung

#### UI/UX
- 📑 **3-Tab-Navigation**: Run / Meta / Stats
- 🎭 **Run-Ende-Modal**: Detaillierte Zusammenfassung
- 📊 **Stats-Screen**: Run-Historie (50 Runs)
- 🏆 **Rekorde**: Beste VP, Meiste Klicks
- ⌨️ **Keyboard**: Leertaste für Klicken
- 🎨 **Visual Feedback**: Farb-Shifts, Animationen
- 📱 **Responsive**: Mobile-freundlich

#### Technical
- ⚡ **Web Worker**: 30Hz Simulation
- 💾 **Dexie DB**: IndexedDB-Wrapper
- 🎵 **Audio System**: 4-Layer Architecture
- 🔧 **TypeScript**: 100% Type-Safe
- ♻️ **Modular**: Clean Architecture

### 🔜 Geplant (Optional)

- 🎭 **Event-System**: Audits, Störungen, Beförderungen
- 📚 **Content-Packs**: Dynamisches Text-Loading
- 🏅 **Achievements**: Meilensteine & Badges
- 📈 **Charts**: Visuelle Statistiken
- 🎵 **Audio-Files**: Echte Sound-Effekte
- ✨ **Partikel**: Click-Feedback-Animationen

## 🎮 Gameplay-Guide

### Erste Schritte

1. **Run starten**: Klicken Sie auf "Arbeitstag beginnen"
2. **Klicken**: Sammeln Sie Aktenpunkte (AP)
3. **Automatisieren**: Kaufen Sie erste Automatisierung bei 10 AP
4. **Power-Ups**: Nutzen Sie Buffs bei Bedarf
5. **Run beenden**: Nach 15 Minuten oder manuell

### Ressourcen

| Ressource | Beschreibung | Verwendung |
|-----------|--------------|------------|
| **AP** | Aktenpunkte | Währung im Run, kaufe Automatisierungen |
| **OE** | Ordnungseinheiten | Run-Fortschritt, aus AP konvertiert |
| **VP** | Verwaltungspunkte | Meta-Währung, kaufe permanente Upgrades |

### Vitalzustände

- **Energie**: Sinkt beim Klicken, limitiert Aktivität
- **Konzentration**: Driftet ab, beeinflusst Effizienz
- **Motivation**: Schwankt, beeinflusst Moral
- **Verwirrung**: Steigt mit Chaos, reduziert Output
- **Überlastung**: Aggregat, führt zu Run-Ende

### Meta-Progression

1. **Run beenden** → VP verdienen
2. **Meta-Tab öffnen** → Upgrades sehen
3. **Upgrade kaufen** → VP ausgeben
4. **Neuer Run** → Mit Boni spielen
5. **Repeat** → Immer stärker werden

### Strategien

#### Klick-Build
- Fokus auf "Routinierte Hand"
- Häufiges Klicken
- Energie-Management wichtig

#### Idle-Build
- Fokus auf "Prozessoptimierung"
- Viele Automatisierungen
- Weniger Klicken nötig

#### Hybrid-Build
- Balance zwischen beiden
- Flexibel & effizient
- Empfohlen für Anfänger

## 🏗️ Architektur

### Simulation-Engine

```typescript
// Worker-basierte Simulation (30Hz)
updateSimulation(state, deltaMs, config, rng)
  → updateEnergy()
  → updateConcentration()
  → updateMotivation()
  → updateAutomation()
  → updateAufwand()
  → checkRunEnd()
```

### Datenfluss

```
User Action
  ↓
UI (React)
  ↓
Worker Message
  ↓
Simulation Update (30Hz)
  ↓
Snapshot (10Hz)
  ↓
UI Update
```

### Persistenz-Schema

```typescript
// Dexie Tables
saves:        { id, metaZustand, version }
runstats:     { id, runId, vpVerdient, klicks, ... }
einstellungen: { id, schluessel, wert }
contentPacks: { id, sprache, aktiviert }
contentDocs:  { id, packId, text, ... }
akten:        { id, aktenzeichen, status, ... }
```

## 🧪 Testing

```bash
# Unit Tests
pnpm test

# E2E Tests (geplant)
pnpm test:e2e

# Type Check
pnpm type-check

# Linting
pnpm lint
```

## 📊 Performance

- **FPS**: 60 (UI), 30 (Simulation)
- **Memory**: ~50-100 MB
- **Bundle Size**: ~500 KB (gzipped)
- **Startup**: < 1s
- **Save/Load**: < 100ms

## 🎨 Design-Philosophie

### Kafkaesk & Satirisch
- Absurde Bürokratie
- Selbstironischer Humor
- Präzise, technokratische Sprache
- Endlosigkeit als Spielprinzip

### Minimalistisch
- Wenig Farbe (Grau-Töne)
- Klare Hierarchie
- Funktional über dekorativ
- Dezente Animationen

### User-Friendly
- Intuitive Navigation
- Klares Feedback
- Keine versteckten Mechaniken
- Hilfetexte wo nötig

## 🛠️ Development

### Setup

```bash
# Install
pnpm install

# Dev Server
pnpm dev

# Build
pnpm build

# Preview Build
pnpm preview
```

### Scripts

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "format": "prettier --write ."
}
```

### Adding Features

1. **New Feature**: `apps/web/src/features/myFeature/`
2. **New Service**: `apps/web/src/services/MyService.ts`
3. **New Config**: `apps/web/src/config/myConfig.json`
4. **Update Contracts**: `packages/game-core/src/contracts/`

## 📝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Style

- **TypeScript**: Strict mode
- **Formatting**: Prettier
- **Linting**: ESLint
- **Commits**: Conventional Commits

## 📄 License

MIT License - see LICENSE file for details

## 👥 Credits

### Development
- **Game Design**: Based on Kafkaesque themes
- **Implementation**: Full-stack TypeScript
- **Architecture**: Modular, scalable design

### Inspiration
- Kafka's "Das Schloss"
- Incremental game classics
- Administrative absurdism

## 🐛 Known Issues

- Audio-Files sind Stubs (keine echten Sounds)
- Event-System noch nicht getriggert
- Content-Packs noch nicht geladen
- Mobile-Performance nicht optimiert

## 🔮 Roadmap

### v1.1
- Event-System aktivieren
- Content-Packs laden
- Audio-Files hinzufügen

### v1.2
- Achievements-System
- Statistik-Charts
- Export/Import von Saves

### v2.0
- Multi-language Support
- Steam-Integration (optional)
- Cloud-Saves

## 📧 Contact

For questions, feedback, or bug reports, please open an issue on GitHub.

---

**"Alle Angaben ohne Gewähr. Keine Haftung für Produktivitätsverlust."**

Version 1.0.0 • Prototype • 2025
