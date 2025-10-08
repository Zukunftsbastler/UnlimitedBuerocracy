Balancing & Zustandssystem – Parameter, Formeln, Skalierung

Ablagepfad: packages/game-design/docs/balancing/balancing_and_state_system.md
Version: 1.0

⸻

🎯 Ziel

Das Balancing stellt sicher, dass Runs (Arbeitstage) herausfordernd, verständlich und in Summe 2–4 Stunden bis zum Endziel (Bürokratie‑Zen) benötigen.
Dieses Dokument definiert Parameter, Formeln, Kurven und Tuning‑Leitlinien für Ressourcen, Zustände, Kosten und Belohnungen.

⸻

🧩 Grundkonzepte
	•	Deterministische Simulation: Alle Formeln sind rein funktional und skalieren mit deltaTime.
	•	Single‑Source‑of‑Truth: Alle Werte liegen in config/balancing.json und werden zur Laufzeit gelesen.
	•	Skalierung über Phasen: Frühe Runs sind klickbasiert, spätere laufen stärker über Automation & Meta.

⸻

📦 Ressourcen & Basiswerte

Schlüssel	Beschreibung	Startwert	Minimum	Maximum
AP	Aktenpunkte (laufende Produktion)	0	0	∞
OE	Ordnungseinheiten (Run‑Fortschritt)	0	0	∞
VP	Verwaltungspunkte (Meta)	0	0	∞
Aufwand	Verwaltungsaufwand (Chaosdruck)	0	0	1

Basis‑Ertrag pro Klick (ohne Modifikatoren): AP_click_base = 1.0

Umwandlung AP → OE:

OE_gain_per_AP = k_oe * Effizienz × KlarheitBonus
k_oe (default) = 0.1

KlarheitBonus: 1 + 0.25 * (klarheit - aufwand) (geclamped auf 0.75..1.25)

⸻

🧠 Zustandssystem (Vitals)

Zustände steuern Output, Fehlerrate und Run‑Ende. Werte sind kontinuierlich 0..1.

Parameter (defaults)

{
  "zustand": {
    "energieVerbrauchProKlick": 0.0025,
    "energieVerbrauchProSek": 0.0006,
    "energieRegenProSek": 0.0035,
    "konzentrationsDriftProSek": 0.0008,
    "konzentrationsBoostNeuigkeit": 0.06,
    "motivationGainErfolg": 0.015,
    "motivationLossFehler": 0.03,
    "verwirrungProAufwand": 0.6,
    "verwirrungDecayProSek": 0.005,
    "ueberlastungSchwelle": 1.0
  }
}

Dynamik

Energie

energie' = energie
  - energieVerbrauchProKlick * clicksInTick
  - energieVerbrauchProSek * dt
  + energieRegenProSek * pauseAktiv * dt

Konzentration

konzentration' = konzentration
  - konzentrationsDriftProSek * dt
  + (neueAufgabe ? konzentrationsBoostNeuigkeit : 0)

Motivation

motivation' = motivation
  + motivationGainErfolg * erfolgsEventsInTick
  - motivationLossFehler * fehlerEventsInTick

Verwirrung

verwirrung' = verwirrung
  + verwirrungProAufwand * max(0, aufwand - 0.5) * dt
  - verwirrungDecayProSek * dt

Überlastung (aggregiert)

ueberlastung = w1*(1-energie) + w2*verwirrung + w3*max(0, aufwand-0.7)
// defaults: w1=0.5, w2=0.3, w3=0.2
RunEnde, wenn ueberlastung ≥ ueberlastungSchwelle oder ArbeitstagZeit=0

Effekte auf Output & Fehler

outputMultiplikator = clamp(0.5 + 0.5*energie, 0.5, 1.0) * clamp(0.8 + 0.4*konzentration, 0.8, 1.2)
fehlerquote = baseFehlerquote * (1 + 0.8*(1-energie)) * (1 + 0.6*verwirrung)


⸻

🌀 Ordnung & Aufwand (Meter)

Aufwandanstieg pro Tick

aufwand' = clamp01( aufwand + chaosFaktor * (überproduktion) * dt - dämpfung * gegenmaßnahmen * dt )

	•	überproduktion = max(0, tatsächlicherOutput - zielOutput)
	•	gegenmaßnahmen stammen aus Kursen/Privilegien (Audits, Prozesse, Seilschaften)
	•	chaosFaktor (default) = 0.9
	•	dämpfung (default) = 0.3

Klarheit wird indirekt aus OE & Aufwand abgeleitet (nur für Visuals/Bonis):

klarheit = clamp01( 0.5 + 0.5 * tanh( a*OE - b*aufwand ) )
// a=0.02, b=1.5


⸻

⚙️ Automatisierung & Output

Automation i (Stufe s):

output_i = basis_i * s * (1 + effGesamt) * (1 - verwirrungsMalus)
verwirrungsMalus = 0.25 * verwirrung

Gesamt‑DPS: Σ output_i

Aufwandsbeitrag je Automation:

aufwandDelta_i = chaosFaktor_i * output_i * dt
// Kurs/Privilegien können chaosFaktor_i reduzieren


⸻

💰 Kostenkurven

Alle Kosten sind konfigurierbar, Standard:

{
  "kosten": {
    "automatisierung": { "basis": 10, "wachstum": 1.15 },
    "kurse": { "basis": 8, "wachstum": 1.35 },
    "befoerderung": { "basis": 100, "wachstum": 1.8 },
    "powerups": { "basis": 5, "wachstum": 1.25 }
  }
}

Allgemeine Formel:

kosten(level) = basis * (wachstum^(level-1)) * inflationsFaktor
inflationsFaktor = (level > 10) ? 1.2 : 1.0


⸻

🎁 Belohnungen (VP) & Diminishing Returns

VP‑Vergabe am Run‑Ende

VP = max(1, rund( dauerSek * zeitFaktor * (1 + 0.5*klarheit) * schwierigkeitMulti ))
zeitFaktor (default) = 0.002
schwierigkeitMulti = 1 + 0.1 * (rang-1)

Diminishing Returns bei sehr langen Runs:

if (dauerSek > softCapSek) {
  VP *= (softCapSek / dauerSek)^0.25
}
softCapSek (default) = 1500 // 25 min


⸻

🚦 Ereignisse & Schwellenwerte

Event	Bedingung	Wirkung (defaults)
Warnung: Energie	energie < 0.3	Tooltip + Farbton shift; output −10%
Audit	t > 50% Run; RNG 15%	+0.05 Aufwand, −5% Fehlerquote (Präzision)
Pause	Spieleraktion	+0.25 Energie, +0.1 Motivation; −30s Run‑Zeit
Kollaps droht	aufwand > 0.9	Screen‑Wobble 0.8, Fehlerrate +20%
Feierabend	Zeit ≤ 0	Run-Ende


⸻

🧪 Tuning‑Playbook
	1.	Run‑Dauer zu kurz
	•	energieRegenProSek leicht erhöhen (+10%)
	•	aufwand dämpfung +0.05
	•	zeitFaktor für VP senken (Meta bremst, Runs verlängern sich)
	2.	Zu einfach (frühe Loops)
	•	energieVerbrauchProKlick +10%
	•	chaosFaktor +0.1
	•	kurse.wachstum +0.05 (Inflation)
	3.	Meta zu schnell
	•	befoerderung.wachstum +0.1 oder basis +50
	•	Diminishing Returns früher greifen lassen (softCapSek −300)
	4.	Automation dominiert zu früh
	•	automatisierung.wachstum +0.05
	•	chaosFaktor_i der mittleren Einheiten +10%
	5.	Überlastung zu hart
	•	Gewichte w1,w2,w3 senken (z. B. 0.4/0.3/0.3)
	•	verwirrungDecayProSek +0.002

⸻

🔧 Beispiel config/balancing.json

{
  "kosten": {
    "automatisierung": { "basis": 10, "wachstum": 1.15 },
    "kurse": { "basis": 8, "wachstum": 1.35 },
    "befoerderung": { "basis": 100, "wachstum": 1.8 },
    "powerups": { "basis": 5, "wachstum": 1.25 }
  },
  "vpErtrag": { "minProRun": 1, "zeitFaktor": 0.002, "klarheitBonus": 0.5, "softCapSek": 1500 },
  "aufwand": { "chaosFaktor": 0.9, "dämpfung": 0.3 },
  "zustand": {
    "energieVerbrauchProKlick": 0.0025,
    "energieVerbrauchProSek": 0.0006,
    "energieRegenProSek": 0.0035,
    "konzentrationsDriftProSek": 0.0008,
    "konzentrationsBoostNeuigkeit": 0.06,
    "motivationGainErfolg": 0.015,
    "motivationLossFehler": 0.03,
    "verwirrungProAufwand": 0.6,
    "verwirrungDecayProSek": 0.005,
    "ueberlastungSchwelle": 1.0,
    "gewichte": { "w1": 0.5, "w2": 0.3, "w3": 0.2 }
  }
}


⸻

🧮 Pseudocode – Tick

function tick(dt) {
  applyInput();
  updateEnergy(dt);
  updateConcentration(dt);
  updateMotivation(dt);
  updateAutomation(dt);
  convertAPtoOE(dt);
  updateAufwand(dt);
  updateVerwirrung(dt);
  computeOverload();
  updateWorkday(dt);
  emitSnapshotIfDue();
}


⸻

📈 QA & Monte‑Carlo‑Sim
	•	Fester Seed je Run; 1000 Simulationen mit variierendem Spielstil (aktiv/idle/mix).
	•	Metriken: durchschnittliche VP/Run, Abbruchgrund, Dauer, max. Aufwand, Klickrate.
	•	Zielwerte:
	•	Run‑Dauer Mittel: 12–16 Minuten
	•	VP pro Run Anfang: 100–300, Mitte: 400–900, Ende: 1000+
	•	Abbruchgründe: < 30% Überlastung, > 60% Zeitablauf

⸻

🧾 Zusammenfassung

Das Zustandssystem koppelt Energie, Konzentration, Motivation, Verwirrung und Aufwand zu einem kontrollierbaren, aber spürbar eskalierenden Loop.
Durch konfigurierte Kurven und klare Tuning‑Hebel bleibt die Progression vorhersagbar und die 2–4‑Stunden‑Zielsetzung erreichbar.