/**
 * Bürokratie der Unendlichkeit – TypeScript Contracts
 * 
 * Zentrale Typdefinitionen für die gesamte Anwendung.
 * Diese Datei definiert die Schnittstellen zwischen UI, Worker und Datenbank.
 */

// ============================================================================
// GRUNDTYPEN & RESSOURCEN
// ============================================================================

export type Ressource = 'AP' | 'OE' | 'VP' | 'Aufwand';

/**
 * Spielressourcen während eines Runs
 */
export interface Ressourcen {
  AP: number;      // Aktenpunkte (laufend im Run)
  OP: number;      // Ordnungspunkte (temporäre Disziplin, 0..100)
  VP: number;      // Verwaltungspunkte (Meta-Währung)
  Aufwand: number; // Verwaltungsaufwand (Gegenkraft, 0..1)
}

/**
 * Content-Pack (Collection von Docs)
 */
export interface ContentPack {
  id: string;
  version: string;
  sprache: string;
  inhalt: ContentDoc[];
}

/**
 * Power-Up Definition
 */
export interface PowerUp {
  id: string;
  name: string;
  beschreibung: string;
  typ: 'buff' | 'debuff';
  kategorie: 'kaffee' | 'prozess' | 'seilschaft' | 'papier' | 'privileg';
  dauerSek: number;
  cooldownSek: number;
  kosten?: number;           // Falls kaufbar
  effekte: EventEffekt[];
  stackable?: boolean;
  icon?: string;
}

/**
 * Berechnete Raten für UI-Anzeige
 */
export interface Raten {
  klickErtrag: number;  // AP pro Klick (nach Modifikatoren)
  dps: number;          // Dokumente pro Sekunde (Idle-Output)
  fehlerquote: number;  // 0..1
}

/**
 * Ordnung/Aufwand-Meter
 */
export interface Meter {
  klarheit: number;  // 0..1 - Maß für Ordnung
  aufwand: number;   // 0..1 - Maß für Chaos
}

/**
 * Arbeitstag-Zeitinformationen
 */
export interface ArbeitstagInfo {
  verbleibendMin: number;
  vergangenMin: number;
}

/**
 * Vitalzustände des Spielers
 */
export interface Zustaende {
  energie: number;       // 0..1
  konzentration: number; // 0..1
  motivation: number;    // 0..1
  verwirrung: number;    // 0..1
  ueberlastung: number;  // 0..1 (Aggregat aus anderen Zuständen)
}

/**
 * Snapshot einer Automatisierung für UI
 */
export interface AutomationSnapshot {
  id: string;
  stufe: number;
  output: number;  // aktueller AP/s-Beitrag
  kosten: number;  // Kosten für nächste Stufe
}

/**
 * Snapshot eines aktiven Power-Ups
 */
export interface PowerupSnapshot {
  id: string;
  name: string;
  restMs: number;
  restSekunden: number; // Für UI-Anzeige
}

/**
 * Visuelle Feedback-Parameter
 */
export interface VisualSnapshot {
  farbton: number;      // hue in degrees (0-360)
  intensitaet: number;  // 0..1
  wobble: number;       // 0..1 screen wobble intensity
}

/**
 * Vollständiger Snapshot des Spielzustands
 * Wird vom Worker an die UI gesendet
 */
export interface SpielSnapshot {
  zeit: number; // ms unix timestamp
  ressourcen: Ressourcen;
  raten: Raten;
  meter: Meter;
  arbeitstag: ArbeitstagInfo;
  zustaende: Zustaende;
  automatisierungen: AutomationSnapshot[];
  powerups: PowerupSnapshot[];
  visuell: VisualSnapshot;
}

// ============================================================================
// NACHRICHTEN (UI ↔ WORKER)
// ============================================================================

/**
 * Nachrichten von UI an Worker
 */
export type UiToWorkerMessage =
  | { type: 'BENUTZER_KLICK'; zeit: number }
  | { type: 'KAUF_AUTOMATISIERUNG'; id: string }
  | { type: 'KAUF_KURS'; id: string }
  | { type: 'AKTIVIERE_POWERUP'; id: string }
  | { type: 'AKTIVIERE_MASSNAHME'; id: string }
  | { type: 'ARCHIVIEREN'; amount: number }
  | { type: 'RUN_STEUERUNG'; cmd: 'START' | 'ENDE' | 'PAUSE'; metaState?: MetaZustand }
  | { type: 'SNAPSHOT_ANFORDERN' };

/**
 * Nachrichten von Worker an UI
 */
export type WorkerToUiMessage =
  | { type: 'SNAPSHOT'; payload: SpielSnapshot }
  | { type: 'RUN_ENDE'; grund: 'ZEIT' | 'UEBERLASTUNG' | 'KOLLAPS' | 'BENUTZER'; vp: number; stats: RunStats }
  | { type: 'TEXT'; eintrag: ContentDoc }
  | { type: 'EVENT'; event: GameEvent }
  | { type: 'HINWEIS'; stufe: 'info' | 'warn' | 'fehler'; text: string };

// ============================================================================
// CONTENT-SYSTEM
// ============================================================================

export type Seltenheit = 'haeufig' | 'ungewoehnlich' | 'rar';
export type ContentTyp = 'tooltip' | 'dialog' | 'nachricht' | 'ereignis';

/**
 * Trigger-Bedingungen für Content-Anzeige
 */
export interface ContentTrigger {
  rangMin?: number;
  rangMax?: number;
  klarheitMin?: number;      // 0..1
  klarheitMax?: number;      // 0..1
  aufwandMin?: number;       // 0..1
  aufwandMax?: number;       // 0..1
  energieMin?: number;       // 0..1
  energieMax?: number;       // 0..1
  laufzeitSekMin?: number;
  laufzeitSekMax?: number;
  praedikat?: string;        // Event-Name oder Bedingung
}

/**
 * Ein Content-Dokument (Text, Tooltip, Nachricht)
 */
export interface ContentDoc {
  id: string;
  packId: string;
  sprache: string;
  schluessel: string;
  text: string;
  tags: string[];
  seltenheit: Seltenheit;
  gewicht: number;           // >=1
  cooldownSek: number;       // >=0
  trigger?: ContentTrigger;
  typ?: ContentTyp;
}

/**
 * Snapshot eines aktiven Power-Ups
 */
export interface PowerupSnapshot {
  id: string;
  name: string;
  restMs: number;
  restSekunden: number; // Für UI-Anzeige
}

/**
 * Snapshot einer aktiven Maßnahme
 */
export interface MeasureSnapshot {
  id: string;
  name: string;
  restMs: number;
  restSekunden: number;
  cooldownRestMs: number;
}

/**
 * Kontext für Content-Auswahl
 */
export interface ContentKontext {
  rang: number;
  klarheit: number;          // 0..1
  aufwand: number;           // 0..1
  energie: number;           // 0..1
  laufzeitSek: number;
  kpm: number;               // Klicks pro Minute
  dps: number;               // Dokumente pro Sekunde
  meilensteine: string[];
  aktiveEvents: string[];
}

// ============================================================================
// EVENTS & POWER-UPS
// ============================================================================

export type EventTyp = 'audit' | 'pause' | 'besuch' | 'befoerderung' | 'stoerung' | 'meta';
export type EffektZiel = 'energie' | 'motivation' | 'konzentration' | 'aufwand' | 'automation' | 'zeit' | 'verwirrung';
export type EffektTyp = 'sofort' | 'zeitlich';

/**
 * Effekt eines Events oder Power-Ups
 */
export interface EventEffekt {
  ziel: EffektZiel;
  delta: number;             // Änderung
  multiplikator?: number;    // Alternative zu delta
  dauerSek?: number;         // Falls temporär
  typ?: EffektTyp;
}

/**
 * Game Event Definition
 */
export interface GameEvent {
  id: string;
  typ: EventTyp;
  titel: string;
  beschreibung: string;
  wahrscheinlichkeit: number; // 0..1 pro Minute
  trigger?: ContentTrigger;
  effekte: EventEffekt[];
  dauerSek?: number;
}

/**
 * Vollständiger Snapshot des Spielzustands
 * Wird vom Worker an die UI gesendet
 */
export interface SpielSnapshot {
  zeit: number; // ms unix timestamp
  ressourcen: Ressourcen;
  raten: Raten;
  meter: Meter;
  arbeitstag: ArbeitstagInfo;
  zustaende: Zustaende;
  automatisierungen: AutomationSnapshot[];
  powerups: PowerupSnapshot[];
  measures: MeasureSnapshot[];
  visuell: VisualSnapshot;
}

/**
 * Aktives Power-Up zur Laufzeit
 */
export interface AktivesPowerUp {
  id: string;
  startZeit: number;         // ms
  endeZeit: number;          // ms
  effekte: EventEffekt[];
}

// ============================================================================
// BALANCING-KONFIGURATION
// ============================================================================

export interface KostenKurve {
  basis: number;             // Startkosten
  wachstum: number;          // Multiplikator je Stufe (z.B. 1.15)
}

export interface BalancingConfig {
  kosten: {
    automatisierung: KostenKurve;
    kurse: KostenKurve;
    befoerderung: KostenKurve;
    powerups: KostenKurve;
  };
  vpErtrag: {
    minProRun: number;
    zeitFaktor: number;
    klarheitBonus: number;
    softCapSek: number;
  };
  aufwand: {
    chaosFaktor: number;
    dämpfung: number;
  };
  zustand: {
    energieVerbrauchProKlick: number;
    energieVerbrauchProSek: number;
    energieRegenProSek: number;
    konzentrationsDriftProSek: number;
    konzentrationsBoostNeuigkeit: number;
    motivationGainErfolg: number;
    motivationLossFehler: number;
    verwirrungProAufwand: number;
    verwirrungDecayProSek: number;
    ueberlastungSchwelle: number;
    gewichte: {
      w1: number; // Energie-Gewicht
      w2: number; // Verwirrung-Gewicht
      w3: number; // Aufwand-Gewicht
    };
  };
}

// ============================================================================
// DEXIE / INDEXEDDB SCHEMA
// ============================================================================

/**
 * Gespeichertes Spiel
 */
export interface SaveGame {
  id: string;                // z.B. 'primary'
  erstelltAm: number;        // ms unix
  aktualisiertAm: number;    // ms unix
  runZustand: string;        // serialisierter JSON
  metaZustand: MetaZustand;
  version: string;           // SemVer
}

/**
 * Meta-Progression Zustand
 */
export interface MetaZustand {
  rang: number;
  rangTitel: string;
  gesamtVP: number;
  verfuegbareVP: number;
  freigeschalteteKurse: string[];
  freigeschaltetePowerUps: string[];
  privileges: string[];
}

/**
 * Run-Statistiken
 */
export interface RunStats {
  id: string;                // uuid
  runId: string;             // uuid
  dauerMs: number;
  endgrund: string;
  endMessage?: string;       // Kafkaeske Abschlussnachricht
  vpVerdient: number;
  apGesamt: number;
  maxOP: number;             // Maximale OP erreicht
  klicks: number;
  durchschnittKpm: number;
  maxAufwand: number;
  minEnergie: number;
  ereignisse: string[];      // Event-IDs
  erstelltAm: number;        // ms unix
}

/**
 * Einstellungen (Key-Value)
 */
export interface EinstellungKV {
  id: string;
  schluessel: string;
  wert: unknown;
}

/**
 * Content-Pack in DB
 */
export interface ContentPackRow {
  id: string;
  name: string;
  version: string;
  sprache: string;
  checksumme: string;
  aktiviert: boolean;
}

/**
 * Content-Doc in DB
 */
export interface ContentDocRow extends ContentDoc {
  letzteAnzeige?: number;    // ms unix timestamp
}

/**
 * Akte
 */
export interface AktenRow {
  id: string;                // uuid
  aktenzeichen: string;      // z.B. 'AZ-24-37/B'
  sachgebiet: string;
  prioritaet: 1 | 2 | 3 | 4 | 5;
  status: 'in_bearbeitung' | 'abgeschlossen' | 'verloren';
  bonusVp: number;
  erstelltAm: number;
}

// ============================================================================
// AUTOMATISIERUNG
// ============================================================================

/**
 * Definition einer Automatisierung
 */
export interface AutomationDef {
  id: string;
  name: string;
  beschreibung: string;
  basisOutput: number;       // AP/s bei Stufe 1
  basisKosten: number;       // AP-Kosten für Stufe 1
  wachstum: number;          // Kostenmultiplikator
  chaosFaktor: number;       // Wie viel Aufwand erzeugt wird
  maxStufe?: number;         // Optional: Limit
}

/**
 * Laufzeit-Zustand einer Automatisierung
 */
export interface Automation {
  id: string;
  stufe: number;
  aktiviert: boolean;
}

// ============================================================================
// HILFSTYPEN
// ============================================================================

/**
 * Random Number Generator Interface
 */
export interface RNG {
  next(): number;            // 0..1
  nextInt(min: number, max: number): number;
  seed(s: number): void;
}

/**
 * Type Guards
 */
export function isSpielSnapshot(v: unknown): v is SpielSnapshot {
  return (
    typeof v === 'object' && 
    v !== null &&
    'ressourcen' in v &&
    'raten' in v &&
    'meter' in v &&
    'zustaende' in v
  );
}

export function isUiToWorkerMessage(v: unknown): v is UiToWorkerMessage {
  return (
    typeof v === 'object' &&
    v !== null &&
    'type' in v &&
    typeof (v as any).type === 'string'
  );
}
