Events & Power-Ups – Bürokratie der Unendlichkeit

Ablagepfad: packages/game-design/docs/events/events_and_powerups_system.md
Version: 1.0

⸻

🎯 Ziel

Diese Dokumentation definiert das Event- und Power-Up-System von Bürokratie der Unendlichkeit.

Ziel ist es, dynamische Ereignisse und temporäre Effekte in den Run-Ablauf zu integrieren, die sich sowohl spielmechanisch als auch ästhetisch bedeutend anfühlen. Dabei bleibt der bürokratische Ton gewahrt: Alles, was passiert, wirkt formal korrekt – auch wenn es völlig absurd ist.

⸻

🧩 Grundprinzipien
	•	Events sind spontane, systemische Eingriffe in den Arbeitsablauf. Sie können positiv, negativ oder neutral wirken.
	•	Power-Ups sind temporäre, vom Spieler aktivierte oder durch Events ausgelöste Statusverbesserungen.
	•	Beide Systeme sind datengetrieben, versioniert und modular (über JSON-Definitionen konfigurierbar).

⸻

⚙️ Event-System

Struktur

interface GameEvent {
  id: string;
  typ: 'audit' | 'pause' | 'besuch' | 'befoerderung' | 'stoerung' | 'meta';
  titel: string;
  beschreibung: string;
  wahrscheinlichkeit: number; // 0–1 pro Minute
  trigger?: Trigger; // optionale Bedingungen
  effekte: EventEffekt[];
  dauerSek?: number;
}

interface EventEffekt {
  ziel: 'energie' | 'motivation' | 'aufwand' | 'automation' | 'zeit';
  delta: number;
  dauerSek?: number; // falls temporär (z. B. +0.2 Energie für 30 Sek)
  typ?: 'sofort' | 'zeitlich';
}

Beispiel: Audit-Event

{
  "id": "event_audit_01",
  "typ": "audit",
  "titel": "Spontanes Audit",
  "beschreibung": "Das Dezernat für Kontrolle hat ein spontanes Audit eingeleitet.",
  "wahrscheinlichkeit": 0.08,
  "effekte": [
    {"ziel": "aufwand", "delta": 0.15, "typ": "sofort"},
    {"ziel": "motivation", "delta": -0.05, "typ": "sofort"}
  ],
  "dauerSek": 15
}

Ablauf
	1.	Auslösung:
	•	Periodischer Check (alle 30s): RNG < wahrscheinlichkeit
	•	Trigger-Bedingungen prüfen (z. B. Aufwand > 0.5, Energie < 0.6)
	2.	Aktivierung:
	•	Event wird visuell und akustisch angekündigt.
	•	Beschreibung erscheint in einem modalen Dialog („Formularblatt“).
	3.	Effektphase:
	•	Direkte oder über Zeit wirkende Modifikationen.
	•	Optionale Gegenmaßnahmen möglich (Power-Ups, Kursboni).
	4.	Abschluss:
	•	Event wird archiviert (für Statistik & Content-Ausgabe).

⸻

🧠 Event-Typen

Typ	Beschreibung	Beispiel-Effekt
Audit	Kontrollereignis, erhöht Aufwand, senkt Motivation	Aufwand +0.1, Motivation -0.05
Pause	freiwilliges Ereignis, regeneriert Energie, kostet Zeit	Energie +0.25, Zeit -60s
Besuch	Zufällige Ablenkung, beeinflusst Konzentration	Konzentration -0.1
Beförderung	Systemevent bei Meta-Aufstieg	VP +10%, Run-Endbonus
Störung	Negative Systemereignisse (Papierstau, Absturz)	Automation -20% für 20s
Meta	Surreale Meta-Events (System spricht zum Spieler)	Textausgabe + Wobble-Effekt


⸻

🕹️ Spielerreaktionen
	•	Ignorieren: Keine Aktion, Event läuft passiv ab.
	•	Akzeptieren: (z. B. Pause) → positiver Effekt mit Zeitverlust.
	•	Widerstand: Nur bei bestimmten Kursen/Privilegien aktivierbar.

Beispiel: Kurs „Bürokratische Belastungsresilienz“ reduziert Dauer negativer Events um 50 %.

⸻

⚡ Power-Up-System

Struktur

interface PowerUp {
  id: string;
  name: string;
  beschreibung: string;
  typ: 'buff' | 'debuff';
  kategorie: 'kaffee' | 'prozess' | 'seilschaft' | 'papier' | 'privileg';
  dauerSek: number;
  cooldownSek: number;
  effekte: PowerUpEffekt[];
  stackable?: boolean;
}

interface PowerUpEffekt {
  ziel: 'energie' | 'konzentration' | 'motivation' | 'automation' | 'aufwand';
  multiplikator?: number;
  delta?: number;
}

Beispiel: Kaffee

{
  "id": "powerup_kaffee",
  "name": "Kaffeepause",
  "beschreibung": "Erhöht kurzfristig Energie und Konzentration.",
  "typ": "buff",
  "kategorie": "kaffee",
  "dauerSek": 30,
  "cooldownSek": 90,
  "effekte": [
    {"ziel": "energie", "delta": 0.3},
    {"ziel": "konzentration", "delta": 0.15}
  ]
}

Anwendung
	•	Power-Ups sind temporäre Modifikatoren mit ablaufendem Timer.
	•	UI zeigt aktive Effekte als farbige Karten im Footer.
	•	Abklingzeiten verhindern Dauerbuffs.

⸻

🧩 Kategorien von Power-Ups

Kategorie	Beschreibung	Beispiel
Kaffee	Kurzzeitiger Energie-Boost	+Energie, +Konzentration
Prozessoptimierung	Effizienzsteigerung	+AP-Output, -Aufwand
Seilschaft	Bürointerne Hilfe	+Motivation, Chance auf Bonus-VP
Papierüberfluss	Beschleunigt Routine	+OE-Rate, +Aufwand
Privileg	Meta-Fähigkeit	Multiplikator auf VP-Ertrag


⸻

💡 Synergien & Konflikte
	•	Mehrere aktive Power-Ups können additiv oder multiplikativ wirken.
	•	Bei widersprüchlichen Effekten gilt die Regel: Negativ dominiert (Bürokratische Priorität der Einschränkung).

Beispiel: Kaffee (+Energie) & Papierüberfluss (+Aufwand) → Netto-Effekt leicht positiv, aber Fehlerquote steigt.

⸻

🔁 Integration in Simulation

Ablauf (pro Tick)

function applyPowerUps(state, dt) {
  for (const p of activePowerUps) {
    for (const eff of p.effekte) {
      applyEffect(state, eff, dt);
    }
    p.remaining -= dt;
    if (p.remaining <= 0) deactivate(p);
  }
}

Effektanwendung:
	•	delta: additiver Bonus pro Tick.
	•	multiplikator: wird auf Basiswerte angewendet (z. B. Energieverbrauch ×0.9).

Ablauf (Event → Power-Up)
	1.	Event löst Power-Up direkt aus (z. B. „Beförderung“ aktiviert „Motivationsschub“).
	2.	Power-Up wird temporär der aktiven Liste hinzugefügt.
	3.	Effekt läuft über Zeit und endet automatisch.

⸻

🎨 Visuelle Rückmeldung

Status	Effekt	Darstellung
Aktivierung	Kurzblitz, Stempelgeräusch	Farbwechsel + Tooltip
Laufend	Leuchtender Rand, Uhrsymbol	animierter Fortschrittsbalken
Ablauf	Verblassen, Soundeffekt „Papier raschelt“	leichte Farbentsättigung
Konflikt	Warnicon ⚠️	Tooltip: „Gegenseitige Aufhebung vermerkt.“


⸻

🔊 Audio & Feedback

Ereignis	Ton	Dauer
Power-Up aktiviert	heller Klick	0.2s
Power-Up endet	dumpfes Rascheln	0.4s
Audit startet	tiefer Gong	0.6s
Pause genehmigt	Kaffeetassenklang	0.3s
Beförderung	Papierstempel + Fanfare	1.0s


⸻

🧾 Beispiel config/events.json

{
  "events": [
    {
      "id": "audit_spontan",
      "typ": "audit",
      "wahrscheinlichkeit": 0.08,
      "effekte": [
        {"ziel": "aufwand", "delta": 0.15},
        {"ziel": "motivation", "delta": -0.05}
      ]
    },
    {
      "id": "pause_kaffee",
      "typ": "pause",
      "wahrscheinlichkeit": 0.12,
      "effekte": [
        {"ziel": "energie", "delta": 0.25},
        {"ziel": "zeit", "delta": -60}
      ]
    }
  ]
}


⸻

🧾 Beispiel config/powerups.json

{
  "powerups": [
    {
      "id": "kaffee",
      "kategorie": "kaffee",
      "dauerSek": 30,
      "cooldownSek": 90,
      "effekte": [
        {"ziel": "energie", "delta": 0.3},
        {"ziel": "konzentration", "delta": 0.15}
      ]
    },
    {
      "id": "prozessoptimierung",
      "kategorie": "prozess",
      "dauerSek": 60,
      "cooldownSek": 180,
      "effekte": [
        {"ziel": "aufwand", "multiplikator": 0.8},
        {"ziel": "automation", "multiplikator": 1.2}
      ]
    }
  ]
}


⸻

⚖️ Balancing-Richtlinien

Kategorie	Durchschnittliche Dauer	Abklingzeit	Effektstärke
Kaffee	20–40s	90–120s	+10–30%
Prozessoptimierung	60–90s	180–240s	Effizienz +10–20%
Seilschaft	45–60s	300s	+10% Motivation, +10% VP
Papierüberfluss	30–45s	150s	OE +15%, Aufwand +10%
Privileg	dauerhafte Meta-Fähigkeiten	–	Multiplikatoren ×1.1–×2.0


⸻

🧮 Interaktion zwischen Systemen

Quelle	Ziel	Beschreibung
Event	Power-Up	z. B. Beförderung löst Motivationsboost aus
Power-Up	Zustand	beeinflusst Energie, Konzentration etc.
Kurs	Event	bestimmte Fortbildungen reduzieren Eventwahrscheinlichkeit
Privileg	Power-Up	senkt Cooldown oder verlängert Dauer


⸻

🧾 Zusammenfassung

Das Event- und Power-Up-System bringt Leben in die Simulation.
Es übersetzt die Absurdität des Büroalltags in greifbare Mechaniken: zufällige Prüfungen, temporäre Überforderung, aber auch kleine Freuden wie Kaffee oder Anerkennung.

Alle Inhalte sind modular, datengetrieben und durch Trigger steuerbar – eine perfekte Grundlage für zukünftige Erweiterungen (z. B. interaktive Mini-Events oder Meta-Anomalien).

⸻

✅ Nächste Schritte
	1.	Implementierung des EventSchedulers im Worker (30s-Takt).
	2.	Erstellung von 10 Beispiel-Events und 10 Power-Ups (JSON).
	3.	Integration in SnapshotEmitter (aktives Event im Status).
	4.	UI-Komponente „Ereignis-Overlay“ (mit Tooltip & Animation).
	5.	Audioverknüpfung über AudioService (Events → Sound).