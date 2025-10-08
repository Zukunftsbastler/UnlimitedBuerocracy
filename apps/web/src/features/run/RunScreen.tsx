/**
 * RunScreen – Bürokratie der Unendlichkeit
 * 
 * Haupt-Spielbildschirm während eines aktiven Runs
 */

import { useEffect } from 'react';
import type { SpielSnapshot } from '@game-core/contracts';
import automationsData from '../../config/automations.json';
import powerupsData from '../../config/powerups.json';
import measuresData from '../../config/measures.json';

interface RunScreenProps {
  snapshot: SpielSnapshot | null;
  onClick: () => void;
  onBuyAutomation: (id: string) => void;
  onActivatePowerUp: (id: string) => void;
  onActivateMeasure: (id: string) => void;
  onArchivieren: (amount: number) => void;
  onEndRun: () => void;
}

export function RunScreen({
  snapshot,
  onClick,
  onBuyAutomation,
  onActivatePowerUp,
  onActivateMeasure,
  onArchivieren,
  onEndRun,
}: RunScreenProps) {
  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClick]);
  if (!snapshot) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Lade Simulation...</div>
      </div>
    );
  }

  const { ressourcen, zustaende, arbeitstag, meter, raten } = snapshot;

  // Farbton für visuelles Feedback
  const hue = snapshot.visuell.farbton;
  const bgColor = `hsl(${hue}, 40%, 95%)`;

  return (
    <div
      className="space-y-6"
      style={{ backgroundColor: bgColor, transition: 'background-color 1s ease' }}
    >
      {/* Hauptbereich */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linke Spalte: Ressourcen & Stats */}
        <div className="space-y-4">
          {/* Ressourcen-Karte */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ressourcen
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Aktenpunkte (AP)</span>
                <span className="text-xl font-bold text-blue-600">
                  {Math.floor(ressourcen.AP)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Ordnungspunkte (OP)</span>
                <span className="text-xl font-bold text-green-600">
                  {Math.floor(ressourcen.OP)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Verwaltungspunkte (VP)</span>
                <span className="text-xl font-bold text-purple-600">
                  {Math.floor(ressourcen.VP)}
                </span>
              </div>
            </div>
          </div>

          {/* Raten-Karte */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Produktivität
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Klick-Ertrag:</span>
                <span className="font-mono text-gray-900">
                  {raten.klickErtrag.toFixed(2)} AP
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Idle-Output:</span>
                <span className="font-mono text-gray-900">
                  {raten.dps.toFixed(2)} AP/s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fehlerquote:</span>
                <span className={`font-mono ${
                  raten.fehlerquote > 0.2 ? 'text-red-600' : 
                  raten.fehlerquote > 0.1 ? 'text-orange-600' : 
                  'text-gray-900'
                }`}>
                  {(raten.fehlerquote * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Arbeitstag-Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Arbeitstag
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Vergangen:</span>
                <span className="font-mono text-gray-900">
                  {Math.floor(arbeitstag.vergangenMin)} min
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Verbleibend:</span>
                <span className="font-mono text-gray-900">
                  {Math.floor(arbeitstag.verbleibendMin)} min
                </span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${(arbeitstag.vergangenMin / 480) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mittlere Spalte: Klick-Panel */}
        <div className="space-y-4">
          {/* Haupt-Klickbereich */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Aktenbearbeitung
                </h2>
                <p className="text-sm text-gray-600">
                  Klicken Sie, um Dokumente zu bearbeiten
                </p>
              </div>

              <button
                onClick={onClick}
                className="w-full py-16 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-xl font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95"
                style={{
                  transition: 'all 0.2s ease',
                }}
              >
                🖊️
                <br />
                <span className="text-sm mt-2 block">Stempeln</span>
              </button>

              <div className="text-xs text-gray-500">
                Leertaste oder Mausklick
              </div>
            </div>
          </div>

          {/* Meter */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ordnung & Aufwand
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Klarheit</span>
                  <span className="font-mono text-gray-900">
                    {(meter.klarheit * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${meter.klarheit * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Aufwand</span>
                  <span className="font-mono text-gray-900">
                    {(meter.aufwand * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      meter.aufwand > 0.7
                        ? 'bg-red-500'
                        : meter.aufwand > 0.4
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${meter.aufwand * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rechte Spalte: Zustände & Actions */}
        <div className="space-y-4">
          {/* Zustände */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vitalzustände
            </h3>
            <div className="space-y-3">
              <VitalBar
                label="Energie"
                value={zustaende.energie}
                color="blue"
              />
              <VitalBar
                label="Konzentration"
                value={zustaende.konzentration}
                color="purple"
              />
              <VitalBar
                label="Motivation"
                value={zustaende.motivation}
                color="green"
              />
              <VitalBar
                label="Verwirrung"
                value={zustaende.verwirrung}
                color="yellow"
                inverted
              />
              <VitalBar
                label="Überlastung"
                value={zustaende.ueberlastung}
                color="red"
                inverted
              />
            </div>
          </div>

          {/* Automatisierungen */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Automatisierungen
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {automationsData.automations.map((auto) => {
                const autoSnapshot = snapshot.automatisierungen.find(a => a.id === auto.id);
                const owned = autoSnapshot?.stufe || 0;
                // Verwende die tatsächlichen Kosten aus dem Snapshot (dynamisch berechnet)
                const actualCost = autoSnapshot?.kosten || auto.kosten;
                const canAfford = ressourcen.AP >= actualCost;
                const totalOwned = snapshot.automatisierungen.reduce((sum, a) => sum + a.stufe, 0);
                const isUnlocked = totalOwned >= auto.freischaltung;

                return (
                  <button
                    key={auto.id}
                    onClick={() => onBuyAutomation(auto.id)}
                    disabled={!canAfford || !isUnlocked}
                    className={`w-full px-4 py-3 rounded border text-left text-sm transition-colors ${
                      canAfford && isUnlocked
                        ? 'bg-gray-100 hover:bg-gray-200 border-gray-300'
                        : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{auto.name}</span>
                      <span className="text-xs text-gray-600">{Math.floor(actualCost)} AP</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      +{auto.ertrag.toFixed(1)} AP/s {owned > 0 && `(${owned}x)`}
                    </div>
                    {!isUnlocked && (
                      <div className="text-xs text-red-600 mt-1">
                        Erfordert {auto.freischaltung} Automatisierungen
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Power-Ups */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Power-Ups
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {powerupsData.powerups.map((powerup) => {
                // Check if power-up is on cooldown
                const activePowerUp = snapshot.powerups.find(
                  (p) => p.id === powerup.id
                );
                const isActive = !!activePowerUp;
                const onCooldown = false; // TODO: Track cooldowns

                return (
                  <button
                    key={powerup.id}
                    onClick={() => onActivatePowerUp(powerup.id)}
                    disabled={isActive || onCooldown}
                    className={`w-full px-4 py-3 rounded border text-left text-sm transition-colors ${
                      isActive
                        ? 'bg-green-50 border-green-300 opacity-70 cursor-not-allowed'
                        : onCooldown
                        ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                        : 'bg-amber-50 hover:bg-amber-100 border-amber-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">
                        {powerup.icon} {powerup.name}
                      </span>
                      <span className="text-xs text-gray-600">
                        {powerup.dauerSek}s
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {powerup.beschreibung}
                    </div>
                    {isActive && (
                      <div className="text-xs text-green-600 mt-1">
                        ✓ Aktiv ({Math.floor(activePowerUp!.restMs / 1000)}s)
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Maßnahmen (OP-System) */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ordnungsmaßnahmen
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {measuresData.measures.map((measure) => {
                const canAfford = ressourcen.OP >= measure.kosten;
                const onCooldown = false; // TODO: Track cooldowns

                return (
                  <button
                    key={measure.id}
                    onClick={() => onActivateMeasure(measure.id)}
                    disabled={!canAfford || onCooldown}
                    className={`w-full px-4 py-3 rounded border text-left text-sm transition-colors ${
                      canAfford && !onCooldown
                        ? 'bg-green-50 hover:bg-green-100 border-green-300'
                        : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">
                        {measure.icon} {measure.name}
                      </span>
                      <span className="text-xs text-green-700 font-bold">
                        {measure.kosten} OP
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {measure.beschreibung}
                    </div>
                    {measure.dauer > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        Dauer: {measure.dauer}s • CD: {measure.cooldown}s
                      </div>
                    )}
                    {measure.dauer === 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        Sofort • CD: {measure.cooldown}s
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aktionen */}
          <div className="bg-white p-4 rounded-lg shadow">
            <button
              onClick={onEndRun}
              className="w-full px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded border border-red-300 text-sm font-semibold transition-colors"
            >
              Feierabend (Run beenden)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Vitalbalken-Komponente
 */
function VitalBar({
  label,
  value,
  color,
  inverted = false,
}: {
  label: string;
  value: number;
  color: 'blue' | 'purple' | 'green' | 'yellow' | 'red';
  inverted?: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  const percentage = inverted ? 100 - value * 100 : value * 100;
  const displayValue = value * 100;

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-mono text-gray-900">
          {displayValue.toFixed(0)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}
