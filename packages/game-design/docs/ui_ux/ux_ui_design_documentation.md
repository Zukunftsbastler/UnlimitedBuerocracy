UX/UI Design – Bürokratie der Unendlichkeit

Ablagepfad: packages/game-design/docs/ui_ux/ux_ui_design_documentation.md
Version: 1.0

⸻

🎯 Ziel

Diese Dokumentation definiert das vollständige UX- und UI-Konzept für Bürokratie der Unendlichkeit.
Sie beschreibt Layouts, Interaktionen, visuelle Zustände und die Sprache der Benutzeroberfläche.
Das Ziel ist eine ästhetisch klare, bürokratisch-satirische, aber stets funktionale Bedienung, die selbst in ihrer Absurdität noch Ordnung vermittelt.

⸻

🧩 Grundprinzipien

1. Lesbare Bürokratie
	•	Jede UI-Komponente wirkt wie ein Formular, Dashboard oder Verwaltungs-Panel.
	•	Linien, Kästen, und Formularfelder werden klar, aber überstrukturiert dargestellt.
	•	Fonts: Inter, Roboto Mono oder IBM Plex Sans, optional Serif für Dekor.

2. Ironische Klarheit
	•	Alles ist korrekt beschriftet – aber zu korrekt.
	•	Tooltips, Labels und Texte verwenden übertriebene Amtsdeutsch-Formulierungen.
	•	Farbkonzept transportiert Fortschritt ↔ Chaos:
	•	Ordnung → kühle Blautöne, Grau, Weiß
	•	Chaos → Gelb, Rot, warme Übersteuerungen

3. Minimalismus mit Gewicht
	•	Wenige Animationen, aber mit Trägheit (Ease-Out > 0.3s).
	•	Alles fühlt sich „verwaltet“ an: Aktionen haben spürbare Verzögerung (Ladebalken, Stempel-SFX).
	•	Vermeide zu schnelle oder zu bunte Übergänge.

⸻

🧭 Layout & Navigation

Hauptansicht: Arbeitstag / Run-Phase
	•	Oben: Zeitbalken mit Restarbeitszeit, Datum, Tagesfortschritt.
	•	Mitte: Hauptaktionsfläche (Klickbereich) mit Akten-/Stempel-Interaktion.
	•	Rechts: Zustandsleisten (Energie, Konzentration, Motivation, Verwirrung, Überlastung).
	•	Unten: Schnellzugriff auf Power-Ups und temporäre Boosts.
	•	Links: Statistikpanel (AP, OE, Aufwand, VP) + laufende Akten.

Tooltip-Verhalten:
	•	Mouseover → verzögertes Einblenden (200ms).
	•	Tooltip-Container folgt Maus, begrenzt auf Viewport.
	•	Tonalität: formell, sarkastisch, übergenau.
Beispiel: „Bitte klicken Sie ordnungsgemäß, um den Prozessablauf zu initiieren.“

Zwischen-Phasen: Beförderung / Skilltree / Statistik / Metaprogression
	•	Zentraler Panel-Switcher: Tabs oder Registerkarten mit amtlichen Titeln.
Beispiel: „Personalentwicklung“, „Fortbildungsakte“, „Statistische Auswertung“.
	•	Beförderungsscreen: animierter Stempel, vergrößerte Schrift, visuell feierlich, aber bürokratisch steril.
	•	Skilltree: vertikale Struktur mit Verbindungslinien, animierte Leuchtpunkte für freigeschaltete Kurse.
	•	Statistik: Tabellenlayout mit „Prüfvermerk“-Symbolen, Mouseover-Infos und Balkendiagrammen.

Navigationsprinzipien
	•	Kein klassisches Menü, sondern Bürokratische Arbeitsmappe:
	•	Tabs simulieren Registerkarten (mit leichtem Knick-Effekt).
	•	Schließen-Button heißt: „Zur Ablage“.
	•	Hover-Sound: leichtes Papier- oder Tackergeräusch.

⸻

🎨 Farb- & Stilrichtlinien

Kategorie	Farbe	Bedeutung
Ordnung	#DCE3F0	Neutral, Ruhe
Aktivität	#7BA9F0	Handlung, Klick, Energie
Warnung	#F0B57B	Müdigkeit, Unordnung
Gefahr	#D96D6D	Überlastung, Chaos
Erfolg	#78B97F	Fortschritt, Klarheit

Kontrastregeln:
	•	Mindestens 4.5:1 (WCAG AA).
	•	Tooltip-Textfarbe stets #111 auf heller Karte mit Schatten.

Stempel-Animation:
	•	Kurzer Schlag (Ease-In-Out, 250ms).
	•	Leichte Verschiebung des Dokuments, Schattenwurf.
	•	Soundeffekt: dumpfer Papier-Stempel.

⸻

🧠 Informationsarchitektur

Bereich	Inhalt	Tooltip-Schlüssel (Beispiel)
Haupt-Panel	Klickfläche, AP-Anzeige, aktuelle Akte	tooltip.run.timer
Zustand	Energie, Konzentration, Motivation	tooltip.state.energie
Fortschritt	Ordnungseinheiten (OE), Verwaltungspunkte (VP)	tooltip.stats.vp
Skilltree	Kurse, Abhängigkeiten, Kosten	tooltip.skilltree.kurskosten
Prestige	Beförderungsränge, Boni	tooltip.prestige.rang
Akten	Sachgebiete, Aktenzeichen, Priorität	tooltip.akten.aktenzeichen


⸻

🧩 Interaktionsmuster

Aktion	Rückmeldung	Tonalität
Klick auf Akte	Kurzer Stempel + Zähler steigt	„Dokument entgegengenommen.“
Energie sinkt	Farbton-Shift ins Rote, Ton gedämpft	„Sie fühlen sich angemessen erschöpft.“
Power-Up aktiv	Glühen oder farbige Linie um UI	„Unbefugte Effizienz festgestellt.“
Run-Ende	Bildschirm wird grau, Stempel „Feierabend“	„Die Akten ruhen – Sie theoretisch auch.“


⸻

💬 Sprache & Mikrotexte
	•	Alle Labels, Tooltips, Buttons und Fehlermeldungen folgen einem einheitlichen Stil:
	•	Höflich, passiv, unpersönlich.
	•	Lange Substantivketten sind willkommen.
Beispiel: „Verordnung zur Freischaltung der Verantwortlichkeitssteigerung“.
	•	Humor entsteht durch Überkorrektheit, nicht durch Slapstick.

⸻

🧩 HUD-Komponenten (UI-Module)
	1.	HeaderBar
Enthält Datum, aktuelle Zeit, Restarbeitszeit, Rang.
	2.	MainClickPanel
Zentrale Interaktion (Klicken/Stempeln).
	3.	SideStatsPanel
Übersicht über Ressourcen, Zustände, Fortschritt.
	4.	FooterBar
Aktive Power-Ups, Tagesstatus.
	5.	DialogLayer
Systemmeldungen, Beförderungen, Schulungen.
	6.	TooltipLayer
Anzeige aller dynamischen Tooltips, inkl. Verzögerung und Positionierung.
	7.	ModalOverlay
Für formale Vorgänge (Kauf, Kurse, Einstellungen).

⸻

🧩 Responsives Verhalten
	•	Desktop (Standard): Vollständiges Interface mit Panels und Tooltip-Overlays.
	•	Tablet: Panels werden zu Tabs, Tooltip bei Long-Press.
	•	Mobile: Reduzierter Modus – Fokus auf Hauptinteraktion + Auto-Anzeigen der Zustände.

⸻

📊 UI-Zustände (Visuelle Progression)

Zustand	Farbeffekt	Beschreibung
Ordnung (Start)	kühlblau, leichtes Glühen	Stabilität, Anfangsphase
Routine	entsättigt, graublau	Gleichförmigkeit
Überforderung	gelblich, Vibration	Warnzustand
Chaos	rot/orange, Screen-Wobble	Endphase, drohender Kollaps
Bürokratie-Zen	weiß/blau, Lichtschein	Endziel – völlige Selbstauflösung


⸻

🧩 Sound & Feedback

Ereignis	Ton	Dauer	Bemerkung
Klick	dumpfer Stempel	0.2s	Jeder Klick belohnt taktil
Power-Up	kurzes Glühen + Klick	0.3s	Signal für Aktivierung
Warnung	tiefer Gong	0.5s	sinkende Energie
Beförderung	Fanfare + Papierrauschen	1.0s	Triumph der Absurdität
Feierabend	schwacher Gong	0.8s	Abschluss eines Runs


⸻

🧾 Zusammenfassung

Das UX/UI-System bildet den visuellen Rahmen der kafkaesken Bürokratie.
Es soll sich gleichzeitig sachlich, humorvoll und beengend anfühlen – der Spieler sieht seine Effizienz steigen, während die Oberfläche sich zunehmend selbst verwaltet.

Der Spieldesign-Schwerpunkt liegt auf visuell erfahrbarer Ordnung und sensorischem Kontrollverlust.
Alle UI-Komponenten sollen modular, testbar und textuell ansprechbar (z. B. durch Tooltips) gestaltet sein.

⸻

✅ Nächste Schritte
	1.	Prototyping der Panels (HeaderBar, MainClickPanel, SideStatsPanel).
	2.	Implementierung des Tooltip-Systems (TooltipProvider, useTooltip).
	3.	Entwicklung der Zustandsbalken mit Farb- und Wobble-Animation.
	4.	Definition der Theme-Tokens (tokens.ts) gemäß Farbpalette.
	5.	Erstellung der UI-Komponenten in Storybook zur Design-Validierung.