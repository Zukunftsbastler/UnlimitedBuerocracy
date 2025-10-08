/**
 * Bürokratie der Unendlichkeit – TypeScript Contracts (v1)
 * Ablagepfad: packages/game-core/src/contracts.ts
 *
 * Enthält:
 *  - Grundtypen & Konstanten
 *  - UI↔Worker Message-DTOs
 *  - GameSnapshot
 *  - Dexie/IndexedDB Schema & Repositories (Typsignaturen)
 *  - Content-Pack Zod-Schemata (Linter)
 */

// ------------------------------
// Grundtypen & Konstanten
// ------------------------------

export type Ressource = 'AP' | 'OE' | 'VP' | 'Aufwand';

export interface Ressourcen {
  AP: number; // Aktenpunkte (laufend im Run)
  OE: number; // Ordnungseinheiten (Run-Fortschritt)
  VP: number; // Verwaltungspunkte (Meta)
  Aufwand: number; // Verwaltungsaufwand (Gegenkraft)
}

export interface Raten {
  klickErtrag: number; // AP pro Klick (nach Modifikatoren)
  dps: number; // Dokumente pro Sekunde (Idle)
  fehlerquote: number; // 0..1
}

export interface Meter {
  klarheit: number; // 0..1
  aufwand: number;  // 0..1
}

export interface ArbeitstagInfo {
  verbleibendMin: number;
  vergangenMin: number;
}

export interface Zustaende {
  energie: number;       // 0..1
  konzentration: number; // 0..1
  motivation: number;    // 0..1
  verwirrung: number;    // 0..1
  ueberlastung: number;  // 0..1
}

export interface AutomationSnapshot {
  id: string;
  stufe: number;
  output: number; // aktueller Beitrag (z. B. AP/s)
}

export interface PowerupSnapshot {
  id: string;
  restMs: number;
}

export interface VisualSnapshot {
  farbton: number;     // hue in deg
  intensitaet: number; // 0..1
  wobble: number;      // 0..1 screen wobble
}

export interface SpielSnapshot {
  zeit: number; // ms unix
  ressourcen: Ressourcen;
  raten: Raten;
  meter: Meter;
  arbeitstag: ArbeitstagInfo;
  zustaende: Zustaende;
  automatisierungen: AutomationSnapshot[];
  powerups: PowerupSnapshot[];
  visuell: VisualSnapshot;
}

// ------------------------------
// UI ↔ Worker – Message-DTOs
// ------------------------------

export type UiToWorkerMessage =
  | { type: 'BENUTZER_KLICK'; zeit: number }
  | { type: 'KAUF_AUTOMATISIERUNG'; id: string }
  | { type: 'KAUF_KURS'; id: string }
  | { type: 'AKTIVIERE_POWERUP'; id: string }
  | { type: 'RUN_STEUERUNG'; cmd: 'START' | 'ENDE' | 'PAUSE' }
  | { type: 'SNAPSHOT_ANFORDERN' };

export type WorkerToUiMessage =
  | { type: 'SNAPSHOT'; payload: SpielSnapshot }
  | { type: 'RUN_ENDE'; grund: 'ZEIT' | 'UEBERLASTUNG' | 'KOLLAPS' | 'BENUTZER'; vp: number }
  | { type: 'TEXT'; eintrag: ContentDoc }
  | { type: 'HINWEIS'; stufe: 'info' | 'warn' | 'fehler'; text: string };

// ------------------------------
// Content-Packs – Schemata & Typen
// ------------------------------

export type Seltenheit = 'haeufig' | 'ungewoehnlich' | 'rar';

export interface ContentTrigger {
  rangMin?: number;
  klarheitMin?: number; // 0..1
  aufwandMax?: number;  // 0..1
  laufzeitSekMin?: number;
  praedikat?: string;   // Ausdrücke, die im Worker whitelisted evaluiert werden
}

export interface ContentDoc {
  id: string;
  packId: 'core-de-v1' | string;
  sprache: 'de' | string;
  schluessel: string;
  text: string;
  tags: string[];
  seltenheit: Seltenheit;
  gewicht: number; // >=1
  cooldownSek: number; // >=0
  trigger?: ContentTrigger;
}

export interface ContentPack {
  id: string; // z. B. 'core-de-v1'
  version: string; // SemVer
  sprache: 'de' | string;
  inhalt: ContentDoc[];
}

export interface ContentKontext {
  rang: number;
  klarheit: number; // 0..1
  aufwand: number;  // 0..1
  laufzeitSek: number;
  kpm: number;      // Klicks pro Minute
  dps: number;      // Dokumente pro Sekunde
  meilensteine: string[];
}

export interface ContentService {
  init(packs: ContentPack[]): Promise<void>;
  next(ctx: ContentKontext): Promise<ContentDoc | null>;
}

// ------------------------------
// Dexie / IndexedDB – Schema & Repositories
// ------------------------------

import Dexie, { Table } from 'dexie';

export interface SaveGame {
  id: string;           // z. B. 'primary'
  erstelltAm: number;   // ms
  aktualisiertAm: number;
  runZustand: unknown;  // serialisierter Weltzustand
  metaZustand: unknown; // z. B. Ränge, Kurse
  version: string;      // SemVer
}

export interface RunStats {
  id: string;     // uuid
  runId: string;  // uuid
  metriken: unknown; // JSON
  dauerMs: number;
  erstelltAm: number;
}

export interface EinstellungKV {
  id: string;       // key
  schluessel: string; // alias, optional doppelt
  wert: unknown;
}

export interface ContentPackRow {
  id: string; // pack id
  name: string;
  version: string;
  sprache: string;
  checksumme: string;
  aktiviert: boolean;
}

export interface ContentDocRow extends ContentDoc {}

export interface AktenRow {
  id: string; // uuid
  aktenzeichen: string; // z. B. 'AZ-24-37/B'
  sachgebiet: 'Haushalt' | 'Personal' | 'Genehmigungen' | 'Beschwerden' | string;
  prioritaet: 1 | 2 | 3 | 4 | 5;
  status: 'in_bearbeitung' | 'abgeschlossen' | 'verloren';
  bonusVp: number;
}

export class GameDB extends Dexie {
  saves!: Table<SaveGame, string>;
  runstats!: Table<RunStats, string>;
  einstellungen!: Table<EinstellungKV, string>;
  contentPacks!: Table<ContentPackRow, string>;
  contentDocs!: Table<ContentDocRow, string>;
  akten!: Table<AktenRow, string>;

  constructor() {
    super('BueroGameDB');
    this.version(1).stores({
      saves: '&id, aktualisiertAm, version',
      runstats: '&id, runId, erstelltAm',
      einstellungen: '&id',
      contentPacks: '&id, sprache, aktiviert',
      contentDocs: '&id, packId, sprache, seltenheit, schluessel',
      akten: '&id, aktenzeichen, status, sachgebiet'
    });
  }
}

export const db = new GameDB();

// ------------------------------
// Repository-Schnittstellen (Typsignaturen)
// ------------------------------

export interface SaveRepo {
  laden(): Promise<SaveGame | null>;
  speichern(d: SaveGame): Promise<void>;
}

export interface StatsRepo {
  hinzufuegen(e: RunStats): Promise<void>;
  abfragen(filter?: { von?: number; bis?: number }): Promise<RunStats[]>;
}

export interface ContentRepo {
  nachTag(tag: string): Promise<ContentDoc[]>;
  zufall(ctx: ContentKontext): Promise<ContentDoc | null>;
}

// ------------------------------
// Zod-Linter (Content)
// ------------------------------

// Optional: nur laden, wenn zod verfügbar ist; Designziel: Contracts ohne harte Abhängigkeit nutzbar halten
// Für Projekte mit Zod einfach auskommentieren oder Peer-Dependency nutzen
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { z } from 'zod';

export const TriggerSchema = z.object({
  rangMin: z.number().optional(),
  klarheitMin: z.number().min(0).max(1).optional(),
  aufwandMax: z.number().min(0).max(1).optional(),
  laufzeitSekMin: z.number().min(0).optional(),
  praedikat: z.string().optional()
});

export const ContentDocSchema = z.object({
  id: z.string(),
  packId: z.string(),
  sprache: z.string(),
  schluessel: z.string(),
  text: z.string().min(5),
  tags: z.array(z.string()),
  seltenheit: z.enum(['haeufig', 'ungewoehnlich', 'rar']),
  gewicht: z.number().min(1),
  cooldownSek: z.number().min(0),
  trigger: TriggerSchema.optional()
});

export const ContentPackSchema = z.object({
  id: z.string(),
  version: z.string(),
  sprache: z.string(),
  inhalt: z.array(ContentDocSchema)
});

export type ContentDocParsed = z.infer<typeof ContentDocSchema>;
export type ContentPackParsed = z.infer<typeof ContentPackSchema>;

// ------------------------------
// Hilfstypen – Balancing-Konfiguration
// ------------------------------

export interface KostenKurve {
  basis: number;   // Startkosten
  wachstum: number; // Multiplikator je Stufe
}

export interface BalancingConfig {
  kosten: {
    automatisierung: KostenKurve;
    kurse: KostenKurve;
    befoerderung: KostenKurve; // VP Prestige-Kurve
  };
  vpErtrag: {
    minProRun: number;
    zeitFaktor: number;   // Multiplikator pro Laufzeitsekunde
    klarheitBonus: number; // z. B. 1.1
  };
  aufwand: {
    ueberproduktion: number; // Chaos-Zuwachs pro Extra-Output
    dämpfung: number;        // Mitigationsfaktor
  };
  zustand: {
    energieVerbrauchProKlick: number;
    energieRegenProSek: number;
    konzentrationsDrift: number;
  };
}

// ------------------------------
// Type Guards (Beispiel)
// ------------------------------

export function isSpielSnapshot(v: unknown): v is SpielSnapshot {
  return (
    typeof v === 'object' && v !== null &&
    'ressourcen' in (v as any) &&
    'raten' in (v as any) &&
    'meter' in (v as any)
  );
}

// ------------------------------
// Ende Contracts
// ------------------------------
