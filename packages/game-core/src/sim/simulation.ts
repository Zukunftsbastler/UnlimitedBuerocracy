/**
 * Bürokratie der Unendlichkeit – Simulation Core
 * 
 * Enthält den vollständigen Spielzustand und alle Update-Systeme.
 * Diese Simulation läuft deterministisch und kann im Worker oder Main-Thread ausgeführt werden.
 */

import type {
  Ressourcen,
  Zustaende,
  Automation,
  AktivesPowerUp,
  BalancingConfig,
  SpielSnapshot,
  Raten,
  Meter,
  AutomationSnapshot,
  PowerupSnapshot,
  VisualSnapshot,
  ArbeitstagInfo,
} from '../contracts';
import { Mulberry32 } from './rng';

/**
 * Aktive Maßnahme zur Laufzeit
 */
export interface AktiveMassnahme {
  id: string;
  startZeit: number;     // ms
  endeZeit: number;      // ms (0 für sofortige Effekte)
  effekte: any[];        // Effekt-Definition
}

/**
 * Vollständiger Simulationszustand
 */
export interface SimulationState {
  // Identifikation
  runId: string;
  seed: number;
  
  // Zeitsteuerung
  startZeit: number;           // ms unix
  laufzeit: number;            // vergangene ms
  arbeitstagMin: number;       // Gesamt-Arbeitstag in Minuten
  vergangenMin: number;        // bereits vergangene Minuten
  zeitSkalierung: number;      // z.B. 24 = 1 Realminute = 24 Spielminuten
  
  // Ressourcen
  ressourcen: Ressourcen;
  
  // Vitalzustände
  zustaende: Zustaende;
  
  // Ordnung & Aufwand
  klarheit: number;            // 0..1
  aufwand: number;             // 0..1
  
  // Automatisierungen
  automatisierungen: Automation[];
  
  // Power-Ups
  aktivePowerUps: AktivesPowerUp[];
  powerUpCooldowns: Map<string, number>; // id -> endeZeit
  
  // Maßnahmen (OP-System)
  aktiveMassnahmen: AktiveMassnahme[];
  massnahmenCooldowns: Map<string, number>; // id -> endeZeit
  
  // Statistiken (für diesen Run)
  stats: {
    klicks: number;
    fehler: number;            // Klicks ohne AP-Ertrag
    letzteKlickZeit: number;
    kpmWindow: number[];       // Ring-Buffer für KPM-Berechnung
    apGesamt: number;
    maxOP: number;
    maxAufwand: number;
    minEnergie: number;
    minKonzentration: number;
    ereignisse: string[];
  };
  
  // Visuelle Parameter
  visuell: {
    farbton: number;
    intensitaet: number;
    wobble: number;
  };
  
  // Status
  paused: boolean;
  runEnded: boolean;
  endGrund?: string;
}

/**
 * Hilfsfunktion: Clampt Wert zwischen 0 und 1
 */
function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Hilfsfunktion: Clampt Wert zwischen min und max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Erstellt initialen Simulationszustand
 */
export function createSimulationState(
  runId: string,
  seed: number,
  config: BalancingConfig
): SimulationState {
  // Basis-Energie (wird durch Meta-Upgrades modifiziert)
  const basisEnergie = 1.0;
  
  return {
    runId,
    seed,
    startZeit: Date.now(),
    laufzeit: 0,
    arbeitstagMin: 480, // 8 Stunden
    vergangenMin: 0,
    zeitSkalierung: 24, // 1 Realminute = 24 Spielminuten
    
    ressourcen: {
      AP: 0,
      OP: 0,
      VP: 0,
      Aufwand: 0,
    },
    
    zustaende: {
      energie: basisEnergie, // Wird durch Meta-Upgrades erhöht
      konzentration: 0.8,
      motivation: 0.7,
      verwirrung: 0,
      ueberlastung: 0,
    },
    
    klarheit: 0.5,
    aufwand: 0,
    
    automatisierungen: [],
    aktivePowerUps: [],
    powerUpCooldowns: new Map(),
    aktiveMassnahmen: [],
    massnahmenCooldowns: new Map(),
    
    stats: {
      klicks: 0,
      fehler: 0,
      letzteKlickZeit: 0,
      kpmWindow: [],
      apGesamt: 0,
      maxOP: 0,
      maxAufwand: 0,
      minEnergie: 1,
      minKonzentration: 1,
      ereignisse: [],
    },
    
    visuell: {
      farbton: 200, // Blau
      intensitaet: 0.5,
      wobble: 0,
    },
    
    paused: false,
    runEnded: false,
  };
}

/**
 * Hauptupdate-Funktion - wird jeden Frame aufgerufen
 */
export function updateSimulation(
  state: SimulationState,
  deltaMs: number,
  config: BalancingConfig,
  rng: Mulberry32
): void {
  if (state.paused || state.runEnded) return;
  
  const dt = deltaMs / 1000; // Sekunden
  state.laufzeit += deltaMs;
  
  // Systeme in fester Reihenfolge ausführen
  updateTime(state, dt);
  updateEnergy(state, dt, config);
  updateConcentration(state, dt, config);
  updateMotivation(state, dt, config);
  updateAutomation(state, dt, config);
  updatePowerUps(state, deltaMs);
  updateAufwand(state, dt, config);
  updateVerwirrung(state, dt, config);
  updateOP(state, dt, config);
  updateOverload(state, config);
  updateVisuals(state);
  updateStats(state);
  
  // Run-Ende prüfen
  checkRunEnd(state, config);
}

/**
 * Zeit-System: Aktualisiert Arbeitstag
 */
function updateTime(state: SimulationState, dt: number): void {
  const deltaMin = dt * (state.zeitSkalierung / 60);
  state.vergangenMin += deltaMin;
}

/**
 * Energie-System
 */
function updateEnergy(state: SimulationState, dt: number, config: BalancingConfig): void {
  const cfg = config.zustand;
  
  // Meta-Upgrades: Max-Energie Bonus (erhöht Obergrenze)
  const energieMaxMult = (state as any).metaMultipliers?.energieMax || 1;
  const maxEnergie = 1.0 * energieMaxMult;
  
  // Passive Verbrauch
  state.zustaende.energie -= cfg.energieVerbrauchProSek * dt;
  
  // Regeneration (z.B. durch Pause oder niedrige Aktivität)
  // Vorerst nur minimale passive Regen
  if (state.zustaende.energie < 0.3) {
    state.zustaende.energie += cfg.energieRegenProSek * 0.5 * dt;
  }
  
  // Clamp mit erhöhter Obergrenze
  state.zustaende.energie = clamp(state.zustaende.energie, 0, maxEnergie);
  
  // Stats tracken
  if (state.zustaende.energie < state.stats.minEnergie) {
    state.stats.minEnergie = state.zustaende.energie;
  }
}

/**
 * Konzentrations-System
 * Fällt bei Klicks, regeneriert danach langsam, sinkt passiv nach ~2 Min auf 0
 */
function updateConcentration(state: SimulationState, dt: number, config: BalancingConfig): void {
  const now = Date.now();
  const timeSinceLastClick = now - state.stats.letzteKlickZeit;
  
  // Meta-Upgrades: Drift-Reduktion
  const driftMult = (state as any).metaMultipliers?.konzentrationsDrift || 1;
  
  // Passive Drift: Nach 120 Sekunden auf 0 (ohne Klicks)
  // 0.8 / 120s = 0.00667/s
  const passiveDrift = 0.00667 * driftMult;
  
  // Regeneration nach Klick: Langsamer Anstieg für ~5 Sekunden
  // Wenn letzter Klick < 5s her, regeneriere langsam
  if (timeSinceLastClick < 5000 && timeSinceLastClick > 0) {
    // Regeneration: +0.02/s für 5 Sekunden = +0.1 total
    state.zustaende.konzentration += 0.02 * dt;
  } else {
    // Ansonsten passiver Drift nach unten
    state.zustaende.konzentration -= passiveDrift * dt;
  }
  
  state.zustaende.konzentration = clamp01(state.zustaende.konzentration);
  
  // Stats tracken
  if (state.zustaende.konzentration < state.stats.minKonzentration) {
    state.stats.minKonzentration = state.zustaende.konzentration;
  }
}

/**
 * Motivations-System
 */
function updateMotivation(state: SimulationState, dt: number, config: BalancingConfig): void {
  // Meta-Upgrades: Stabilere Motivation (weniger Drift)
  const motivationDriftMult = (state as any).metaMultipliers?.motivationDrift || 1;
  
  // Prüfe aktive Maßnahmen für Motivation-Boni
  const now = Date.now();
  let motivationBonus = 0;
  
  for (const massnahme of state.aktiveMassnahmen) {
    if (massnahme.endeZeit > 0 && massnahme.endeZeit > now) {
      for (const effekt of massnahme.effekte) {
        if (effekt.ziel === 'motivation' && effekt.typ === 'addition') {
          // Addition-Effekte wirken als kontinuierlicher Bonus pro Sekunde
          motivationBonus += effekt.wert * dt;
        }
      }
    }
  }
  
  // Konstanter passiver Abstieg
  // Motivation fällt permanent um 0.02 pro Sekunde
  const passiveFall = 0.02 * motivationDriftMult * dt;
  state.zustaende.motivation -= passiveFall;
  
  // Motivation-Bonus durch Maßnahmen anwenden
  state.zustaende.motivation += motivationBonus;
  
  state.zustaende.motivation = clamp01(state.zustaende.motivation);
}

/**
 * Automatisierungs-System: Erzeugt passiven Output
 */
function updateAutomation(state: SimulationState, dt: number, config: BalancingConfig): void {
  let totalDPS = 0;
  
  // Meta-Upgrades: DPS-Bonus holen
  const dpsMult = (state as any).metaMultipliers?.dpsBonus || 1;
  
  // Aktive Maßnahmen: Aufwand-Zuwachs Multiplikator holen
  const now = Date.now();
  let aufwandZuwachsMult = 1.0;
  for (const massnahme of state.aktiveMassnahmen) {
    if (massnahme.endeZeit === 0 || massnahme.endeZeit > now) {
      for (const effekt of massnahme.effekte) {
        if (effekt.ziel === 'aufwandZuwachs' && effekt.typ === 'multiplikator') {
          aufwandZuwachsMult *= effekt.wert;
        }
      }
    }
  }
  
  for (const auto of state.automatisierungen) {
    if (!auto.aktiviert || auto.stufe === 0) continue;
    
    // Output berechnen (vereinfacht - in echtem System würde hier AutomationDef verwendet)
    const basisOutput = 1.0; // AP/s pro Stufe
    const effBonus = 1 - state.zustaende.verwirrung * 0.25; // Verwirrung reduziert Effizienz
    const output = basisOutput * auto.stufe * effBonus * dpsMult; // DPS-Bonus anwenden
    
    state.ressourcen.AP += output * dt;
    totalDPS += output;
    
    // Aufwand durch Automation - MIT Zuwachs-Multiplikator
    const chaosBeitrag = 0.02 * auto.stufe * dt;
    state.aufwand += chaosBeitrag * config.aufwand.chaosFaktor * aufwandZuwachsMult;
  }
  
  // Stats aktualisieren (AP Gesamt)
  state.stats.apGesamt += totalDPS * dt;
}

/**
 * Power-Up-System: Aktualisiert aktive Buffs
 */
function updatePowerUps(state: SimulationState, deltaMs: number): void {
  const now = Date.now();
  
  // Entferne abgelaufene Power-Ups
  state.aktivePowerUps = state.aktivePowerUps.filter(p => p.endeZeit > now);
  
  // Cooldowns aktualisieren
  const toRemove: string[] = [];
  state.powerUpCooldowns.forEach((endeZeit, id) => {
    if (endeZeit <= now) {
      toRemove.push(id);
    }
  });
  toRemove.forEach(id => state.powerUpCooldowns.delete(id));
}

/**
 * Aufwand-System: Chaos-Akkumulation
 */
function updateAufwand(state: SimulationState, dt: number, config: BalancingConfig): void {
  const cfg = config.aufwand;
  
  // Meta-Upgrades: Chaos-Resistenz (weniger Aufwand-Akkumulation)
  const chaosResistenz = (state as any).metaMultipliers?.chaosResistenz || 1;
  
  // Aktive Maßnahmen: Aufwand-Zuwachs Multiplikator prüfen
  const now = Date.now();
  let aufwandZuwachsMult = 1.0;
  
  // Entferne abgelaufene Maßnahmen
  state.aktiveMassnahmen = state.aktiveMassnahmen.filter(m => m.endeZeit === 0 || m.endeZeit > now);
  
  // Prüfe aktive Maßnahmen für aufwandZuwachs-Modifikatoren
  for (const massnahme of state.aktiveMassnahmen) {
    if (massnahme.endeZeit === 0 || massnahme.endeZeit > now) {
      for (const effekt of massnahme.effekte) {
        if (effekt.ziel === 'aufwandZuwachs' && effekt.typ === 'multiplikator') {
          aufwandZuwachsMult *= effekt.wert;
        }
      }
    }
  }
  
  // Dämpfung (z.B. durch Kurse/Privilegien)
  const dämpfung = cfg.dämpfung * state.klarheit;
  state.aufwand -= dämpfung * dt;
  
  // Chaos-Resistenz anwenden (passiver Abbau verstärkt)
  // WICHTIG: Dies ist ABBAU, kein Zuwachs - daher NICHT vom Zuwachs-Multiplikator betroffen
  if (chaosResistenz < 1) {
    const extraDämpfung = (1 - chaosResistenz) * 0.05;
    state.aufwand -= extraDämpfung * dt;
  }
  
  // Aufwand beeinflusst Klarheit  
  state.klarheit = clamp01(0.5 + state.ressourcen.OP * 0.01 - state.aufwand * 0.5);
  
  state.aufwand = clamp01(state.aufwand);
  
  // Stats
  if (state.aufwand > state.stats.maxAufwand) {
    state.stats.maxAufwand = state.aufwand;
  }
}

/**
 * Verwirrung-System
 */
function updateVerwirrung(state: SimulationState, dt: number, config: BalancingConfig): void {
  const cfg = config.zustand;
  
  // Anstieg durch hohen Aufwand
  if (state.aufwand > 0.5) {
    state.zustaende.verwirrung += cfg.verwirrungProAufwand * (state.aufwand - 0.5) * dt;
  }
  
  // Natürlicher Decay
  state.zustaende.verwirrung -= cfg.verwirrungDecayProSek * dt;
  
  state.zustaende.verwirrung = clamp01(state.zustaende.verwirrung);
}

/**
 * Ordnungspunkte-System
 * Generiert OP basierend auf geordnetem Verhalten
 */
function updateOP(state: SimulationState, dt: number, config: BalancingConfig): void {
  // Parameter angepasst für höhere OP-Werte
  const r_base = 0.08;  // Erhöht von 0.02
  const a1 = 0.50;      // Erhöht von 0.30
  const a2 = 0.40;      // Erhöht von 0.25
  const a3 = 0.25;      // Erhöht von 0.15
  const b1 = 0.30;      // Reduziert von 0.40
  const decay = 0.02;   // Reduziert von 0.03
  const cap = 100;
  
  // Berechne Fehlerquote
  const fehlerquote = 0.05 * (1 - state.zustaende.konzentration);
  
  // Berechne Beiträge
  const klarheitsBonus = a1 * Math.max(0, state.klarheit - 0.5);  // Threshold von 0.6 auf 0.5
  const aufwandBonus = a2 * Math.max(0, 0.8 - state.aufwand);     // Threshold von 0.7 auf 0.8
  const motivationBonus = a3 * Math.max(0, state.zustaende.motivation - 0.4);  // Threshold von 0.5 auf 0.4
  const fehlerMalus = b1 * fehlerquote;
  
  // OP-Zuwachs
  const opGain = (r_base + klarheitsBonus + aufwandBonus + motivationBonus - fehlerMalus) * dt;
  
  // Decay
  const opDecay = decay * state.ressourcen.OP * dt;
  
  // Anwenden
  state.ressourcen.OP += opGain - opDecay;
  state.ressourcen.OP = clamp(state.ressourcen.OP, 0, cap);
  
  // Stats tracken
  if (state.ressourcen.OP > state.stats.maxOP) {
    state.stats.maxOP = state.ressourcen.OP;
  }
}

/**
 * Überlastungs-System: Aggregiert Vitalzustände
 */
function updateOverload(state: SimulationState, config: BalancingConfig): void {
  const w = config.zustand.gewichte;
  
  const energieBeitrag = (1 - state.zustaende.energie) * w.w1;
  const verwirrungBeitrag = state.zustaende.verwirrung * w.w2;
  const aufwandBeitrag = Math.max(0, state.aufwand - 0.7) * w.w3;
  
  state.zustaende.ueberlastung = clamp01(
    energieBeitrag + verwirrungBeitrag + aufwandBeitrag
  );
}

/**
 * Visuelles Feedback: Berechnet Farbton und Wobble
 */
function updateVisuals(state: SimulationState): void {
  // Farbton: Blau (Ordnung) -> Gelb (Chaos) -> Rot (Kollaps)
  // 200 (blau) -> 60 (gelb) -> 0 (rot)
  const chaosLevel = state.aufwand;
  state.visuell.farbton = 200 - chaosLevel * 200;
  
  // Intensität basiert auf Energie
  state.visuell.intensitaet = state.zustaende.energie * 0.5 + 0.5;
  
  // Wobble bei Überlastung
  state.visuell.wobble = Math.max(0, state.zustaende.ueberlastung - 0.7) * 2;
}

/**
 * Statistik-Updates
 */
function updateStats(state: SimulationState): void {
  // KPM-Fenster aktualisieren (nur wenn Klicks vorhanden)
  // Wird von handleClick gefüllt
}

/**
 * Run-Ende prüfen
 */
function checkRunEnd(state: SimulationState, config: BalancingConfig): void {
  if (state.runEnded) return;
  
  // Energie erschöpft
  if (state.zustaende.energie <= 0) {
    state.runEnded = true;
    state.endGrund = 'ENERGIE';
    return;
  }
  
  // Konzentration versagt
  if (state.zustaende.konzentration <= 0) {
    state.runEnded = true;
    state.endGrund = 'KONZENTRATION';
    return;
  }
  
  // Motivation auf Null gefallen
  if (state.zustaende.motivation <= 0) {
    state.runEnded = true;
    state.endGrund = 'MOTIVATION';
    return;
  }
  
  // Zeit abgelaufen
  if (state.vergangenMin >= state.arbeitstagMin) {
    state.runEnded = true;
    state.endGrund = 'ZEIT';
    return;
  }
  
  // Überlastung zu hoch
  if (state.zustaende.ueberlastung >= config.zustand.ueberlastungSchwelle) {
    state.runEnded = true;
    state.endGrund = 'UEBERLASTUNG';
    return;
  }
  
  // Kollaps (Aufwand zu hoch)
  if (state.aufwand >= 0.95) {
    state.runEnded = true;
    state.endGrund = 'KOLLAPS';
    return;
  }
}

/**
 * Fehlgeschlagener Stempel-Versuch
 * Wird aufgerufen wenn ein Stempel fehlschlägt (Klecks oder Kaffeefleck)
 */
export function handleFailedStamp(
  state: SimulationState,
  wasFumbled: boolean
): void {
  if (state.runEnded || state.paused) return;
  
  // Motivation sinkt deutlich bei Fehlschlag
  const motivationVerlust = wasFumbled ? 0.15 : 0.08; // Mehr Verlust bei Fumble
  state.zustaende.motivation -= motivationVerlust;
  state.zustaende.motivation = clamp01(state.zustaende.motivation);
  
  // Fehler in Stats tracken
  state.stats.fehler++;
}

/**
 * Benutzer-Klick verarbeiten
 */
export function handleClick(
  state: SimulationState,
  config: BalancingConfig
): void {
  if (state.runEnded || state.paused) return;
  
  // Prüfe ob genug Energie vorhanden
  if (state.zustaende.energie <= 0) {
    // Keine Energie = kein Klick möglich
    return;
  }
  
  const now = Date.now();
  
  // Aktive Maßnahmen: Aufwand-Zuwachs Multiplikator holen
  let aufwandZuwachsMult = 1.0;
  for (const massnahme of state.aktiveMassnahmen) {
    if (massnahme.endeZeit === 0 || massnahme.endeZeit > now) {
      for (const effekt of massnahme.effekte) {
        if (effekt.ziel === 'aufwandZuwachs' && effekt.typ === 'multiplikator') {
          aufwandZuwachsMult *= effekt.wert;
        }
      }
    }
  }
  
  // Energie-Kosten (steigen mit Aufwand)
  const energieKosten = config.zustand.energieVerbrauchProKlick * (1 + state.aufwand);
  state.zustaende.energie -= energieKosten;
  state.zustaende.energie = clamp01(state.zustaende.energie);
  
  // Konzentrations-Kosten: Stark bei Klick
  const konzentrationsKosten = 0.08;
  state.zustaende.konzentration -= konzentrationsKosten;
  state.zustaende.konzentration = clamp01(state.zustaende.konzentration);
  
  // Output berechnen mit Energie^0.5 Multiplikator
  const basisErtrag = 1.0;
  const energieEffizienz = Math.pow(state.zustaende.energie, 0.5);
  const konzentrationMult = clamp(0.5 + state.zustaende.konzentration * 0.5, 0.5, 1.0);
  
  // Meta-Upgrades: Klick-Bonus anwenden
  const metaMult = (state as any).metaMultipliers?.klickErtrag || 1;
  
  const ertrag = basisErtrag * energieEffizienz * konzentrationMult * metaMult;
  
  // Fehler-Check: Wenn Ertrag zu niedrig, zählt als Fehler
  if (ertrag < 0.3) {
    state.stats.fehler++;
  } else {
    state.ressourcen.AP += ertrag;
  }
  
  // Aufwand steigt mit jedem Klick - MIT Zuwachs-Multiplikator
  state.aufwand += 0.002 * aufwandZuwachsMult;
  
  // Stats
  state.stats.klicks++;
  state.stats.letzteKlickZeit = now;
  
  // KPM tracken (letzte 60s)
  state.stats.kpmWindow.push(now);
  state.stats.kpmWindow = state.stats.kpmWindow.filter(t => now - t < 60000);
}

/**
 * Automatisierung kaufen
 */
export function kaufeAutomatisierung(
  state: SimulationState,
  id: string,
  config: BalancingConfig
): boolean {
  let auto = state.automatisierungen.find(a => a.id === id);
  
  if (!auto) {
    // Neue Automatisierung anlegen
    auto = {
      id,
      stufe: 0,
      aktiviert: true,
    };
    state.automatisierungen.push(auto);
  }
  
  // Map der Basis-Kosten für jede Automatisierung (aus automations.json)
  const baseCosts: Record<string, number> = {
    'auto_basic': 10,
    'auto_formular': 50,
    'auto_stempel': 150,
    'auto_ablage': 400,
    'auto_zentrale': 1000,
    'auto_ki': 2500,
  };
  
  // Kosten berechnen mit individueller Basis
  const cfg = config.kosten.automatisierung;
  const basisKosten = baseCosts[id] || cfg.basis; // Fallback auf generische Basis
  let kosten = basisKosten * Math.pow(cfg.wachstum, auto.stufe);
  
  // Meta-Upgrades: Kosten-Reduktion anwenden
  const kostenMult = (state as any).metaMultipliers?.autoKosten || 1;
  kosten *= kostenMult;
  
  if (state.ressourcen.AP < kosten) {
    return false;
  }
  
  state.ressourcen.AP -= kosten;
  auto.stufe++;
  
  return true;
}

/**
 * Power-Up aktivieren
 */
export function aktivierePowerUp(
  state: SimulationState,
  powerUp: { id: string; dauerSek: number; cooldownSek: number; effekte: any[] }
): boolean {
  const now = Date.now();
  
  // Cooldown prüfen
  const cooldownEnde = state.powerUpCooldowns.get(powerUp.id);
  if (cooldownEnde && cooldownEnde > now) {
    return false;
  }
  
  // Power-Up aktivieren
  const aktiv: AktivesPowerUp = {
    id: powerUp.id,
    startZeit: now,
    endeZeit: now + powerUp.dauerSek * 1000,
    effekte: powerUp.effekte,
  };
  
  state.aktivePowerUps.push(aktiv);
  
  // Cooldown setzen (NUR der Cooldown, nicht Dauer + Cooldown)
  // Cooldown beginnt NACH Ende des Power-Ups
  state.powerUpCooldowns.set(
    powerUp.id,
    now + powerUp.dauerSek * 1000 + powerUp.cooldownSek * 1000
  );
  
  // Effekte sofort anwenden
  applyPowerUpEffects(state, aktiv.effekte);
  
  return true;
}

/**
 * AP → OP Tausch
 * 10 AP = 1 OP
 */
export function tauscheAPfuerOP(
  state: SimulationState,
  apAmount: number
): boolean {
  if (state.runEnded || state.paused) return false;
  if (apAmount < 10) return false;
  if (state.ressourcen.AP < apAmount) return false;
  
  // Berechne OP-Gewinn (10 AP = 1 OP)
  const opGewinn = Math.floor(apAmount / 10);
  
  // AP abziehen
  state.ressourcen.AP -= apAmount;
  
  // OP hinzufügen (mit Cap)
  state.ressourcen.OP = Math.min(100, state.ressourcen.OP + opGewinn);
  
  // Kleiner Aufwand durch Prozess
  state.aufwand += 0.005 * opGewinn;
  
  return true;
}

/**
 * AP → OE Konversion (Archivieren) - Deprecated, kept for compatibility
 */
export function archivieren(
  state: SimulationState,
  apAmount: number
): boolean {
  // Leitet jetzt zu AP→OP Tausch um
  return tauscheAPfuerOP(state, apAmount);
}

/**
 * Maßnahme aktivieren (OP-System)
 */
export function aktiviereMassnahme(
  state: SimulationState,
  measure: { id: string; kosten: number; dauer: number; cooldown: number; effekt?: any; effekte?: any[] }
): boolean {
  const now = Date.now();
  
  // OP-Kosten prüfen
  if (state.ressourcen.OP < measure.kosten) {
    return false;
  }
  
  // Cooldown prüfen
  const cooldownEnde = state.massnahmenCooldowns.get(measure.id);
  if (cooldownEnde && cooldownEnde > now) {
    return false;
  }
  
  // OP abziehen
  state.ressourcen.OP -= measure.kosten;
  
  // Effekte vorbereiten
  const effekte = measure.effekte || (measure.effekt ? [measure.effekt] : []);
  
  // Sofortige Effekte anwenden
  if (measure.dauer === 0) {
    applyMeasureEffects(state, effekte, true);
  } else {
    // Temporäre Maßnahme aktivieren
    const aktiv: AktiveMassnahme = {
      id: measure.id,
      startZeit: now,
      endeZeit: now + measure.dauer * 1000,
      effekte,
    };
    state.aktiveMassnahmen.push(aktiv);
  }
  
  // Cooldown setzen
  state.massnahmenCooldowns.set(
    measure.id,
    now + measure.cooldown * 1000
  );
  
  return true;
}

/**
 * Maßnahmen-Effekte anwenden
 */
function applyMeasureEffects(state: SimulationState, effekte: any[], sofort: boolean = false): void {
  for (const eff of effekte) {
    const isImmediate = eff.typ === 'sofort' || sofort;
    
    switch (eff.ziel) {
      case 'verwirrung':
        if (isImmediate) {
          state.zustaende.verwirrung = clamp01(state.zustaende.verwirrung + eff.wert);
        }
        break;
      case 'aufwand':
        if (isImmediate || eff.typ === 'addition') {
          state.aufwand = clamp01(state.aufwand + eff.wert);
        }
        break;
      case 'klarheit':
        if (eff.typ === 'clamp' && isImmediate) {
          state.klarheit = Math.max(state.klarheit, eff.wert);
        }
        break;
      case 'motivation':
        if (isImmediate || eff.typ === 'addition') {
          state.zustaende.motivation = clamp01(state.zustaende.motivation + eff.wert);
        }
        break;
    }
  }
}

/**
 * Power-Up-Effekte anwenden
 */
function applyPowerUpEffects(state: SimulationState, effekte: any[]): void {
  for (const eff of effekte) {
    if (eff.typ === 'sofort' || !eff.typ) {
      switch (eff.ziel) {
        case 'energie':
          state.zustaende.energie = clamp01(state.zustaende.energie + eff.delta);
          break;
        case 'konzentration':
          state.zustaende.konzentration = clamp01(state.zustaende.konzentration + eff.delta);
          break;
        case 'motivation':
          state.zustaende.motivation = clamp01(state.zustaende.motivation + eff.delta);
          break;
        case 'aufwand':
          state.aufwand = clamp01(state.aufwand + eff.delta);
          break;
      }
    }
  }
}

/**
 * Erstellt Snapshot für UI
 */
export function createSnapshot(state: SimulationState, config: BalancingConfig): SpielSnapshot {
  const now = Date.now();
  
  // Raten berechnen
  const kpm = state.stats.kpmWindow.length; // Klicks in letzter Minute
  const dps = state.automatisierungen.reduce((sum, a) => {
    if (!a.aktiviert) return sum;
    return sum + a.stufe * 1.0; // vereinfacht
  }, 0);
  
  const klickErtrag = 1.0 * 
    clamp(0.5 + state.zustaende.energie * 0.5, 0.5, 1.0) *
    clamp(0.8 + state.zustaende.konzentration * 0.4, 0.8, 1.2);
  
  const raten: Raten = {
    klickErtrag,
    dps,
    fehlerquote: state.stats.klicks > 0 ? state.stats.fehler / state.stats.klicks : 0,
  };
  
  const meter: Meter = {
    klarheit: state.klarheit,
    aufwand: state.aufwand,
  };
  
  const arbeitstag: ArbeitstagInfo = {
    verbleibendMin: state.arbeitstagMin - state.vergangenMin,
    vergangenMin: state.vergangenMin,
  };
  
  // WICHTIG: Zeige ALLE Automatisierungen im Snapshot, auch die noch nicht gekauften
  // Dies ist notwendig damit die UI die korrekten Kosten mit Meta-Upgrade-Rabatten anzeigt
  const automatisierungen: AutomationSnapshot[] = [];
  
  // Map der Basis-Kosten für jede Automatisierung (aus automations.json)
  const baseCosts: Record<string, number> = {
    'auto_basic': 10,
    'auto_formular': 50,
    'auto_stempel': 150,
    'auto_ablage': 400,
    'auto_zentrale': 1000,
    'auto_ki': 2500,
  };
  
  const allAutoIds = Object.keys(baseCosts);
  
  for (const autoId of allAutoIds) {
    const existingAuto = state.automatisierungen.find(a => a.id === autoId);
    const stufe = existingAuto?.stufe || 0;
    const aktiviert = existingAuto?.aktiviert ?? true;
    
    const cfg = config.kosten.automatisierung;
    const basisKosten = baseCosts[autoId];
    
    // Meta-Upgrades berücksichtigen
    const kostenMult = (state as any).metaMultipliers?.autoKosten || 1;
    
    // Kosten = Basis * (Wachstum ^ Stufe) * Meta-Multiplikator
    let kosten = basisKosten * Math.pow(cfg.wachstum, stufe);
    kosten *= kostenMult;
    
    automatisierungen.push({
      id: autoId,
      stufe,
      output: aktiviert ? stufe * 1.0 : 0,
      kosten,
    });
  }
  
  // Power-Ups: Aktive + Cooldowns
  const powerups: PowerupSnapshot[] = [];
  
  // Aktive Power-Ups
  for (const p of state.aktivePowerUps) {
    powerups.push({
      id: p.id,
      name: p.id,
      restMs: p.endeZeit - now,
      restSekunden: Math.ceil((p.endeZeit - now) / 1000),
    });
  }
  
  // Power-Ups im Cooldown (aber nicht aktiv)
  state.powerUpCooldowns.forEach((cooldownEnde, id) => {
    // Nur hinzufügen wenn nicht bereits als aktiv gelistet
    const isActive = state.aktivePowerUps.some(p => p.id === id);
    if (!isActive && cooldownEnde > now) {
      powerups.push({
        id,
        name: id,
        restMs: 0,
        restSekunden: 0,
        cooldownRestMs: cooldownEnde - now,
        cooldownRestSekunden: Math.ceil((cooldownEnde - now) / 1000),
      });
    }
  });
  
  // Measures (TODO: Implementieren)
  const measures: any[] = [];
  
  const visuell: VisualSnapshot = {
    farbton: state.visuell.farbton,
    intensitaet: state.visuell.intensitaet,
    wobble: state.visuell.wobble,
  };
  
  // VP-Vorschau berechnen (was würde der Run bringen)
  const vpVorschau = calculateVP(state, config);
  
  return {
    zeit: now,
    ressourcen: { 
      ...state.ressourcen,
      VP: vpVorschau, // VP-Vorschau während des Runs
    },
    raten,
    meter,
    arbeitstag,
    zustaende: { ...state.zustaende },
    automatisierungen,
    powerups,
    measures,
    visuell,
  };
}

/**
 * Berechnet VP-Ertrag am Run-Ende
 * 
 * Formel: Klicks + (Idle-Output / 10) + (Zeit / 100) - (Verwirrung * 5)
 */
export function calculateVP(state: SimulationState, config: BalancingConfig): number {
  const laufzeitSek = state.laufzeit / 1000;
  
  // Komponenten
  const klickBeitrag = state.stats.klicks * 0.05; // Jeder Klick = 0.05 VP
  const idleBeitrag = state.stats.apGesamt / 100; // AP generiert / 100
  const zeitBeitrag = laufzeitSek / 100; // Zeit / 100
  const verwirrungAbzug = state.zustaende.verwirrung * 5; // Verwirrung kostet VP
  
  let vp = klickBeitrag + idleBeitrag + zeitBeitrag - verwirrungAbzug;
  
  // Klarheits-Bonus
  vp *= 1 + state.klarheit * 0.3;
  
  // Minimum 1 VP
  vp = Math.max(1, vp);
  
  return Math.round(vp);
}
