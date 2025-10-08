/**
 * EventScheduler – Bürokratie der Unendlichkeit
 * 
 * Plant und triggert Game-Events wie Audits, Pausen, Störungen etc.
 * Prüft periodisch Wahrscheinlichkeiten und Trigger-Bedingungen.
 */

import type {
  GameEvent,
  PowerUp,
  ContentKontext,
} from '@game-core/contracts';
import { Mulberry32 } from '@game-core/sim';

/**
 * Event-Tracking zur Laufzeit
 */
interface ScheduledEvent {
  event: GameEvent;
  letzterCheck: number;      // ms timestamp
  letzteAusloesung: number;  // ms timestamp
  ausloesungen: number;      // Zähler
}

/**
 * Event-Scheduler für zufällige und getriggerte Events
 */
export class EventScheduler {
  private events: Map<string, ScheduledEvent> = new Map();
  private powerUps: Map<string, PowerUp> = new Map();
  private rng: Mulberry32;
  private checkIntervallMs: number = 30000; // Alle 30s prüfen
  private letzterGlobalCheck: number = 0;

  constructor(seed: number = Date.now()) {
    this.rng = new Mulberry32(seed);
  }

  /**
   * Lädt Event-Definitionen
   */
  loadEvents(events: GameEvent[]): void {
    for (const event of events) {
      this.events.set(event.id, {
        event,
        letzterCheck: 0,
        letzteAusloesung: 0,
        ausloesungen: 0,
      });
    }
    console.log(`[EventScheduler] Loaded ${events.length} events`);
  }

  /**
   * Lädt Power-Up-Definitionen
   */
  loadPowerUps(powerUps: PowerUp[]): void {
    for (const powerUp of powerUps) {
      this.powerUps.set(powerUp.id, powerUp);
    }
    console.log(`[EventScheduler] Loaded ${powerUps.length} power-ups`);
  }

  /**
   * Prüft ob Events ausgelöst werden sollen
   * Wird periodisch vom Game Loop aufgerufen
   */
  update(kontext: ContentKontext, deltaMs: number): GameEvent[] {
    const now = Date.now();
    const triggered: GameEvent[] = [];

    // Global-Check-Intervall
    if (now - this.letzterGlobalCheck < this.checkIntervallMs) {
      return triggered;
    }

    this.letzterGlobalCheck = now;

    // Prüfe jedes Event
    for (const scheduled of this.events.values()) {
      const { event } = scheduled;

      // Trigger-Bedingungen prüfen
      if (event.trigger && !this.matchesTrigger(event.trigger, kontext)) {
        continue;
      }

      // Wahrscheinlichkeit prüfen (pro Minute)
      const minutenSeitLetztemCheck = (now - scheduled.letzterCheck) / 60000;
      const chance = event.wahrscheinlichkeit * minutenSeitLetztemCheck;

      if (this.rng.chance(chance)) {
        triggered.push(event);
        scheduled.letzteAusloesung = now;
        scheduled.ausloesungen++;
        console.log(`[EventScheduler] Triggered event: ${event.id} (${event.titel})`);
      }

      scheduled.letzterCheck = now;
    }

    return triggered;
  }

  /**
   * Prüft Trigger-Bedingungen (gleiche Logik wie ContentService)
   */
  private matchesTrigger(trigger: any, kontext: ContentKontext): boolean {
    if (trigger.rangMin !== undefined && kontext.rang < trigger.rangMin) return false;
    if (trigger.rangMax !== undefined && kontext.rang > trigger.rangMax) return false;
    if (trigger.klarheitMin !== undefined && kontext.klarheit < trigger.klarheitMin) return false;
    if (trigger.klarheitMax !== undefined && kontext.klarheit > trigger.klarheitMax) return false;
    if (trigger.aufwandMin !== undefined && kontext.aufwand < trigger.aufwandMin) return false;
    if (trigger.aufwandMax !== undefined && kontext.aufwand > trigger.aufwandMax) return false;
    if (trigger.energieMin !== undefined && kontext.energie < trigger.energieMin) return false;
    if (trigger.energieMax !== undefined && kontext.energie > trigger.energieMax) return false;
    if (trigger.laufzeitSekMin !== undefined && kontext.laufzeitSek < trigger.laufzeitSekMin) return false;
    if (trigger.laufzeitSekMax !== undefined && kontext.laufzeitSek > trigger.laufzeitSekMax) return false;

    if (trigger.praedikat) {
      const hasEvent = kontext.aktiveEvents.includes(trigger.praedikat);
      const hasMilestone = kontext.meilensteine.includes(trigger.praedikat);
      if (!hasEvent && !hasMilestone) return false;
    }

    return true;
  }

  /**
   * Findet Event nach ID
   */
  getEvent(id: string): GameEvent | undefined {
    return this.events.get(id)?.event;
  }

  /**
   * Findet Power-Up nach ID
   */
  getPowerUp(id: string): PowerUp | undefined {
    return this.powerUps.get(id);
  }

  /**
   * Setzt Check-Intervall (Default: 30s)
   */
  setCheckInterval(ms: number): void {
    this.checkIntervallMs = ms;
  }

  /**
   * Setzt RNG-Seed
   */
  setSeed(seed: number): void {
    this.rng.seed(seed);
  }

  /**
   * Resettet Event-Tracking (z.B. bei neuem Run)
   */
  reset(): void {
    for (const scheduled of this.events.values()) {
      scheduled.letzterCheck = 0;
      scheduled.letzteAusloesung = 0;
      scheduled.ausloesungen = 0;
    }
    this.letzterGlobalCheck = 0;
  }

  /**
   * Debug: Statistiken
   */
  getStats(): {
    totalEvents: number;
    totalPowerUps: number;
    triggeredEvents: { id: string; count: number }[];
  } {
    const triggeredEvents = Array.from(this.events.values())
      .filter(s => s.ausloesungen > 0)
      .map(s => ({ id: s.event.id, count: s.ausloesungen }));

    return {
      totalEvents: this.events.size,
      totalPowerUps: this.powerUps.size,
      triggeredEvents,
    };
  }
}

/**
 * Singleton-Instanz
 */
export const eventScheduler = new EventScheduler();
