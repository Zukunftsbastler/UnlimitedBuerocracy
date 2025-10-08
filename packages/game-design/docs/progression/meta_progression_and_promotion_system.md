Meta-Progression & Beförderungssystem – Bürokratie der Unendlichkeit

Ablagepfad: packages/game-design/docs/progression/meta_progression_and_promotion_system.md
Version: 1.0

⸻

🎯 Ziel

Diese Dokumentation beschreibt die Meta-Progression und das Beförderungssystem von Bürokratie der Unendlichkeit – also die Mechanik, die den Spielfortschritt zwischen den Runs (Arbeitstagen) steuert.

Die Meta-Progression verleiht Dauerhaftigkeit: Nach jedem Run werden Verwaltungspunkte (VP) in Beförderungen, Fortbildungen oder dauerhafte Privilegien investiert. Das System erzeugt langfristige Motivation und eine sichtbare Karriereleiter.

⸻

🧩 Grundstruktur

Meta-Progression besteht aus drei Schichten:
	1.	Verwaltungspunkte (VP): Meta-Währung, verdient durch erfolgreiche Runs.
	2.	Beförderungen (Ränge): lineare Fortschrittsleiter mit spürbaren Boni.
	3.	Fortbildungsakte (Skilltree): frei wählbare Spezialisierungen (zweigartig verzweigt).

Diese Schichten interagieren über Kosten, Effekte und Freischaltungen.

⸻

💰 Verwaltungspunkte (VP)

Definition:
	•	Währung, die am Ende jedes Runs ausgeschüttet wird.
	•	Formel:
VP = Basis + (DauerSek * Zeitfaktor * Klarheitsbonus)
	•	Immer mindestens 1 VP pro Run.
	•	VP werden in Beförderungen, Kurse oder Privilegien investiert.

VP-Kostenkurve:

Stufe	Multiplikator	Typische Anwendung
1–5	×1.2	Frühe Boni (Energie, Klickwert)
6–10	×1.5	Mittlere Boni (Automationen, Motivation)
11–20	×1.8	Späte Boni (Reduktion Aufwand, Dauerverlängerung)


⸻

🧱 Beförderungssystem (Ränge)

Ziel:
Der Spieler erklimmt die Verwaltungshierarchie. Jeder Rang symbolisiert ein Maß an Kontrolle – bis hin zur völligen Selbstverwaltung (Bürokratie-Zen).

Rangleiter

Rang	Titel	Effekt	Symbol
1	Sachbearbeiter/in	+5% Klick-Effizienz	🗂️
2	Referent/in	+10% Energie-Regeneration	🖋️
3	Dezernatsleitung	-10% Aufwand	📁
4	Amtsleitung	+15% Automationseffizienz	🏢
5	Hauptabteilungsleitung	+1 Start-Power-Up	📊
6	Referatsleitung	+5% Klarheitsbonus	📎
7	Direktion	-20% Energieverbrauch	📘
8	Generalsekretariat	+25% VP-Ertrag	🗃️
9	Ministerialrat	Zugriff auf exklusive Kurse	🏛️
10	Oberbürokrat/in	Freischaltung „Bürokratie-Zen“	☯️

Mechanik:
	•	Beförderungen sind linear und dauerhaft.
	•	Jede Beförderung kostet VP gemäß exponentieller Kurve:
Kosten = Basis × (Rang^1.6)
	•	Nach jeder Beförderung ändert sich der visuelle Stil im Metabildschirm (mehr Ordnung, mehr Stempel, weniger Mensch).

⸻

📂 Fortbildungsakte (Skilltree)

Struktur
	•	Drei Hauptzweige mit je 7 Kursen:
	•	Effizienz (E): Output-Steigerung, Energie-Management.
	•	Organisation (O): Ordnung, Klarheit, Automation.
	•	Verwaltung (V): Kostenreduktion, Aufwandsminderung.

Kursbeispiel

{
  "id": "kurs_effizienz_03",
  "name": "Zeitökonomische Verfahrensbeschleunigung",
  "beschreibung": "Erhöht den Klick-Ertrag um 15% pro Stempelaktion.",
  "kostenVP": 12,
  "voraussetzungen": ["kurs_effizienz_02"],
  "effekt": {"klickErtrag": 1.15}
}

Mechanik
	•	Kurse bleiben über Runs erhalten.
	•	Skills sind modular und additiv.
	•	Aktivierte Kurse erscheinen als „Akteneinträge“ im Fortbildungsarchiv.

Darstellung im UI
	•	Baumstruktur (vertikal).
	•	Aktive Kurse leuchten dezent.
	•	Tooltip zeigt formale Beschreibung:
„Genehmigte Qualifikation zur Effizienzsteigerung in Eigenverantwortung.“

⸻

🪶 Privilegien & Sonderrechte

Zweck: spürbare Meta-Fortschritte, die sich „mächtig“ anfühlen.

Privileg	Beschreibung	Effekt
Dienstwagen	Kürzere Laufzeiten zwischen Klicks	-10% Klickverzögerung
Sekretariat	Passive VP-Generierung pro Run	+0.5 VP
Kleiner Dienstweg	Gelegentliche Doppelbelohnung	5% Chance auf Bonus-VP
Haushaltsrecht	Reduziert Kosten aller Kurse	-10% VP-Kosten
Personalverantwortung	Verdoppelt Automationsgeschwindigkeit	+100% Idle-Rate

Privilegien sind Meta-Passives, die nach Freischaltung immer gelten.

⸻

🕰️ Flow zwischen Runs

[Run-Ende] → [Statistik-Übersicht] → [Beförderung prüfen] → [VP-Zuteilung] → [Fortbildungsakte öffnen] → [Nächster Arbeitstag]

	1.	Run-Ende: Anzeige mit Stempelanimation „Feierabend“.
	2.	Statistik: Zusammenfassung (AP, OE, VP, Dauer, Ereignisse).
	3.	Beförderungsprüfung: Falls VP >= Kosten, Rangaufstieg anbieten.
	4.	Fortbildungsakte: Spieler wählt neue Kurse oder Privilegien.
	5.	Start neuer Run: Welt wird neu initialisiert, Meta bleibt erhalten.

⸻

🧠 Progressionsphasen

Phase	Beschreibung	Hauptantrieb
I – Einarbeitung	Frühe Ränge, Klick-Mechanik, einfache Boni	Erlernen der Routine
II – Kontrolle	Midgame, Automatisierungen & Kurse	Aufbau von Effizienz
III – Überregulierung	Spätes Midgame, Chaos steigt	Kampf gegen Aufwand
IV – Selbstverwaltung	Endgame, Meta stark, Runs lang	Vorbereitung auf Zen
V – Bürokratie-Zen	Meta-Ende, UI minimalistisch	Selbstauflösung, Meta-Vollendung


⸻

🧾 Visualisierung des Fortschritts
	•	Prestige-Meter: zeigt Karrierefortschritt grafisch (10 Ränge, Fortschrittslinie mit Stempel).
	•	VP-Anzeige: oben rechts im Meta-Menü mit Tooltip „Gespeicherte Einflussgröße“.
	•	Fortbildungsakte: interaktiver Skilltree mit Linien, Icons, Stufen.
	•	Zen-Status: subtiler Farbverlauf im Hintergrund; je näher dem Endziel, desto heller und ruhiger.

⸻

⚖️ Balancing-Richtlinien
	•	Jede Beförderung verlängert die durchschnittliche Run-Dauer um ~10%.
	•	Skillkosten steigen mit logarithmischer Kurve (Inflation): Kosten = Basis * (1.2 ^ AnzahlGekaufteSkills).
	•	Privilegien sollen spürbar, aber nicht übermächtig wirken (Multiplikatoren max. ×2).
	•	Run-Zeitmaximum (ohne Zen): ca. 30 Minuten real.

⸻

🧾 Zusammenfassung

Das Beförderungs- und Meta-Progressionssystem ist das Rückgrat der Langzeitmotivation.
Es übersetzt bürokratische Karriere in eine mechanisch greifbare, aber sarkastisch überzeichnete Fortschrittslogik.

Jeder Beförderungsschritt bringt Erleichterung – aber auch mehr Verantwortung.
Am Ende führt jede Optimierung zur Auflösung der Notwendigkeit – Bürokratie-Zen.

⸻

✅ Nächste Schritte
	1.	JSON-Definition der Ränge, Kurse und Privilegien in /config/-Dateien anlegen.
	2.	UI-Module für Beförderungsscreen, Fortbildungsakte, Statistikübersicht.
	3.	Implementierung des MetaState-Handlers im Worker (VP, Ränge, Boni).
	4.	Integration der Meta-Persistenz in Dexie.
	5.	Testläufe zur VP-Verteilung und Balancing.