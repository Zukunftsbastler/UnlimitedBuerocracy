/**
 * Run-Ende-Modal – Bürokratie der Unendlichkeit
 * 
 * Zeigt Statistiken und VP-Belohnung am Ende eines Runs
 */

import type { RunStats } from '@game-core/contracts';

interface RunEndModalProps {
  stats: RunStats;
  onContinue: () => void;
}

export function RunEndModal({ stats, onContinue }: RunEndModalProps) {
  const dauerMin = Math.floor(stats.dauerMs / 60000);
  const dauerSek = Math.floor((stats.dauerMs % 60000) / 1000);

  const endgrundTexte = {
    ZEIT: {
      titel: 'Feierabend!',
      text: 'Der Arbeitstag ist zu Ende.',
      farbe: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-300',
    },
    UEBERLASTUNG: {
      titel: 'Überlastung',
      text: 'Sie sind zusammengebrochen. Eine Pause war längst überfällig.',
      farbe: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-300',
    },
    KOLLAPS: {
      titel: 'Systemkollaps',
      text: 'Das Chaos hat überhandgenommen. Die Verwaltung bricht zusammen.',
      farbe: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-300',
    },
    BENUTZER: {
      titel: 'Vorzeitiger Feierabend',
      text: 'Sie haben den Arbeitstag vorzeitig beendet.',
      farbe: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-300',
    },
  };

  const endgrund = endgrundTexte[stats.endgrund as keyof typeof endgrundTexte] || endgrundTexte.BENUTZER;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`${endgrund.bg} ${endgrund.border} border-b-4 px-6 py-4 sticky top-0`}>
          <h2 className={`text-2xl font-bold ${endgrund.farbe} mb-1`}>
            {endgrund.titel}
          </h2>
          <p className="text-sm text-gray-700">{endgrund.text}</p>
        </div>

        {/* Content - scrollbar */}
        <div className="px-6 py-4 space-y-4">
          {/* Kafkaeske Message */}
          {stats.endMessage && (
            <div className="bg-gray-100 border-l-4 border-gray-400 p-4 rounded">
              <p className="text-sm text-gray-700 italic leading-relaxed">
                „{stats.endMessage}"
              </p>
            </div>
          )}

          {/* VP-Belohnung */}
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 text-center">
            <div className="text-xs text-purple-600 font-semibold mb-1">
              VERWALTUNGSPUNKTE VERDIENT
            </div>
            <div className="text-4xl font-bold text-purple-600 mb-1">
              +{stats.vpVerdient} VP
            </div>
            <div className="text-xs text-gray-600">
              Für permanente Upgrades verwenden
            </div>
          </div>

          {/* Leistungskennzahlen */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Leistungskennzahlen
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-600">Dauer</div>
                <div className="text-base font-bold text-gray-900">
                  {dauerMin}:{dauerSek.toString().padStart(2, '0')} min
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-600">Klicks</div>
                <div className="text-base font-bold text-gray-900">
                  {stats.klicks}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-600">Aktenpunkte</div>
                <div className="text-base font-bold text-gray-900">
                  {Math.floor(stats.apGesamt)}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-600">Max. Ordnungspunkte</div>
                <div className="text-base font-bold text-gray-900">
                  {Math.floor(stats.maxOP)}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-600">Ø Klicks/Min</div>
                <div className="text-base font-bold text-gray-900">
                  {stats.durchschnittKpm.toFixed(1)}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-600">Min. Energie</div>
                <div className="text-base font-bold text-gray-900">
                  {(stats.minEnergie * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - sticky */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 sticky bottom-0">
          <button
            onClick={onContinue}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-colors"
          >
            Weiter
          </button>
        </div>
      </div>
    </div>
  );
}
