/**
 * MetaScreen – Bürokratie der Unendlichkeit
 * 
 * Permanente Upgrades zwischen Runs mit VP
 */

import { useState } from 'react';
import type { MetaZustand } from '@game-core/contracts';

interface MetaScreenProps {
  metaState: MetaZustand;
  onKaufUpgrade: (id: string, kosten: number) => void;
}

interface MetaUpgrade {
  id: string;
  name: string;
  beschreibung: string;
  kosten: number;
  kategorie: 'effizienz' | 'vitalitaet' | 'automation' | 'sonstiges';
  maxStufe: number;
  effekt: string;
  freigeschaltet?: boolean;
}

const UPGRADES: MetaUpgrade[] = [
  {
    id: 'klick_bonus_1',
    name: 'Routinierte Hand',
    beschreibung: 'Erfahrung macht jeden Stempel präziser',
    kosten: 3,
    kategorie: 'effizienz',
    maxStufe: 5,
    effekt: '+10% Klick-Ertrag pro Stufe',
  },
  {
    id: 'chaos_resist_1',
    name: 'Chaosresistenz',
    beschreibung: 'Besser mit Unordnung umgehen',
    kosten: 5,
    kategorie: 'sonstiges',
    maxStufe: 3,
    effekt: '-20% Aufwand-Akkumulation pro Stufe',
  },
  {
    id: 'energie_max_1',
    name: 'Belastbarkeit',
    beschreibung: 'Höhere körperliche Ausdauer',
    kosten: 8,
    kategorie: 'vitalitaet',
    maxStufe: 3,
    effekt: '+10% Max. Energie pro Stufe',
  },
  {
    id: 'konzentration_regen_1',
    name: 'Fokus-Training',
    beschreibung: 'Mentale Disziplin gegen Monotonie',
    kosten: 10,
    kategorie: 'vitalitaet',
    maxStufe: 3,
    effekt: '-25% Konzentrations-Drift pro Stufe',
  },
  {
    id: 'auto_discount_1',
    name: 'Beschaffungskontakte',
    beschreibung: 'Bessere Preise für Automatisierungen',
    kosten: 12,
    kategorie: 'automation',
    maxStufe: 3,
    effekt: '-10% Automatisierungs-Kosten pro Stufe',
  },
  {
    id: 'start_bonus_1',
    name: 'Aktenhaufen',
    beschreibung: 'Beginne jeden Run mit vorgelegten Akten',
    kosten: 15,
    kategorie: 'effizienz',
    maxStufe: 1,
    effekt: 'Start mit 5 AP',
  },
  {
    id: 'dps_bonus_1',
    name: 'Prozessoptimierung I',
    beschreibung: 'Automatisierungen arbeiten effizienter',
    kosten: 20,
    kategorie: 'automation',
    maxStufe: 5,
    effekt: '+15% Idle-Output pro Stufe',
  },
  {
    id: 'motivation_stable_1',
    name: 'Innere Ruhe',
    beschreibung: 'Stabilere Motivation trotz Widrigkeiten',
    kosten: 18,
    kategorie: 'vitalitaet',
    maxStufe: 2,
    effekt: 'Motivation driftet weniger',
  },
];

export function MetaScreen({ metaState, onKaufUpgrade }: MetaScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('alle');
  const [seenUpgrades, setSeenUpgrades] = useState<Set<string>>(new Set());
  
  // Berechne dynamische Kosten basierend auf Kaufanzahl
  const getUpgradeCost = (upgrade: MetaUpgrade) => {
    const gekauft = metaState.freigeschalteteKurse.filter(
      k => k.startsWith(upgrade.id)
    ).length;
    
    // Kosten steigen mit jedem Kauf (Faktor 1.2-1.8 mit Zufallskomponente)
    const costGrowth = 1.4 + Math.random() * 0.4; // 1.4 bis 1.8
    return Math.round(upgrade.kosten * Math.pow(costGrowth, gekauft));
  };
  
  // Prüfe ob Upgrade sichtbar sein sollte
  const isUpgradeVisible = (upgrade: MetaUpgrade) => {
    const cost = getUpgradeCost(upgrade);
    const hasEnoughVP = metaState.verfuegbareVP >= cost * 0.5;
    const wasSeen = seenUpgrades.has(upgrade.id);
    
    // Sichtbar wenn: >= 50% VP ODER bereits einmal gesehen
    if (hasEnoughVP && !wasSeen) {
      setSeenUpgrades(prev => new Set([...prev, upgrade.id]));
      return true;
    }
    
    return hasEnoughVP || wasSeen;
  };

  const kategorien = [
    { id: 'alle', name: 'Alle', icon: '📋' },
    { id: 'effizienz', name: 'Effizienz', icon: '⚡' },
    { id: 'vitalitaet', name: 'Vitalität', icon: '💪' },
    { id: 'automation', name: 'Automation', icon: '⚙️' },
    { id: 'sonstiges', name: 'Sonstiges', icon: '✨' },
  ];

  const filteredUpgrades =
    selectedCategory === 'alle'
      ? UPGRADES
      : UPGRADES.filter((u) => u.kategorie === selectedCategory);

  const kannKaufen = (upgrade: MetaUpgrade) => {
    return metaState.verfuegbareVP >= upgrade.kosten;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Meta-Progression</h2>
            <p className="text-gray-600">Permanente Upgrades zwischen Runs</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Verfügbare VP</div>
            <div className="text-3xl font-bold text-purple-600">
              {metaState.verfuegbareVP}
            </div>
            <div className="text-xs text-gray-500">
              ({metaState.gesamtVP} gesamt verdient)
            </div>
          </div>
        </div>

        {/* Rang-Anzeige */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Aktueller Rang</div>
              <div className="text-xl font-bold text-gray-900">
                {metaState.rangTitel}
              </div>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
      </div>

      {/* Kategorien-Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-2 overflow-x-auto">
          {kategorien.map((kat) => (
            <button
              key={kat.id}
              onClick={() => setSelectedCategory(kat.id)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === kat.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {kat.icon} {kat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Upgrades-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUpgrades.filter(isUpgradeVisible).map((upgrade) => {
          // Zähle wie oft dieses Upgrade bereits gekauft wurde
          const gekauft = metaState.freigeschalteteKurse.filter(
            k => k.startsWith(upgrade.id)
          ).length;
          const istMaximal = gekauft >= upgrade.maxStufe;
          const currentCost = getUpgradeCost(upgrade);
          const canAfford = metaState.verfuegbareVP >= currentCost && !istMaximal;

          return (
            <div
              key={upgrade.id}
              className={`bg-white rounded-lg shadow p-6 border-2 transition-all ${
                istMaximal
                  ? 'border-green-300 bg-green-50'
                  : canAfford
                  ? 'border-purple-300 hover:border-purple-500'
                  : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{upgrade.name}</h3>
                  {gekauft > 0 && (
                    <div className="text-xs text-purple-600 font-semibold">
                      Stufe {gekauft}/{upgrade.maxStufe}
                    </div>
                  )}
                </div>
                <span className="text-2xl">
                  {upgrade.kategorie === 'effizienz' && '⚡'}
                  {upgrade.kategorie === 'vitalitaet' && '💪'}
                  {upgrade.kategorie === 'automation' && '⚙️'}
                  {upgrade.kategorie === 'sonstiges' && '✨'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">{upgrade.beschreibung}</p>

              <div className="bg-purple-50 rounded p-2 mb-3">
                <div className="text-xs text-purple-700 font-semibold">EFFEKT</div>
                <div className="text-sm text-purple-900">{upgrade.effekt}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {istMaximal ? (
                    <span className="text-green-600 font-semibold">✓ Maximal</span>
                  ) : (
                    <>Max. Stufe: {upgrade.maxStufe}</>
                  )}
                </div>
                <button
                  onClick={() => onKaufUpgrade(upgrade.id, currentCost)}
                  disabled={!canAfford}
                  className={`px-4 py-2 rounded font-semibold transition-colors ${
                    istMaximal
                      ? 'bg-green-200 text-green-700 cursor-not-allowed'
                      : canAfford
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {istMaximal ? 'Maximal' : `${currentCost} VP`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUpgrades.length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <div className="text-4xl mb-4">📋</div>
          <div className="text-gray-600">
            Keine Upgrades in dieser Kategorie verfügbar
          </div>
        </div>
      )}

      {/* Info-Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          ℹ️ Hinweis zu Meta-Upgrades
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Alle Upgrades sind <strong>permanent</strong> und gelten für alle zukünftigen Runs</li>
          <li>VP können nur durch Abschluss von Runs verdient werden</li>
          <li>Höhere Ränge schalten weitere Upgrades frei</li>
          <li>Upgrades können mehrfach gekauft werden (bis Max. Stufe)</li>
        </ul>
      </div>
    </div>
  );
}
