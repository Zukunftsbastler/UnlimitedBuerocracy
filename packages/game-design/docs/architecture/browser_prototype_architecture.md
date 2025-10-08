# Bürokratie der Unendlichkeit – Systemarchitektur für den Browser‑Prototyp (v2)

> Version: v2.0
> Ablagepfad: `packages/game-design/docs/architecture/browser_prototype_architecture.md`

---

## Ziel

Eine modular aufgebaute, wartbare und parallel entwickelbare Architektur für einen Browser‑Prototypen auf Basis von **React + TypeScript + Canvas** mit **IndexedDB (Dexie)** für Persistenz.
Sie bildet die aktuellen Spielkonzepte ab: **Arbeitstag‑Runs**, **Verwaltungspunkte (VP)**, **Beförderungen (Prestige)**, **Fortbildungsakte (Skilltree)**, **Akten mit Aktenzeichen**, **Zustände** (Energie, Konzentration, Motivation, Verwirrung, Überlastung) und eine **inhaltsgetriebene Text‑Datenbank** für sarkastische Kurztexte.

---

## Technologiestack

* **React + TypeScript** (UI)
* **Canvas 2D** für Spiel‑Visualisierung; optional Adapter auf PixiJS später
* **Web Worker** für die Simulation (Tick, Systeme) – UI bleibt flüssig
* **IndexedDB via Dexie** für Saves, Statistiken, Content‑Packs, Einstellungen
* **Vite** (Build), **ESLint/Prettier**, **Vitest/Playwright** (Tests)
* **TailwindCSS** (Layout/Theme), **i18next** (optional, später)

---

## Verzeichnisstruktur

```
apps/
  web/
    src/
      app/                      # App-Shell, Routing, Layout
      ui/                       # React-Komponenten (Screens, Panels)
      render/                   # Canvas-Renderer, Effekte, Assets
      features/
        run/                    # Arbeitstag-Run: Orchestrierung, Facade
        prestige/               # Beförderungen, Titel, Rechte
        fortbildung/            # Skilltree (Fortbildungsakte)
        akten/                  # Aktenobjekte, Aktenzeichen-Logik
        content/                # ContentService, Auswahl-Logik
        stats/                  # Statistiken & Auswertungen
      engine/                   # ECS, Systeme, Event-Bus, RNG
      data/                     # Dexie-DB, Repositories, Migrationen
      services/                 # Zeit, Telemetrie, Feature-Flags
      workers/
        game.worker.ts          # Simulation im Worker
      shared/                   # Typen, Konstanten, Utils
    index.html
    main.tsx
packages/
  ui-kit/                       # Wiederverwendbare UI-Bausteine
  content-packs/                # Versionierte Inhalts-Pakete (JSON/YAML)
```

**Leitlinien**

* Strikte Modulgrenzen; die UI spricht mit der Engine nur über eine schmale Facade (postMessage + DTOs)
* Datengetriebene Regeln: Balancing, Texte und Kurven in Dateien, Hot‑Reload im Dev
* Deterministischer Zufall pro Run (Seed) für Reproduzierbarkeit
* Versionierung für DB‑Schema und Content‑Packs mit Migrationen

---

## Laufzeitfluss

1. App‑Shell lädt Einstellungen, Savegame, aktivierte Content‑Packs.
2. Worker startet Engine (ECS), registriert Systeme und Subscriptions.
3. Tick im Worker (z. B. 30–60 Hz intern); Snapshots an die UI (z. B. 10 Hz).
4. Eingaben (Maus/Tastatur) gehen als Events an den Worker.
5. Systeme aktualisieren Ressourcen und Zustände; Hooks wählen passende Texte.
6. Periodische Persistenz (debounced) in Dexie; Flush am Run‑Ende.

---

## Engine (ECS) – Komponenten (Auszug)

* `Klickbar` { grundErtrag, kritWahrscheinlichkeit, kritMultiplikator, abklingMs }
* `Automatisierung` { rateProSek, effizienz, aufwandFaktor }
* `Ressourcen` (AP, OE, VP, Aufwand) { menge, max? }
* `Arbeitstag` { verbleibendeMin, vergangenMin }
* `Zustaende` { energie, konzentration, motivation, verwirrung, ueberlastung }
* `OrdnungAufwand` { klarheit, aufwand, gleichgewichtsbereich }
* `Akte` { aktenzeichen, sachgebiet, prioritaet, status }
* `PowerUp` { art, restMs, modifikatoren }
* `Fortbildungsflag` { freigeschaltet: string[] }
* `Visuell` { farbton, intensitaet, wobble }

> AP = Aktenpunkte (laufender Fortschritt im Run), OE = Ordnungseinheiten, VP = Verwaltungspunkte (Meta), Aufwand = Verwaltungsaufwand.

---

## Engine – Systeme

* **EingabeSystem** – verarbeitet Klicks/Tasten, prüft Abklingzeiten
* **AutomatisierungSystem** – erzeugt fortlaufend AP/Dokumente
* **VerarbeitungSystem** – wandelt AP→OE um; trägt zu VP‑Multiplikator bei
* **AufwandSystem** – erhöht Verwaltungsaufwand (Überproduktion/Komplexität); Gegenmaßnahmen anwenden
* **ZustandsSystem** – Energie/Konzentration/Motivation dynamisch; Müdigkeit, Verwirrung
* **ArbeitstagSystem** – reduziert verbleibende Arbeitszeit; beendet Run bei Zeitablauf
* **OrdnungAufwandSystem** – prüft Gleichgewicht; bricht bei Kollaps ab
* **PowerUpSystem** – startet/endet Buffs
* **AktenSystem** – vergibt Aktenzeichen, archiviert, erzeugt VP‑Boni
* **FortbildungHookSystem** – wendet Skill‑Effekte an
* **PrestigeHookSystem** – Rechte/Boni durch Dienstrang (z. B. kleiner Dienstweg)
* **ContentHookSystem** – liefert Kontext an ContentService für Textauswahl
* **PersistenzSystem** – speichert regelmäßig; sichert Runs & Historie
* **StatistikSystem** – sammelt Metriken (Run‑Dauer, Fehlerquote, DpS, VP, usw.)

Alle Systeme sind zustandslos und deterministisch (gegeben Seed + Eingaben).

---

## Ressourcen und Begriffe

* **AP – Aktenpunkte**: unmittelbarer Output durch Klicks/Automatisierung
* **OE – Ordnungseinheiten**: Maß für Prozessklarheit im Run
* **Aufwand – Verwaltungsaufwand**: Gegenkraft; zu hoch → Kollaps
* **VP – Verwaltungspunkte**: Meta‑Währung für Beförderungen und Fortbildungen

---

## Zustände

Numerische Skala 0..1 (oder 0..100), mit Kurven in `config/balancing.json`:

* **Energie**: sinkt pro Aktion und Zeit; Regeneration über Pausen/Power‑Ups
* **Konzentration**: sinkt bei Monotonie; neue Aufgaben heben sie an
* **Motivation**: beeinflusst durch Fortschritt, Boni, Musiklautstärke (Option)
* **Verwirrung**: steigt bei gleichzeitigen Prozessen und hoher Komplexität
* **Überlastung**: Aggregat aus Aufwand + Müdigkeit + Komplexität

Run endet bei **Arbeitszeit 0** oder **Überlastung ≥ Schwelle**.

---

## UI – Screens

* **/arbeit** – Kernspiel (Canvas), Schnellzugriffe, Stats‑Overlay
* **/beförderung** – Rangaufstieg, Rechte, Zusammenfassung der Boni
* **/fortbildung** – Skilltree mit Kursnummern
* **/akten** – Aktenliste, Archiv, Aktenzeichen‑Suche
* **/statistik** – Run‑Historie, Diagramme, Heatmaps
* **/einstellungen** – Eingaben, Barrierefreiheit, Themen

**UI‑Bausteine**

* `StatsPanel`, `OrdnungAufwandLeiste`, `KlickFeld`, `AutomationListe`,
  `SkilltreeAnsicht`, `AktenTabelle`, `Lauftext` (für Kurztexte), `Toast`

---

## Nachrichten (UI ↔ Worker)

**UI → Worker**

```ts
{ type: 'BENUTZER_KLICK', zeit: number }
{ type: 'KAUF_AUTOMATISIERUNG', id: string }
{ type: 'KAUF_KURS', id: string }
{ type: 'AKTIVIERE_POWERUP', id: string }
{ type: 'RUN_STEUERUNG', cmd: 'START'|'ENDE'|'PAUSE' }
{ type: 'SNAPSHOT_ANFORDERN' }
```

**Worker → UI**

```ts
{ type: 'SNAPSHOT', payload: SpielSnapshot }
{ type: 'RUN_ENDE', grund: 'ZEIT'|'UEBERLASTUNG'|'KOLLAPS'|'BENUTZER', vp: number }
{ type: 'TEXT', eintrag: ContentDoc }
{ type: 'HINWEIS', stufe: 'info'|'warn'|'fehler', text: string }
```

**SpielSnapshot (kompakt)**

```ts
interface SpielSnapshot {
  zeit: number;
  ressourcen: { AP: number; OE: number; VP: number; Aufwand: number; };
  raten: { klickErtrag: number; dps: number; fehlerquote: number; };
  meter: { klarheit: number; aufwand: number; };
  arbeitstag: { verbleibendMin: number; vergangenMin: number };
  zustaende: { energie:number; konzentration:number; motivation:number; verwirrung:number; ueberlastung:number };
  automatisierungen: Array<{ id:string; stufe:number; output:number }>;
  powerups: Array<{ id:string; restMs:number }>;
  visuell: { farbton:number; intensitaet:number; wobble:number };
}
```

---

## Persistenz (Dexie)

**Tabellen**

* `saves` { id, erstelltAm, aktualisiertAm, runZustand, metaZustand, version }
* `runstats` { id, runId, metriken(json), dauerMs, erstelltAm }
* `einstellungen` { id, schluessel, wert }
* `contentPacks` { id, name, version, sprache, checksumme, aktiviert }
* `contentDocs` { id, packId, schluessel, tags[], seltenheit, trigger(json), text, sprache, gewicht, cooldownSek }
* `akten` { id, aktenzeichen, sachgebiet, prioritaet, status, bonusVp }

**Migrationen**: semantische Versionierung; Tests sichern Abwärtskompatibilität.

**Repository‑Schnittstellen**

```ts
interface SaveRepo { laden(): Promise<SaveGame|null>; speichern(d: SaveGame): Promise<void>; }
interface StatsRepo { hinzufuegen(e: RunStats): Promise<void>; abfragen(f): Promise<RunStats[]>; }
interface ContentRepo { nachTag(tag: string): Promise<ContentDoc[]>; zufall(ctx: ContentKontext): Promise<ContentDoc|null>; }
```

---

## Content‑Datenbank

Ziel: kurze, sarkastische, provokante Texte, die abhängig von **Kontext** eingeblendet werden und Abwechslung bieten.

**Schema – ContentDoc (JSON)**

```json
{
  "id": "az-hell-001",
  "packId": "core-de-v1",
  "sprache": "de",
  "schluessel": "dienstweg.hinweis",
  "text": "Bitte legen Sie für den kleinen Dienstweg einen großen Antrag vor.",
  "tags": ["satire","dienstweg","verfahren"],
  "seltenheit": "haeufig",
  "gewicht": 3,
  "cooldownSek": 90,
  "trigger": {
    "rangMin": 3,
    "klarheitMin": 0.4,
    "aufwandMax": 0.6,
    "laufzeitSekMin": 60,
    "praedikat": "klarheit>aufwand && dps>5"
  }
}
```

**Auswahlalgorithmus (vereinfacht)**

1. Filter nach aktivierten Packs und Sprache
2. Match über `trigger` gegen **ContentKontext**
3. Cooldowns und „zuletzt gezeigt“ berücksichtigen (LRU)
4. Gewichtete Auswahl nach Seltenheit/Gewicht

**ContentKontext (DTO)**

```ts
interface ContentKontext {
  rang: number;
  klarheit: number; // 0..1
  aufwand: number;  // 0..1
  laufzeitSek: number;
  kpm: number;      // Klicks pro Minute
  dps: number;      // Dokumente pro Sekunde
  meilensteine: string[];
}
```

---

## Balancing‑Konfiguration

`config/balancing.json`

```json
{
  "kosten": {
    "automatisierung": { "basis": 10, "wachstum": 1.15 },
    "kurse": { "basis": 5, "wachstum": 1.45 },
    "befoerderung": { "basis": 100, "wachstum": 1.8 }
  },
  "vpErtrag": { "minProRun": 1, "zeitFaktor": 0.002, "klarheitBonus": 1.1 },
  "aufwand": { "ueberproduktion": 0.006, "dämpfung": 0.4 },
  "zustand": {
    "energieVerbrauchProKlick": 0.002,
    "energieRegenProSek": 0.004,
    "konzentrationsDrift": 0.001
  }
}
```

---

## Rendering & Feedback

* Farbverlauf steuert **Klarheit vs. Aufwand** (Hue‑Shift, Sättigung)
* Partikel für Stempel/Klick, Papierstapel als Emittenten
* Screen‑Shake/Wobble bei Überlastung
* Performance: gebatchte Draw‑Calls, OffscreenCanvas (wenn verfügbar)

---

## Barrierefreiheit & Eingaben

* Maus: Primärklick; Tastatur: `Leertaste` (Klick), `1..9` (Power‑Ups), `A` (Automatisierung), `F` (Fortbildung)
* Red
