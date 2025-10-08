/**
 * Deterministischer Random Number Generator (Mulberry32)
 * 
 * Verwendet für reproduzierbare Simulation. Jeder Run erhält einen Seed,
 * wodurch alle Zufallsereignisse bei gleichem Seed identisch ablaufen.
 */

import { RNG } from '../contracts';

/**
 * Mulberry32 - Einfacher, schneller PRNG mit guter Verteilung
 * Quelle: https://github.com/bryc/code/blob/master/jshash/PRNGs.md
 */
export class Mulberry32 implements RNG {
  private state: number;

  constructor(seed: number = Date.now()) {
    this.state = seed;
  }

  /**
   * Setzt den Seed neu
   */
  seed(s: number): void {
    this.state = s;
  }

  /**
   * Gibt nächste Zufallszahl zurück (0..1)
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Gibt zufällige Ganzzahl zwischen min (inklusiv) und max (exklusiv) zurück
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Gibt true mit gegebener Wahrscheinlichkeit zurück
   */
  chance(probability: number): boolean {
    return this.next() < probability;
  }

  /**
   * Wählt zufälliges Element aus Array
   */
  choice<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    return array[this.nextInt(0, array.length)];
  }

  /**
   * Wählt Element basierend auf Gewichtung
   */
  weightedChoice<T>(items: T[], weights: number[]): T | undefined {
    if (items.length !== weights.length || items.length === 0) {
      return undefined;
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight <= 0) return undefined;

    let random = this.next() * totalWeight;
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }

    return items[items.length - 1];
  }
}

/**
 * Erzeugt Seed aus String (z.B. Run-ID)
 */
export function seedFromString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
