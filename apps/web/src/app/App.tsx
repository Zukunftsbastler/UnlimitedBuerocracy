/**
 * App – Bürokratie der Unendlichkeit
 * 
 * Hauptkomponente mit Tab-Navigation und Meta-Progression
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  SpielSnapshot,
  UiToWorkerMessage,
  WorkerToUiMessage,
  MetaZustand,
  RunStats,
} from '@game-core/contracts';
import { RunScreen } from '../features/run/RunScreen';
import { RunEndModal } from '../features/run/RunEndModal';
import { MetaScreen } from '../features/meta/MetaScreen';
import { StatsScreen } from '../features/stats/StatsScreen';
import { audioService } from '../services/audio/AudioService';
import { db } from '../data/db';

// Import stamp images for logo
import Stempel01 from '../assets/stamps/approved/Stempel01.png';
import Stempel02 from '../assets/stamps/approved/Stempel02.png';
import Stempel03 from '../assets/stamps/approved/Stempel03.png';
import Stempel04 from '../assets/stamps/approved/Stempel04.png';
import Stempel05 from '../assets/stamps/approved/Stempel05.png';
import Stempel06 from '../assets/stamps/approved/Stempel06.png';
import Stempel07 from '../assets/stamps/approved/Stempel07.png';
import Stempel08 from '../assets/stamps/approved/Stempel08.png';
import Stempel09 from '../assets/stamps/approved/Stempel09.png';
import Stempel10 from '../assets/stamps/approved/Stempel10.png';

const STAMP_IMAGES = [
  Stempel01, Stempel02, Stempel03, Stempel04, Stempel05,
  Stempel06, Stempel07, Stempel08, Stempel09, Stempel10,
];

type TabType = 'run' | 'meta' | 'stats';

interface StampLogo {
  image: string;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

export function App() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [snapshot, setSnapshot] = useState<SpielSnapshot | null>(null);
  const [runActive, setRunActive] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('run');
  const [runEndStats, setRunEndStats] = useState<RunStats | null>(null);
  const [stampCounter, setStampCounter] = useState(0); // Trigger für neuen Stempel
  
  // Meta-State (persistent)
  const [metaState, setMetaState] = useState<MetaZustand>({
    rang: 1,
    rangTitel: 'Sachbearbeiter',
    gesamtVP: 0,
    verfuegbareVP: 0,
    freigeschalteteKurse: [],
    freigeschaltetePowerUps: [],
    privileges: [],
  });

  // Meta-State aus DB laden
  useEffect(() => {
    const loadMetaState = async () => {
      try {
        const save = await db.saves.get('primary');
        if (save?.metaZustand) {
          setMetaState(save.metaZustand);
        }
      } catch (error) {
        console.error('Failed to load meta state:', error);
      }
    };

    loadMetaState();
  }, []);

  // Meta-State in DB speichern
  const saveMetaState = useCallback(async (newMetaState: MetaZustand) => {
    try {
      await db.saves.put({
        id: 'primary',
        erstelltAm: Date.now(),
        aktualisiertAm: Date.now(),
        runZustand: '',
        metaZustand: newMetaState,
        version: '1.0.0',
      });
      setMetaState(newMetaState);
    } catch (error) {
      console.error('Failed to save meta state:', error);
    }
  }, []);

  // Worker initialisieren
  useEffect(() => {
    const gameWorker = new Worker(
      new URL('../workers/game.worker.ts', import.meta.url),
      { type: 'module' }
    );

    gameWorker.onmessage = (event: MessageEvent<WorkerToUiMessage>) => {
      const msg = event.data;

      switch (msg.type) {
        case 'SNAPSHOT':
          setSnapshot(msg.payload);
          break;

        case 'RUN_ENDE':
          setRunActive(false);
          console.log(`[Worker] Run ended: ${msg.grund} | VP: ${msg.vp}`);
          audioService.onRunEnd();
          
          // VP zu Meta-State hinzufügen
          const newMetaState = {
            ...metaState,
            gesamtVP: metaState.gesamtVP + msg.vp,
            verfuegbareVP: metaState.verfuegbareVP + msg.vp,
          };
          saveMetaState(newMetaState);
          
          // Run-Stats in DB speichern
          db.runstats.add(msg.stats).catch(err => {
            console.error('Failed to save run stats:', err);
          });
          
          // Neuen Stempel generieren
          setStampCounter(prev => prev + 1);
          
          // Run-End-Modal anzeigen
          setRunEndStats(msg.stats);
          break;

        case 'TEXT':
          console.log('[Content]', msg.eintrag.text);
          break;

        case 'EVENT':
          console.log('[Event]', msg.event.titel);
          audioService.onAudit();
          break;

        case 'HINWEIS':
          console.log(`[${msg.stufe.toUpperCase()}]`, msg.text);
          break;
      }
    };

    setWorker(gameWorker);

    return () => {
      gameWorker.terminate();
    };
  }, [metaState, saveMetaState]);

  // Audio initialisieren
  const initAudio = useCallback(async () => {
    await audioService.init();
  }, []);

  // Run starten
  const handleStartRun = useCallback(() => {
    if (!worker) return;

    initAudio();

    const msg: UiToWorkerMessage = {
      type: 'RUN_STEUERUNG',
      cmd: 'START',
      metaState, // Meta-State mitschicken für Upgrades
    };

    worker.postMessage(msg);
    setRunActive(true);
    setActiveTab('run');
    audioService.onRunStart();
  }, [worker, initAudio, metaState]);

  // Run beenden
  const handleEndRun = useCallback(() => {
    if (!worker) return;

    const msg: UiToWorkerMessage = {
      type: 'RUN_STEUERUNG',
      cmd: 'ENDE',
    };

    worker.postMessage(msg);
  }, [worker]);

  // Klick
  const handleClick = useCallback(() => {
    if (!worker || !runActive) return;

    const msg: UiToWorkerMessage = {
      type: 'BENUTZER_KLICK',
      zeit: Date.now(),
    };

    worker.postMessage(msg);
    audioService.playSfx('click');
  }, [worker, runActive]);

  // Automatisierung kaufen
  const handleBuyAutomation = useCallback(
    (id: string) => {
      if (!worker || !runActive) return;

      const msg: UiToWorkerMessage = {
        type: 'KAUF_AUTOMATISIERUNG',
        id,
      };

      worker.postMessage(msg);
      audioService.playUi('purchase');
    },
    [worker, runActive]
  );

  // Power-Up aktivieren
  const handleActivatePowerUp = useCallback(
    (id: string) => {
      if (!worker || !runActive) return;

      const msg: UiToWorkerMessage = {
        type: 'AKTIVIERE_POWERUP',
        id,
      };

      worker.postMessage(msg);
      audioService.onPowerUp(id);
    },
    [worker, runActive]
  );

  // Archivieren (AP → OE)
  const handleArchivieren = useCallback(
    (amount: number) => {
      if (!worker || !runActive) return;

      const msg: UiToWorkerMessage = {
        type: 'ARCHIVIEREN',
        amount,
      };

      worker.postMessage(msg);
      audioService.playUi('purchase');
    },
    [worker, runActive]
  );

  // Failed stamp penalty
  const handleFailedStamp = useCallback(
    (wasFumbled: boolean) => {
      if (!worker || !runActive) return;

      const msg: UiToWorkerMessage = {
        type: 'PENALTY_FAILED_STAMP',
        wasFumbled,
      };

      worker.postMessage(msg);
    },
    [worker, runActive]
  );

  // Maßnahme aktivieren
  const handleActivateMeasure = useCallback(
    (id: string) => {
      if (!worker || !runActive) return;

      const msg: UiToWorkerMessage = {
        type: 'AKTIVIERE_MASSNAHME',
        id,
      };

      worker.postMessage(msg);
      audioService.playUi('stamp');
    },
    [worker, runActive]
  );

  // Meta-Upgrade kaufen
  const handleKaufUpgrade = useCallback(
    (id: string, kosten: number) => {
      if (metaState.verfuegbareVP < kosten) {
        console.log('Nicht genug VP');
        return;
      }

      // Upgrade zu freigeschalteteKurse hinzufügen
      const newMetaState = {
        ...metaState,
        verfuegbareVP: metaState.verfuegbareVP - kosten,
        freigeschalteteKurse: [...metaState.freigeschalteteKurse, id],
      };

      saveMetaState(newMetaState);
      audioService.playUi('purchase');
      console.log(`[Meta] Gekauft: ${id} | Verbleibend: ${newMetaState.verfuegbareVP} VP`);
    },
    [metaState, saveMetaState]
  );

  // Generiere zufälligen Stempel basierend auf stampCounter
  const stampLogo: StampLogo = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * STAMP_IMAGES.length);
    const rotation = -15 + Math.random() * 30; // -15 bis +15 Grad
    const offsetX = -15 + Math.random() * 30; // Horizontale Variation
    const offsetY = -10 + Math.random() * 20; // Vertikale Variation
    
    return {
      image: STAMP_IMAGES[randomIndex],
      rotation,
      offsetX,
      offsetY,
    };
  }, [stampCounter]); // Ändert sich mit stampCounter

  // Run-End-Modal schließen
  const handleCloseRunEnd = useCallback(() => {
    setRunEndStats(null);
  }, []);

  // Reset/Neustart
  const handleReset = useCallback(async () => {
    if (!confirm('Möchten Sie wirklich alle Fortschritte löschen und neu beginnen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
      return;
    }
    
    try {
      await db.reset();
      // Reload page
      window.location.reload();
    } catch (error) {
      console.error('Reset failed:', error);
      alert('Reset fehlgeschlagen. Bitte versuchen Sie es erneut.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="relative flex items-center gap-4">
              {/* Stempel-Logo - links */}
              <div
                className="pointer-events-none flex-shrink-0"
                style={{
                  position: 'relative',
                  left: `${stampLogo.offsetX}px`,
                  top: `${stampLogo.offsetY}px`,
                  transform: `rotate(${stampLogo.rotation}deg)`,
                  opacity: 0.85,
                  zIndex: 10,
                }}
              >
                <img
                  src={stampLogo.image}
                  alt="Stempel"
                  className="w-32 h-32 object-contain"
                  style={{
                    filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.3))',
                  }}
                />
              </div>
              
              {/* Titel - leicht nach rechts versetzt */}
              <div style={{ marginLeft: '-20px' }}>
                <h1 className="text-2xl font-bold text-gray-900">
                  Bürokratie der Unendlichkeit
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Ein kafkaeskes Incremental-Game
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                title="Spiel zurücksetzen"
              >
                🔄 Reset
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-600">Verwaltungspunkte</div>
                <div className="text-2xl font-bold text-purple-600">
                  {metaState.verfuegbareVP} VP
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('run')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'run'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Run
            </button>
            <button
              onClick={() => setActiveTab('meta')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'meta'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Meta-Progression
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'stats'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Statistiken
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'run' && (
          <>
            {!runActive ? (
              /* Start-Screen */
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-6 max-w-2xl">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">
                      Willkommen im Dezernat
                    </h2>
                    <p className="text-lg text-gray-600">
                      Beginnen Sie Ihren Arbeitstag und sammeln Sie Verwaltungspunkte.
                    </p>
                  </div>

                  <button
                    onClick={handleStartRun}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors text-lg"
                  >
                    Arbeitstag beginnen
                  </button>

                  <div className="mt-8 text-sm text-gray-500 space-y-1 text-left bg-white p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Spielanleitung:</h3>
                    <p>• Klicken Sie (oder Leertaste), um Aktenpunkte zu sammeln</p>
                    <p>• Kaufen Sie Automatisierungen für passiven Output</p>
                    <p>• Aktivieren Sie Power-Ups bei Bedarf</p>
                    <p>• Achten Sie auf Energie, Konzentration und Überlastung</p>
                    <p>• Der Run endet nach 480 Minuten oder bei Überlastung</p>
                    <p>• Verdienen Sie VP für permanente Meta-Upgrades</p>
                  </div>

                  {metaState.gesamtVP > 0 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="text-sm text-purple-900">
                        <strong>Bisheriger Fortschritt:</strong> {metaState.gesamtVP} VP gesamt verdient
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Run-Screen */
              <RunScreen
                snapshot={snapshot}
                onClick={handleClick}
                onBuyAutomation={handleBuyAutomation}
                onActivatePowerUp={handleActivatePowerUp}
                onActivateMeasure={handleActivateMeasure}
                onArchivieren={handleArchivieren}
                onEndRun={handleEndRun}
                onFailedStamp={handleFailedStamp}
              />
            )}
          </>
        )}

        {activeTab === 'meta' && (
          <MetaScreen
            metaState={metaState}
            onKaufUpgrade={handleKaufUpgrade}
          />
        )}

        {activeTab === 'stats' && <StatsScreen />}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-gray-500 border-t border-gray-200">
        <p>
          Alle Angaben ohne Gewähr. Keine Haftung für Produktivitätsverlust.
        </p>
        <p className="mt-1">Version 1.0.0 • Prototype</p>
      </footer>

      {/* Run-End-Modal */}
      {runEndStats && (
        <RunEndModal stats={runEndStats} onContinue={handleCloseRunEnd} />
      )}
    </div>
  );
}
