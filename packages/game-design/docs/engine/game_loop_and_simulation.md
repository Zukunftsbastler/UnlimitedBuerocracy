Game Loop & Simulation – Bürokratie der Unendlichkeit

Ablagepfad: packages/game-design/docs/engine/game_loop_and_simulation.md
Version: 1.0

⸻

🎯 Ziel

Diese Dokumentation beschreibt den Simulationskern (Engine) von Bürokratie der Unendlichkeit.
Sie legt fest, wie Zustände, Zeit, Ressourcen und Systemereignisse im Spiel verarbeitet werden, und bildet die Grundlage für den deterministischen Game Loop im Web Worker.

Ziel ist eine saubere Trennung von Simulation, UI und Persistenz, um das Verhalten reproduzierbar, testbar und erweiterbar zu halten.

⸻

🧩 Überblick: Engine-Architektur

Die Engine läuft vollständig in einem Web Worker und kommuniziert mit der UI über typed Messages (DTOs).
Sie ist in Systeme und Komponenten gegliedert (ECS-Muster).

Hauptelemente:
	1.	World State – gesamte Spielwelt (Ressourcen, Zustände, Laufzeit, Automatisierungen, Power-Ups).
	2.	Systems – unabhängige Verarbeitungseinheiten für Energie, Klicks, Automatisierung etc.
	3.	Scheduler – orchestriert Update-Takte (Tickrate standardmäßig 30 Hz).
	4.	Randomness – deterministischer PRNG (Seed pro Run).
	5.	EventBus – publish/subscribe für interne Systemmeldungen.

⸻

🔁 Game Loop – Ablaufdiagramm

Initialize World → Run Start → [Loop Begin]
  ├─ InputSystem        → verarbeitet Klicks, Befehle
  ├─ EnergySystem       → aktualisiert Zustände (Energie, Motivation, etc.)
  ├─ AutomationSystem   → erzeugt passiven Output (AP/s)
  ├─ DocumentSystem     → generiert Akten, Fortschritt, Chaos
  ├─ PowerUpSystem      → wendet temporäre Effekte an
  ├─ VisualFeedback     → berechnet Farbton, Wobble, Klarheit
  ├─ TimeSystem         → Arbeitstag-Countdown, Run-Ende
  ├─ OutputCollector    → berechnet Tick-Output (AP, OE, Aufwand)
  └─ SnapshotEmitter    → sendet aktuelles SpielSnapshot an UI
[Loop End]

Tickrate: 30 pro Sekunde (konfigurierbar).
Alle Berechnungen sind deterministisch und skalieren mit deltaTime.

⸻

⚙️ Kernkomponenten

1. Ressourcenverwaltung

interface Ressourcen {
  AP: number;   // Aktenpunkte – Grundwährung pro Klick/Automation
  OE: number;   // Ordnungseinheiten – Fortschrittsmaß
  VP: number;   // Verwaltungspunkte – Meta-Währung
  Aufwand: number; // Chaos-Gegengewicht
}

	•	AP steigen aktiv (Klicks) oder passiv (Automation).
	•	OE steigen mit erledigten Akten (qualitativ).
	•	VP werden nur am Ende des Runs vergeben.
	•	Aufwand wächst exponentiell mit Aktivität → steigert Verwirrung.

⸻

2. Zustände (Vitalsystem)

interface Zustaende {
  energie: number;       // 0..1
  konzentration: number; // 0..1
  motivation: number;    // 0..1
  verwirrung: number;    // 0..1
  ueberlastung: number;  // 0..1
}

Wechselwirkungen:
	•	Energie sinkt pro Klick und Zeit (linear mit „EnergieVerbrauchProKlick“).
	•	Konzentration driftet über Zeit nach unten; beeinflusst Klick-Effizienz.
	•	Motivation steigt leicht mit Erfolgen, fällt mit Fehlklicks oder Überlastung.
	•	Verwirrung korreliert mit Aufwand – steigt bei Chaos.
	•	Überlastung entsteht, wenn Kombination aus Energie < 0.2 und Aufwand > 0.8.

Effekte:
	•	Bei hoher Überlastung → Klickverzögerung und Farbverschiebung (visuelles Feedback).
	•	Bei zu hoher Verwirrung → zufällige Aktionen (Simulationsrauschen).

⸻

3. Run-Zeitsteuerung

interface ArbeitstagInfo {
  verbleibendMin: number;
  vergangenMin: number;
}

	•	Standarddauer: 480 Minuten (8 Stunden) → skaliert real auf 10–20 Minuten Spielzeit.
	•	Fortschritt pro Tick: deltaMinutes = (realDeltaMs / 60000) * Zeitskalierung.
	•	Endbedingung: Zeitablauf oder kritische Zustände (ueberlastung ≥ 1).

⸻

4. Automationssystem

Automatisierungen erzeugen AP/Sekunde (Idle-Output).
Jede hat eigene Effizienz, Kosten und Aufwandsauswirkung.

interface AutomationSnapshot {
  id: string;
  stufe: number;
  output: number; // AP/s
}

Formel:
output = basis * stufe * (1 + effizienzBonus - verwirrungsMalus)

Automationen erhöhen passiv den Aufwand (Chaosdruck) → balanciert durch Energie & Kurse.

⸻

5. PowerUp-System

Power-Ups sind temporäre Buffs, die einen oder mehrere Parameter verändern.

Beispiel:

{
  id: 'kaffee',
  effekt: { energie: +0.2, konzentration: +0.1 },
  dauerSek: 30,
  cooldownSek: 120
}

Effekte werden linear interpoliert (Ease-Out) und stapeln sich additiv.

⸻

6. Chaos- & Klarheitssystem

Dieses System steuert visuelle Rückmeldungen und symbolisiert den mentalen Zustand.
	•	Klarheit (0–1): steigt mit Ordnungseinheiten, sinkt mit Aufwand.
	•	Aufwand: erzeugt „Noise“ (visuell und rechnerisch).
Formel: aufwand = max(0, aufwand + (extraOutput * chaosFaktor))

Visualisierung: Farbton (Hue) und Screen-Wobble.

Klarheit	Farbe	Wobble	Bedeutung
1.0	Blau	0	Ruhe
0.5	Gelb	0.3	Müdigkeit
0.0	Rot	0.8	Kollaps


⸻

7. Snapshot-System

Alle 1000ms sendet der Worker ein vollständiges SpielSnapshot an die UI.

interface SpielSnapshot {
  zeit: number;
  ressourcen: Ressourcen;
  raten: Raten;
  meter: Meter;
  arbeitstag: ArbeitstagInfo;
  zustaende: Zustaende;
  automatisierungen: AutomationSnapshot[];
  powerups: PowerupSnapshot[];
  visuell: VisualSnapshot;
}

Snapshots dienen zur Live-Visualisierung, nicht zur Speicherung (SaveGame nutzt Serialisierung).

⸻

⚖️ Balancing-Mechanismen

Variable	Beschreibung	Wirkung
energieVerbrauchProKlick	0.002	limitiert Klickrate
energieRegenProSek	0.001	Idle-Regeneration
konzentrationsDrift	0.0005	senkt Klarheit über Zeit
aufwandDämpfung	0.9	mildert Chaos bei hoher Effizienz
vpZeitFaktor	0.002	steigert VP mit Run-Dauer


⸻

🧠 Ereignisse & Triggers
	•	Zustandswarnung: bei < 0.3 Energie oder > 0.7 Verwirrung.
	•	Audit-Ereignis: zufällig nach > 50% Run-Zeit – erzeugt Zusatzaufwand.
	•	Pausen-Event: kann Energie/Motivation regenerieren, aber Zeit verbrauchen.
	•	Feierabend: tritt automatisch ein, wenn Zeit abgelaufen oder Überlastung = 1.

⸻

🔄 Run-Ende und Meta-Berechnung

Bei Run-Ende:
	1.	VP-Berechnung: vp = minProRun + (laufzeitSek * zeitFaktor * klarheitBonus)
	2.	Speicherung im RunStats.
	3.	Reset aller temporären Power-Ups.
	4.	Erhöhung des Prestige-Zählers.

Meta-Werte (Skilltree, Kurse, Boni) werden im metaZustand persistiert.

⸻

🧾 Zusammenfassung

Der Game Loop ist deterministisch, modular und vollständig konfigurierbar.
Ziel ist es, sowohl aktive (Klick-) als auch passive (Idle-)Spielweisen zu ermöglichen, ohne das Gleichgewicht zwischen „Ordnung“ und „Überforderung“ zu verlieren.

Die Engine modelliert Bürokratie als energetisch erschöpfenden, aber belohnend strukturierenden Prozess: Fortschritt ist nur durch zunehmende Selbstverwaltung erreichbar.

⸻

✅ Nächste Schritte
	1.	Implementierung der Systeme im Worker (EnergySystem, AutomationSystem, ChaosSystem).
	2.	Integration des deterministischen RNG für Testbarkeit.
	3.	Einbau des Snapshot-Emitters in UI.
	4.	Erstellung erster Unit-Tests mit festem Seed.
	5.	Visualisierung von Klarheit/Wobble im Canvas-Renderer.