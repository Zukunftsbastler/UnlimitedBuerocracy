Zustandsparameter & Regelkreise – Bürokratie der Unendlichkeit

Ablagepfad: packages/game-design/docs/balancing/zustandsparameter_und_regelkreise.md
Version: 1.0

⸻

🎯 Ziel

Dieses Dokument beschreibt die Funktionslogik, Wechselwirkungen und Balancing-Regeln der zentralen Zustandsparameter im Kernspiel Bürokratie der Unendlichkeit.

Die Zustände Energie, Konzentration, Motivation, Klarheit, Aufwand, Verwirrung und Überlastung bilden das psychophysische Rückgrat des Spiels – sie steuern alle Produktions-, Kontroll- und Run-Ende-Mechaniken.

⸻

🧩 1. Grundidee

Jeder Zustand repräsentiert einen Aspekt bürokratischer Leistungsfähigkeit. Sie beeinflussen sich gegenseitig, sind dynamisch, und ihre Werte bestimmen, wie produktiv, effizient oder fehleranfällig der Spieler arbeitet.

Prinzip:

Zustände sind keine kosmetischen Anzeigen, sondern aktive Multiplikatoren, die Produktivität, Fehlerquote und Chaos direkt beeinflussen.

⸻

⚙️ 2. Zustandsübersicht

Zustand	Bedeutung	Funktion	Sichtbare Wirkung
Energie	körperliche Belastbarkeit	beeinflusst Klickleistung, Regeneration	Stempelfrequenz, Tempoeffekt
Konzentration	mentale Schärfe	steuert Klarheit, Fehlerquote, OP-Aufbau	Textschärfe, Farbintensität
Motivation	emotionale Ausdauer	reguliert Automation & Energieverbrauch	Hintergrundtönung, Musikdynamik
Klarheit	geistige Übersicht	beeinflusst Aufwand & OP-Ertrag	UI-Schärfe, Transparenzgrad
Aufwand	systemische Reibung	erhöht Verbrauch und Fehlerwahrscheinlichkeit	Balkenvibration, Farbflackern
Verwirrung	chaotische Informationslage	steigert Fehler und Aufwand	UI-Noise, verschwommene Overlays
Überlastung	Kollapsindikator	steuert Run-Ende	roter Überlagerungsgrad, Sounddistortion


⸻

🔋 3. Energie – der körperliche Faktor

Funktion: Multiplikator der Klickeffizienz und Regeneration.

EnergieEffizienz = Energie^0.5
Klickwert = BasisErtrag * EnergieEffizienz

Effekte:
	•	Reduziert Output bei Erschöpfung.
	•	Niedrige Energie erhöht Aufwand pro Aktion.
	•	0 Energie = keine weitere Stempelaktion möglich.

Verbrauch & Regeneration:

ΔEnergie = -verbrauchProKlick + regenerationProSekunde
verbrauchProKlick = 0.2 × (1 + Aufwand)
regenerationProSekunde = 0.05 × Motivation

Empfohlenes Feedback:
	•	Niedrige Energie → träge Animation, dunklere Farben.
	•	0 Energie → Stempelton dumpf, UI leicht zitternd.

⸻

🧠 4. Konzentration – der mentale Filter

Funktion: beeinflusst OP-Aufbau, Klarheitsdrift und Fehlerwahrscheinlichkeit.

FehlerChance = baseError + (1 - Konzentration)^2 * 0.3
OP_Gain_Mul = 0.5 + Konzentration * 0.5
Klarheit_Drift = -0.001 * (1 - Konzentration)

Effekte:
	•	Bei hoher Konzentration: stabiler OP-Zuwachs, geringe Fehler.
	•	Bei niedriger Konzentration: Chaos-Events, Verwirrung, Audits.

Feedback:
	•	UI-Flackern, Textunschärfe, langsamere Reaktion.
	•	Bei 0 Konzentration → Run-Ende durch „Selbstüberforderung“.

⸻

❤️ Motivation – die emotionale Dynamik

Funktion: bestimmt Automationseffizienz, Energieverbrauch und Regeneration.

AutomationMul = 1 + Motivation * 0.3
EnergieRegeneration = Basis * Motivation

Dynamik:
	•	Motivation steigt bei Erfolg (OP-Gewinn, abgeschlossene Akten), sinkt bei Chaos.
	•	Niedrige Motivation → langsamere Automation, träge Eingaben.

Feedback:
	•	Musiklautstärke und UI-Helligkeit korrelieren mit Motivation.

⸻

🧾 5. Klarheit – die kognitive Ordnung

Funktion: zentrales Steuerinstrument für Ordnungspunkte und Aufwand.

AufwandRate = BasisAufwand * (1 - Klarheit)
OP_Gain = BasisOP * (0.5 + Klarheit * 0.5)

Effekte:
	•	Steigende Klarheit → sinkender Aufwand, höherer OP-Zuwachs.
	•	Sinkende Klarheit → höherer Energieverbrauch, steigende Verwirrung.

Feedback:
	•	UI-Transparenz nimmt mit Klarheit ab → „klare Linien“.
	•	Audio-Frequenzen offener, weniger gedämpft.

⸻

🧱 6. Aufwand – der systemische Gegenspieler

Funktion: generiert Stress und beschleunigt Energie-/Konzentrationsverlust.

EnergieVerbrauch = BasisEnergieVerbrauch * (1 + Aufwand)
KonzentrationsVerbrauch = BasisKonzentrationsVerbrauch * (1 + Aufwand)

Effekte:
	•	Hoher Aufwand = exponentielle Erschöpfung.
	•	Aufwand steigt mit jeder Aktion, sinkt bei Klarheit & Ordnung.

Feedback:
	•	UI flackert stärker, Hintergrund pulsiert.

⸻

⚠️ 7. Verwirrung – das chaotische Zwischenfeld

Funktion: verstärkt Aufwand, senkt Klarheit, erhöht Fehlerquote.

VerwirrungRate = BasisVerwirrung + (1 - Konzentration) * 0.3
FehlerChance = FehlerChance + Verwirrung * 0.2

Effekte:
	•	Schlechte Konzentration → steigende Verwirrung → Run destabilisiert.

Feedback:
	•	Rauschen im UI, leichte Kameraverzerrung, Audio-Verzerrungen.

⸻

🔴 8. Überlastung – das Ende des Zyklus

Funktion: Summenindikator der Systemspannung.
Erhöht sich durch Aufwand, sinkt durch OP-Maßnahmen.

Überlastung = f(Aufwand, Energie, Konzentration)

Regel:
	•	Wenn Überlastung ≥ 1 → Run-Ende („Systemischer Zusammenbruch“).
	•	Je höher die Überlastung, desto größer die Wahrscheinlichkeit spontaner Audit-Events.

Feedback:
	•	Pulsierende rote Ränder, Audio-Ducking, verzerrte Schrift.

⸻

🔁 9. Regelkreis der Zustände

graph LR
  A[Energie] --> B[Konzentration]
  B --> C[Klarheit]
  C --> D[Aufwand]
  D --> E[Überlastung]
  E -->|Reset| A
  B --> F[Verwirrung]
  F --> D
  B --> G[Motivation]
  G --> A

Interpretation:
	•	Energieverlust schwächt Konzentration.
	•	Sinkende Konzentration steigert Aufwand über Klarheitsverlust.
	•	Steigender Aufwand erhöht Überlastung und Energieverbrauch.
	•	Motivation wirkt als Dämpfungsfaktor (positive Rückkopplung).

Der Regelkreis erzeugt den typischen bürokratischen Erschöpfungszyklus.

⸻

🧪 10. Run-Ende-Bedingungen

Bedingung	Auslösertext	Konsequenz
Energie ≤ 0	„Erschöpft – Antrag auf Ruhezeit gestellt.“	Run-Ende + geringe VP-Belohnung
Konzentration ≤ 0	„Überforderung – Selbstkontrolle delegiert.“	Run-Ende + mittlere VP-Belohnung
Überlastung ≥ 1	„Systemischer Zusammenbruch.“	Run-Ende + geringe AP → VP-Umwandlung

Tuningziel:
Durchschnittliche Run-Dauer: 6–10 Minuten (Early Game) → 20–30 Minuten (Late Game, Zen-Nähe).

⸻

🧮 11. Konfigurationsvorschlag (zustandsparameter.json)

{
  "energie": {
    "verbrauchProKlick": 0.2,
    "regenerationProSekunde": 0.05,
    "effekt": { "klickErtragMul": "energie^0.5" }
  },
  "konzentration": {
    "verbrauchProKlick": 0.05,
    "regenerationProSekunde": 0.01,
    "effekt": {
      "opGainMul": "0.5 + konzentration*0.5",
      "fehlerChanceAdd": "(1 - konzentration)^2 * 0.3"
    }
  },
  "motivation": {
    "drift": "energie * 0.002 - aufwand * 0.001",
    "effekt": { "automationMul": "1 + motivation*0.3" }
  }
}


⸻

🧾 Fazit

Energie und Konzentration sind die zentralen Steuergrößen der Produktivität und der Ausdauer.
Sie definieren die Dynamik des Runs und machen seine Grenzen verständlich und spürbar.

“Ordnung entsteht aus Balance – nicht aus Dauerleistung.”
— Handbuch für Verwaltungsautomatisierung, §3.4