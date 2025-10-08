/**
 * ContentService – Bürokratie der Unendlichkeit
 * 
 * Verwaltet Content-Packs, filtert nach Triggern und wählt gewichtet passende Texte aus.
 * Implementiert Cooldown-Management und LRU-Cache für Abwechslung.
 */

import type {
  ContentPack,
  ContentDoc,
  ContentKontext,
  ContentTrigger,
} from '@game-core/contracts';
import { Mulberry32 } from '@game-core/sim';

/**
 * Cooldown-Tracking für Content-Docs
 */
interface ContentCooldown {
  docId: string;
  letzteAnzeige: number; // ms timestamp
  cooldownEnde: number;  // ms timestamp
}

/**
 * Content-Service für dynamische Textausgabe
 */
export class ContentService {
  private packs: ContentPack[] = [];
  private alleDocs: ContentDoc[] = [];
  private cooldowns: Map<string, ContentCooldown> = new Map();
  private rng: Mulberry32;
  private lruCache: string[] = []; // IDs der zuletzt angezeigten Docs
  private readonly MAX_LRU_SIZE = 20;

  constructor(seed: number = Date.now()) {
    this.rng = new Mulberry32(seed);
  }

  /**
   * Lädt Content-Packs
   */
  async init(packs: ContentPack[]): Promise<void> {
    this.packs = packs;
    this.alleDocs = packs.flatMap(p => p.inhalt);
    console.log(`[ContentService] Loaded ${this.alleDocs.length} content docs from ${packs.length} packs`);
  }

  /**
   * Lädt Content-Pack aus JSON-Datei
   */
  async loadPackFromFile(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const pack: ContentPack = await response.json();
      
      this.packs.push(pack);
      this.alleDocs.push(...pack.inhalt);
      
      console.log(`[ContentService] Loaded pack "${pack.id}" with ${pack.inhalt.length} docs`);
    } catch (error) {
      console.error(`[ContentService] Failed to load pack from ${url}:`, error);
    }
  }

  /**
   * Wählt passenden Content basierend auf Kontext
   */
  async next(kontext: ContentKontext, tags?: string[]): Promise<ContentDoc | null> {
    const now = Date.now();
    
    // Filtere Docs
    let candidates = this.alleDocs.filter(doc => {
      // Tag-Filter (optional)
      if (tags && tags.length > 0) {
        const hasMatchingTag = tags.some(tag => doc.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }
      
      // Trigger-Filter
      if (doc.trigger && !this.matchesTrigger(doc.trigger, kontext)) {
        return false;
      }
      
      // Cooldown-Filter
      const cooldown = this.cooldowns.get(doc.id);
      if (cooldown && cooldown.cooldownEnde > now) {
        return false;
      }
      
      return true;
    });

    if (candidates.length === 0) {
      console.log('[ContentService] No matching content found for context');
      return null;
    }

    // Reduziere Wahrscheinlichkeit für kürzlich gezeigte Docs
    const candidatesWithPenalty = candidates.map(doc => ({
      doc,
      penaltyFactor: this.getLRUPenalty(doc.id),
    }));

    // Gewichtete Auswahl
    const weights = candidatesWithPenalty.map(c => 
      this.getSeltenheitWeight(c.doc.seltenheit) * c.doc.gewicht * c.penaltyFactor
    );

    const selected = this.rng.weightedChoice(
      candidatesWithPenalty.map(c => c.doc),
      weights
    );

    if (selected) {
      this.markAsShown(selected, now);
      return selected;
    }

    return null;
  }

  /**
   * Prüft ob Trigger-Bedingungen erfüllt sind
   */
  private matchesTrigger(trigger: ContentTrigger, kontext: ContentKontext): boolean {
    // Rang-Bereich
    if (trigger.rangMin !== undefined && kontext.rang < trigger.rangMin) {
      return false;
    }
    if (trigger.rangMax !== undefined && kontext.rang > trigger.rangMax) {
      return false;
    }

    // Klarheit-Bereich
    if (trigger.klarheitMin !== undefined && kontext.klarheit < trigger.klarheitMin) {
      return false;
    }
    if (trigger.klarheitMax !== undefined && kontext.klarheit > trigger.klarheitMax) {
      return false;
    }

    // Aufwand-Bereich
    if (trigger.aufwandMin !== undefined && kontext.aufwand < trigger.aufwandMin) {
      return false;
    }
    if (trigger.aufwandMax !== undefined && kontext.aufwand > trigger.aufwandMax) {
      return false;
    }

    // Energie-Bereich
    if (trigger.energieMin !== undefined && kontext.energie < trigger.energieMin) {
      return false;
    }
    if (trigger.energieMax !== undefined && kontext.energie > trigger.energieMax) {
      return false;
    }

    // Laufzeit-Bereich
    if (trigger.laufzeitSekMin !== undefined && kontext.laufzeitSek < trigger.laufzeitSekMin) {
      return false;
    }
    if (trigger.laufzeitSekMax !== undefined && kontext.laufzeitSek > trigger.laufzeitSekMax) {
      return false;
    }

    // Prädikat (Event-Name oder Milestone)
    if (trigger.praedikat) {
      const hasEvent = kontext.aktiveEvents.includes(trigger.praedikat);
      const hasMilestone = kontext.meilensteine.includes(trigger.praedikat);
      if (!hasEvent && !hasMilestone) {
        return false;
      }
    }

    return true;
  }

  /**
   * Gewicht nach Seltenheit
   */
  private getSeltenheitWeight(seltenheit: string): number {
    switch (seltenheit) {
      case 'haeufig': return 3;
      case 'ungewoehnlich': return 1.5;
      case 'rar': return 0.5;
      default: return 1;
    }
  }

  /**
   * LRU-Penalty: Kürzlich gezeigte Docs erhalten reduziertes Gewicht
   */
  private getLRUPenalty(docId: string): number {
    const index = this.lruCache.indexOf(docId);
    if (index === -1) return 1.0; // Noch nie gezeigt
    
    // Je weiter vorne in der LRU-Liste, desto stärker die Penalty
    const recency = index / this.lruCache.length;
    return 0.1 + (0.9 * recency); // 10% bis 100% Gewicht
  }

  /**
   * Markiert Doc als angezeigt (für Cooldown und LRU)
   */
  private markAsShown(doc: ContentDoc, zeit: number): void {
    // Cooldown setzen
    if (doc.cooldownSek > 0) {
      this.cooldowns.set(doc.id, {
        docId: doc.id,
        letzteAnzeige: zeit,
        cooldownEnde: zeit + doc.cooldownSek * 1000,
      });
    }

    // LRU-Cache aktualisieren
    const existingIndex = this.lruCache.indexOf(doc.id);
    if (existingIndex !== -1) {
      this.lruCache.splice(existingIndex, 1);
    }
    this.lruCache.unshift(doc.id); // Vorne einfügen

    // Cache-Limit
    if (this.lruCache.length > this.MAX_LRU_SIZE) {
      this.lruCache.pop();
    }
  }

  /**
   * Findet Content nach Schlüssel (für Tooltips, spezifische Texte)
   */
  getByKey(schluessel: string): ContentDoc | undefined {
    return this.alleDocs.find(doc => doc.schluessel === schluessel);
  }

  /**
   * Findet alle Docs mit bestimmtem Tag
   */
  getByTag(tag: string): ContentDoc[] {
    return this.alleDocs.filter(doc => doc.tags.includes(tag));
  }

  /**
   * Setzt RNG-Seed (für deterministische Tests)
   */
  setSeed(seed: number): void {
    this.rng.seed(seed);
  }

  /**
   * Resettet Cooldowns (z.B. bei neuem Run)
   */
  resetCooldowns(): void {
    this.cooldowns.clear();
    this.lruCache = [];
  }

  /**
   * Debug: Zeigt Statistiken
   */
  getStats(): {
    totalDocs: number;
    totalPacks: number;
    activeCooldowns: number;
    lruSize: number;
  } {
    return {
      totalDocs: this.alleDocs.length,
      totalPacks: this.packs.length,
      activeCooldowns: this.cooldowns.size,
      lruSize: this.lruCache.length,
    };
  }
}

/**
 * Singleton-Instanz
 */
export const contentService = new ContentService();
