/**
 * StatsScreen – Bürokratie der Unendlichkeit
 * 
 * Zeigt Run-Historie und Gesamtstatistiken
 */

import { useState, useEffect } from 'react';
import type { RunStats } from '@game-core/contracts';
import { db } from '../../data/db';

export function StatsScreen() {
  const [runs, setRuns] = useState<RunStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Runs aus DB laden
  useEffect(() => {
    const loadRuns = async () => {
      try {
        const allRuns = await db.runstats.reverse().limit(50).toArray();
        setRuns(allRuns);
      } catch (error) {
        console.error('Failed to load runs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRuns();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Lade Statistiken...</div>
      </div>
    );
  }

  // Gesamtstatistiken berechnen
  const totalVP = runs.reduce((sum, r) => sum + r.vpVerdient, 0);
  const totalKlicks = runs.reduce((sum, r) => sum + r.klicks, 0);
  const totalDauer = runs.reduce((sum, r) => sum + r.dauerMs, 0);
  const avgVP = runs.length > 0 ? Math.floor(totalVP / runs.length) : 0;
  const avgDauer = runs.length > 0 ? Math.floor(totalDauer / runs.length / 60000) : 0;

  // Beste Runs
  const bestVPRun = runs.length > 0 ? runs.reduce((best, r) => r.vpVerdient > best.vpVerdient ? r : best) : null;
  const bestKlicksRun = runs.length > 0 ? runs.reduce((best, r) => r.klicks > best.klicks ? r : best) : null;

  const endgrundColors = {
    ZEIT: 'bg-blue-100 text-blue-800',
    UEBERLASTUNG: 'bg-orange-100 text-orange-800',
    KOLLAPS: 'bg-red-100 text-red-800',
    BENUTZER: 'bg-gray-100 text-gray-800',
  };

  const endgrundTexte = {
    ZEIT: '⏰ Zeit',
    UEBERLASTUNG: '😵 Überlastung',
    KOLLAPS: '💥 Kollaps',
    BENUTZER: '🚪 Benutzer',
  };

  return (
    <div className="space-y-6">
      {/* Übersicht */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Statistiken</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-semibold">GESAMT RUNS</div>
            <div className="text-3xl font-bold text-purple-900">{runs.length}</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-semibold">GESAMT VP</div>
            <div className="text-3xl font-bold text-blue-900">{totalVP}</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-semibold">Ø VP/RUN</div>
            <div className="text-3xl font-bold text-green-900">{avgVP}</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 font-semibold">Ø DAUER</div>
            <div className="text-3xl font-bold text-yellow-900">{avgDauer}m</div>
          </div>
        </div>
      </div>

      {/* Rekorde */}
      {runs.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🏆 Rekorde</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bestVPRun && (
              <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-semibold mb-2">
                  HÖCHSTE VP
                </div>
                <div className="text-2xl font-bold text-purple-900 mb-1">
                  {bestVPRun.vpVerdient} VP
                </div>
                <div className="text-xs text-gray-600">
                  {Math.floor(bestVPRun.dauerMs / 60000)} Min · {bestVPRun.klicks} Klicks
                </div>
              </div>
            )}
            
            {bestKlicksRun && (
              <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-semibold mb-2">
                  MEISTE KLICKS
                </div>
                <div className="text-2xl font-bold text-blue-900 mb-1">
                  {bestKlicksRun.klicks} Klicks
                </div>
                <div className="text-xs text-gray-600">
                  {bestKlicksRun.vpVerdient} VP · {Math.floor(bestKlicksRun.dauerMs / 60000)} Min
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <div>Gesamt-Klicks: <strong>{totalKlicks.toLocaleString()}</strong></div>
            <div>Gesamt-Spielzeit: <strong>{Math.floor(totalDauer / 60000)} Minuten</strong></div>
          </div>
        </div>
      )}

      {/* Run-Historie */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Run-Historie</h3>
        
        {runs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <div className="text-gray-600">
              Noch keine Runs abgeschlossen
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Starten Sie Ihren ersten Arbeitstag!
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {runs.map((run, index) => {
              const datum = new Date(run.erstelltAm);
              const dauerMin = Math.floor(run.dauerMs / 60000);
              const dauerSek = Math.floor((run.dauerMs % 60000) / 1000);
              const endgrundKey = run.endgrund as keyof typeof endgrundTexte;
              
              return (
                <div
                  key={run.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-gray-400">
                        #{runs.length - index}
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          {datum.toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                          {' '}
                          {datum.toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          Dauer: {dauerMin}:{dauerSek.toString().padStart(2, '0')} min
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        +{run.vpVerdient} VP
                      </div>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          endgrundColors[endgrundKey] || endgrundColors.BENUTZER
                        }`}
                      >
                        {endgrundTexte[endgrundKey] || 'Unbekannt'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs">
                      <span className="text-gray-500">Klicks:</span>{' '}
                      <strong>{run.klicks}</strong>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">KPM:</span>{' '}
                      <strong>{run.durchschnittKpm.toFixed(1)}</strong>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">AP:</span>{' '}
                      <strong>{Math.floor(run.apGesamt)}</strong>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">Max OP:</span>{' '}
                      <strong>{Math.floor(run.maxOP)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          ℹ️ Über Statistiken
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Die letzten 50 Runs werden angezeigt</li>
          <li>VP werden bei Run-Abschluss vergeben</li>
          <li>KPM = Klicks pro Minute (Durchschnitt)</li>
          <li>Rekorde werden automatisch aktualisiert</li>
        </ul>
      </div>
    </div>
  );
}
