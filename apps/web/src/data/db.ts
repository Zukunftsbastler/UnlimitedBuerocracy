/**
 * Bürokratie der Unendlichkeit – Dexie Database
 * 
 * IndexedDB-Wrapper für Persistenz von:
 * - Savegames (Run-Zustand, Meta-Progression)
 * - Statistiken (Run-Historie)
 * - Einstellungen
 * - Content-Packs
 * - Akten
 */

import Dexie, { Table } from 'dexie';
import type {
  SaveGame,
  RunStats,
  EinstellungKV,
  ContentPackRow,
  ContentDocRow,
  AktenRow,
} from '@game-core/contracts';

/**
 * Hauptdatenbank für das Spiel
 */
export class GameDB extends Dexie {
  // Tabellen
  saves!: Table<SaveGame, string>;
  runstats!: Table<RunStats, string>;
  einstellungen!: Table<EinstellungKV, string>;
  contentPacks!: Table<ContentPackRow, string>;
  contentDocs!: Table<ContentDocRow, string>;
  akten!: Table<AktenRow, string>;

  constructor() {
    super('BueroGameDB');
    
    // Schema-Version 1
    this.version(1).stores({
      saves: '&id, aktualisiertAm, version',
      runstats: '&id, runId, erstelltAm',
      einstellungen: '&id, schluessel',
      contentPacks: '&id, sprache, aktiviert',
      contentDocs: '&id, packId, sprache, seltenheit, [packId+schluessel]',
      akten: '&id, aktenzeichen, status, sachgebiet, erstelltAm',
    });
  }

  /**
   * Initialisiert die Datenbank mit Defaults
   */
  async initialize(): Promise<void> {
    // Prüfe ob bereits initialisiert
    const saveCount = await this.saves.count();
    if (saveCount > 0) return;

    console.log('[DB] Initializing database...');

    // Erstelle primären Savegame-Eintrag
    await this.saves.add({
      id: 'primary',
      erstelltAm: Date.now(),
      aktualisiertAm: Date.now(),
      runZustand: JSON.stringify(null),
      metaZustand: {
        rang: 1,
        rangTitel: 'Sachbearbeiter',
        gesamtVP: 0,
        verfuegbareVP: 0,
        freigeschalteteKurse: [],
        freigeschaltetePowerUps: [],
        privileges: [],
      },
      version: '1.0.0',
    });

    // Default-Einstellungen
    await this.einstellungen.bulkAdd([
      { id: 'audio_master_volume', schluessel: 'audio.master.volume', wert: 0.7 },
      { id: 'audio_sfx_volume', schluessel: 'audio.sfx.volume', wert: 0.8 },
      { id: 'audio_ui_volume', schluessel: 'audio.ui.volume', wert: 0.6 },
      { id: 'audio_music_volume', schluessel: 'audio.music.volume', wert: 0.5 },
      { id: 'audio_amb_volume', schluessel: 'audio.amb.volume', wert: 0.4 },
      { id: 'ui_animations', schluessel: 'ui.animations', wert: true },
      { id: 'ui_reduced_motion', schluessel: 'ui.reducedMotion', wert: false },
      { id: 'gameplay_auto_save', schluessel: 'gameplay.autoSave', wert: true },
    ]);

    console.log('[DB] Database initialized successfully');
  }

  /**
   * Löscht alle Daten (Factory Reset)
   */
  async reset(): Promise<void> {
    await this.saves.clear();
    await this.runstats.clear();
    await this.einstellungen.clear();
    await this.contentPacks.clear();
    await this.contentDocs.clear();
    await this.akten.clear();
    await this.initialize();
  }

  /**
   * Exportiert Savegame als JSON
   */
  async exportSave(saveId: string = 'primary'): Promise<string> {
    const save = await this.saves.get(saveId);
    if (!save) throw new Error('Savegame not found');

    const stats = await this.runstats.where('runId').equals(saveId).toArray();
    const settings = await this.einstellungen.toArray();

    return JSON.stringify({
      save,
      stats,
      settings,
      exportedAt: Date.now(),
      version: '1.0.0',
    }, null, 2);
  }

  /**
   * Importiert Savegame aus JSON
   */
  async importSave(json: string): Promise<void> {
    const data = JSON.parse(json);
    
    // Validierung
    if (!data.save || !data.version) {
      throw new Error('Invalid save format');
    }

    await this.transaction('rw', this.saves, this.runstats, this.einstellungen, async () => {
      await this.saves.put(data.save);
      if (data.stats) {
        await this.runstats.bulkPut(data.stats);
      }
      if (data.settings) {
        await this.einstellungen.bulkPut(data.settings);
      }
    });
  }
}

// Singleton-Instanz
export const db = new GameDB();

// Automatische Initialisierung beim ersten Import
db.initialize().catch(err => {
  console.error('[DB] Initialization failed:', err);
});
