/**
 * Game Worker – Bürokratie der Unendlichkeit
 * 
 * Führt die Simulation in einem separaten Thread aus.
 * Kommuniziert über Messages mit der UI.
 */

import type {
  UiToWorkerMessage,
  WorkerToUiMessage,
  BalancingConfig,
  SpielSnapshot,
  RunStats,
} from '@game-core/contracts';
import {
  createSimulationState,
  updateSimulation,
  handleClick,
  handleFailedStamp,
  kaufeAutomatisierung,
  aktivierePowerUp,
  aktiviereMassnahme,
  archivieren,
  createSnapshot,
  calculateVP,
  type SimulationState,
} from '@game-core/sim';
import { Mulberry32, seedFromString } from '@game-core/sim';

// Importiere Balancing-Config
import balancingConfig from '../config/balancing.json';
import powerupsData from '../config/powerups.json';
import runEndComments from '../config/run_end_comments.json';
import measuresData from '../config/measures.json';
import { MetaUpgradeService } from '../services/MetaUpgradeService';
import type { MetaZustand } from '@game-core/contracts';

/**
 * Wählt eine passende Run-End-Message basierend auf dem Endgrund
 */
function getRunEndMessage(endGrund: string): string {
  let pool: string[];
  
  if (endGrund === 'ENERGIE') {
    pool = runEndComments.kommentare.energie_erschöpft;
  } else if (endGrund === 'KONZENTRATION') {
    pool = runEndComments.kommentare.konzentration_versagt;
  } else if (endGrund === 'MOTIVATION') {
    // Motivation auf 0 gefallen -> allgemeine Kommentare
    pool = runEndComments.kommentare.allgemein;
  } else if (endGrund === 'UEBERLASTUNG' || endGrund === 'KOLLAPS') {
    pool = runEndComments.kommentare.ueberlastung_kollaps;
  } else if (endGrund === 'BENUTZER') {
    pool = runEndComments.kommentare.manuell_beendet;
  } else {
    pool = runEndComments.kommentare.allgemein;
  }
  
  // Zufälligen Kommentar aus Pool wählen
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Worker-State
 */
let simulationState: SimulationState | null = null;
let rng: Mulberry32 | null = null;
let running: boolean = false;
let lastTickTime: number = 0;
let lastSnapshotTime: number = 0;

const TICK_RATE = 30; // Hz
const TICK_INTERVAL_MS = 1000 / TICK_RATE;
const SNAPSHOT_RATE = 10; // Hz
const SNAPSHOT_INTERVAL_MS = 1000 / SNAPSHOT_RATE;

/**
 * Hauptloop (RequestAnimationFrame in Worker via setTimeout)
 */
function gameLoop(): void {
  if (!running || !simulationState || !rng) return;

  const now = performance.now();
  const deltaMs = now - lastTickTime;

  if (deltaMs >= TICK_INTERVAL_MS) {
    // Update Simulation
    updateSimulation(
      simulationState,
      deltaMs,
      balancingConfig as BalancingConfig,
      rng
    );

    lastTickTime = now;

    // Snapshot senden (10 Hz)
    if (now - lastSnapshotTime >= SNAPSHOT_INTERVAL_MS) {
      sendSnapshot();
      lastSnapshotTime = now;
    }

    // Run-Ende prüfen
    if (simulationState.runEnded) {
      endRun();
      return;
    }
  }

  // Nächster Tick
  setTimeout(gameLoop, TICK_INTERVAL_MS / 2);
}

/**
 * Startet einen neuen Run
 */
function startRun(metaState?: MetaZustand): void {
  const runId = `run-${Date.now()}`;
  const seed = seedFromString(runId);

  simulationState = createSimulationState(
    runId,
    seed,
    balancingConfig as BalancingConfig
  );

  rng = new Mulberry32(seed);
  running = true;
  lastTickTime = performance.now();
  lastSnapshotTime = lastTickTime;

  // Meta-Upgrades anwenden wenn vorhanden
  if (metaState && metaState.freigeschalteteKurse.length > 0) {
    const multipliers = MetaUpgradeService.calculateMultipliers(metaState);
    console.log(`[Worker] Meta-Upgrades aktiv:`, multipliers);
    
    // Upgrades in Simulation-State speichern
    (simulationState as any).metaMultipliers = multipliers;
    
    // Start-AP Bonus
    if (multipliers.startAP > 0) {
      simulationState.ressourcen.AP += multipliers.startAP;
      console.log(`[Worker] Start-Bonus: +${multipliers.startAP} AP`);
    }
  }

  console.log(`[Worker] Run started: ${runId} (seed: ${seed})`);

  // Starte Loop
  gameLoop();

  // Sende initiales Snapshot
  sendSnapshot();
}

/**
 * Beendet aktuellen Run
 */
function endRun(): void {
  if (!simulationState) return;

  running = false;

  // VP berechnen
  const vp = calculateVP(simulationState, balancingConfig as BalancingConfig);

  // Kafkaeske Abschlussnachricht wählen
  const endMessage = getRunEndMessage(simulationState.endGrund || 'UNBEKANNT');

  // Stats erstellen
  const stats: RunStats = {
    id: `stats-${simulationState.runId}`,
    runId: simulationState.runId,
    dauerMs: simulationState.laufzeit,
    endgrund: simulationState.endGrund || 'UNBEKANNT',
    endMessage,
    vpVerdient: vp,
    apGesamt: simulationState.stats.apGesamt,
    maxOP: simulationState.stats.maxOP || 0,
    klicks: simulationState.stats.klicks,
    durchschnittKpm: simulationState.stats.kpmWindow.length,
    maxAufwand: simulationState.stats.maxAufwand,
    minEnergie: simulationState.stats.minEnergie,
    ereignisse: simulationState.stats.ereignisse,
    erstelltAm: Date.now(),
  };

  console.log(`[Worker] Run ended: ${simulationState.endGrund} | VP: ${vp}`);

  // Sende RUN_ENDE Message
  const message: WorkerToUiMessage = {
    type: 'RUN_ENDE',
    grund: simulationState.endGrund as any,
    vp,
    stats,
  };

  postMessage(message);
}

/**
 * Sendet Snapshot an UI
 */
function sendSnapshot(): void {
  if (!simulationState) return;

  const snapshot = createSnapshot(
    simulationState,
    balancingConfig as BalancingConfig
  );

  const message: WorkerToUiMessage = {
    type: 'SNAPSHOT',
    payload: snapshot,
  };

  postMessage(message);
}

/**
 * Message-Handler (UI → Worker)
 */
self.onmessage = (event: MessageEvent<UiToWorkerMessage>) => {
  const msg = event.data;

  switch (msg.type) {
    case 'RUN_STEUERUNG':
      if (msg.cmd === 'START') {
        startRun(msg.metaState);
      } else if (msg.cmd === 'ENDE') {
        if (simulationState) {
          simulationState.runEnded = true;
          simulationState.endGrund = 'BENUTZER';
          endRun();
        }
      } else if (msg.cmd === 'PAUSE') {
        if (simulationState) {
          simulationState.paused = !simulationState.paused;
          console.log(`[Worker] Run ${simulationState.paused ? 'paused' : 'resumed'}`);
        }
      }
      break;

    case 'BENUTZER_KLICK':
      if (simulationState && running) {
        handleClick(simulationState, balancingConfig as BalancingConfig);
      }
      break;

    case 'KAUF_AUTOMATISIERUNG':
      if (simulationState && running) {
        const success = kaufeAutomatisierung(
          simulationState,
          msg.id,
          balancingConfig as BalancingConfig
        );
        if (success) {
          console.log(`[Worker] Bought automation: ${msg.id}`);
        }
      }
      break;

    case 'AKTIVIERE_POWERUP':
      if (simulationState && running) {
        // Power-Up aus Config laden
        const powerUpDef = powerupsData.powerups.find(p => p.id === msg.id);
        if (powerUpDef) {
          const success = aktivierePowerUp(simulationState, powerUpDef);
          if (success) {
            console.log(`[Worker] Activated power-up: ${msg.id}`);
          }
        } else {
          console.warn(`[Worker] Unknown power-up: ${msg.id}`);
        }
      }
      break;

    case 'AKTIVIERE_MASSNAHME':
      if (simulationState && running) {
        // Maßnahme aus Config laden
        const measureDef = measuresData.measures.find(m => m.id === msg.id);
        if (measureDef) {
          const success = aktiviereMassnahme(simulationState, measureDef as any);
          if (success) {
            console.log(`[Worker] Activated measure: ${msg.id}`);
          }
        } else {
          console.warn(`[Worker] Unknown measure: ${msg.id}`);
        }
      }
      break;

    case 'ARCHIVIEREN':
      if (simulationState && running) {
        const success = archivieren(simulationState, msg.amount);
        if (success) {
          console.log(`[Worker] Archiviert: ${msg.amount} AP`);
        }
      }
      break;

    case 'PENALTY_FAILED_STAMP':
      if (simulationState && running) {
        // Nutze handleFailedStamp für konsistente Fehlerbehandlung
        handleFailedStamp(simulationState, msg.wasFumbled);
        
        // -1 OP für fehlgeschlagenen Stempel
        simulationState.ressourcen.OP = Math.max(0, simulationState.ressourcen.OP - 1);
        
        console.log(`[Worker] Failed stamp: -1 OP, motivation penalty ${msg.wasFumbled ? '(fumbled)' : ''}`);
      }
      break;

    case 'SNAPSHOT_ANFORDERN':
      sendSnapshot();
      break;

    default:
      console.warn('[Worker] Unknown message type:', (msg as any).type);
  }
};

// Worker bereit
console.log('[Worker] Game Worker initialized');
