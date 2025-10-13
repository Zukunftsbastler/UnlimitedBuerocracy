/**
 * MetaUpgradeService – Bürokratie der Unendlichkeit
 * 
 * Verwaltet gekaufte Meta-Upgrades und deren Effekte auf das Gameplay
 */

import type { MetaZustand } from '@game-core/contracts';

export interface MetaUpgradeState {
  // Upgrade-ID -> Stufe (0 = nicht gekauft)
  upgrades: Record<string, number>;
}

/**
 * Berechnet Multiplikatoren basierend auf gekauften Upgrades
 */
export class MetaUpgradeService {
  /**
   * Klick-Ertrag Bonus
   */
  static getKlickBonus(metaState: MetaZustand): number {
    const stufe = metaState.freigeschalteteKurse.filter(k => k.startsWith('klick_bonus')).length;
    return 1 + (stufe * 0.1); // +10% pro Stufe
  }

  /**
   * Max. Energie Bonus
   */
  static getEnergieMaxBonus(metaState: MetaZustand): number {
    const stufe = metaState.freigeschalteteKurse.filter(k => k.startsWith('energie_max')).length;
    return 1 + (stufe * 0.1); // +10% pro Stufe
  }

  /**
   * Konzentrations-Drift Reduktion
   */
  static getKonzentrationsDriftReduktion(metaState: MetaZustand): number {
    const stufe = metaState.freigeschalteteKurse.filter(k => k.startsWith('konzentration_regen')).length;
    return Math.pow(0.75, stufe); // -25% pro Stufe (multiplikativ)
  }

  /**
   * Automatisierungs-Kosten Reduktion
   */
  static getAutoKostenReduktion(metaState: MetaZustand): number {
    const stufe = metaState.freigeschalteteKurse.filter(k => k.startsWith('auto_discount')).length;
    return Math.pow(0.9, stufe); // -10% pro Stufe (multiplikativ)
  }

  /**
   * Start-AP Bonus
   */
  static getStartAP(metaState: MetaZustand): number {
    const hasUpgrade = metaState.freigeschalteteKurse.includes('start_bonus_1');
    return hasUpgrade ? 5 : 0;
  }

  /**
   * DPS (Idle-Output) Bonus
   */
  static getDPSBonus(metaState: MetaZustand): number {
    const stufe = metaState.freigeschalteteKurse.filter(k => k.startsWith('dps_bonus')).length;
    return 1 + (stufe * 0.15); // +15% pro Stufe
  }

  /**
   * Motivations-Stabilität
   */
  static getMotivationStability(metaState: MetaZustand): number {
    const stufe = metaState.freigeschalteteKurse.filter(k => k.startsWith('motivation_stable')).length;
    return Math.pow(0.7, stufe); // -30% Drift pro Stufe
  }

  /**
   * Chaos-Resistenz
   * Skaliert über 5 Stufen von -20% bis -99% Aufwand-Reduktion
   */
  static getChaosResistenz(metaState: MetaZustand): number {
    const stufe = metaState.freigeschalteteKurse.filter(k => k.startsWith('chaos_resist')).length;
    // Progressiv ansteigende Reduktion über 5 Stufen
    const reductions = [1.0, 0.8, 0.6, 0.4, 0.2, 0.01];
    return reductions[Math.min(stufe, 5)] || 1.0;
  }

  /**
   * Gesamte Multiplikatoren berechnen
   */
  static calculateMultipliers(metaState: MetaZustand) {
    return {
      klickErtrag: this.getKlickBonus(metaState),
      energieMax: this.getEnergieMaxBonus(metaState),
      konzentrationsDrift: this.getKonzentrationsDriftReduktion(metaState),
      autoKosten: this.getAutoKostenReduktion(metaState),
      startAP: this.getStartAP(metaState),
      dpsBonus: this.getDPSBonus(metaState),
      motivationDrift: this.getMotivationStability(metaState),
      chaosResistenz: this.getChaosResistenz(metaState),
    };
  }
}
