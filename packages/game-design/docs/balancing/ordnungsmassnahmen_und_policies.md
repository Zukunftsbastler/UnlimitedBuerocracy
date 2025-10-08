Ordnungspunkte-Verwendung: Maßnahmen & Policies

Ablagepfad: packages/game-design/docs/balancing/ordnungsmassnahmen_und_policies.md
Version: 1.0

⸻

🎯 Ziel

Dieses Dokument beschreibt die Verwendungsmöglichkeiten von Ordnungspunkten (OP) im Kernspiel Bürokratie der Unendlichkeit.
OP werden innerhalb eines Runs ausgegeben, um temporäre Maßnahmen und bürokratische Policies zu aktivieren, die Effizienz erhöhen oder Chaos begrenzen.

Sie sind die operative Steuerungsressource – das taktische Gegenstück zu AP (Aktenpunkte, Output) und VP (Verwaltungspunkte, Meta-Progression).

⸻

🧩 1. Grundprinzipien

Prinzip	Beschreibung
Temporär	OP-Effekte halten Sekunden oder Minuten, nie über Runs hinweg.
Flüchtig	OP verfallen über Zeit (Decay) – ungenutzte Ordnung löst sich auf.
Kostenbasiert	Jede Maßnahme hat feste OP-Kosten, Dauer und Cooldown.
Nicht stapelbar	Gleiche Maßnahme kann nicht mehrfach gleichzeitig aktiv sein.
Visuell & akustisch klar	Jeder Effekt erhält eine sichtbare und hörbare Rückmeldung.


⸻

⚙️ 2. Mechanische Struktur

JSON-Beispiel (measures.json)

{
  "definitions": [
    { "id": "stabilisierung", "kosten": 20, "dauer": 30, "cd": 30, "effekt": "aufwandZuwachsMul=0.8" },
    { "id": "umlageverfahren", "kosten": 15, "dauer": 20, "cd": 20, "effekt": "automationMul=1.25" },
    { "id": "schadensbegrenzung", "kosten": 25, "dauer": 0,  "cd": 25, "effekt": "verwirrungAdd=-0.2" },
    { "id": "neuordnung", "kosten": 30, "dauer": 10, "cd": 40, "effekt": "klarheitClampMin=0.9" },
    { "id": "audit_vorbereitung", "kosten": 35, "dauer": 0,  "cd": 60, "effekt": "naechstesAuditMul=0.5" },
    { "id": "anreizprogramm", "kosten": 12, "dauer": 20, "cd": 20, "effekt": "motivationAdd=0.2;aufwandAdd=0.05" }
  ]
}


⸻

🏛️ 3. Maßnahmenkatalog (Basisversion)

ID	Bezeichnung	Beschreibung	Effekt	Kosten	Dauer	CD	UI-/Audioeffekt
stabilisierung	Temporäre Prozessstabilisierung	Verringert vorübergehend die Zunahme des Aufwands.	Aufwandzuwachs × 0.8	20 OP	30 s	30 s	Blaue Pulsation im Hintergrund
umlageverfahren	Internes Umlageverfahren	Erhöht die Automationsleistung um 25 %.	Automation × 1.25	15 OP	20 s	20 s	Büro-Klingel & sanfter Boost-Sound
schadensbegrenzung	Sonderausschuss Schadensbegrenzung	Reduziert Verwirrung sofort.	−0.2 Verwirrung	25 OP	sofort	25 s	Lautes „Formular geschlossen“-Sound
neuordnung	Formale Neuordnung	Stellt Klarheit kurzfristig auf mindestens 0.9.	Klarheit = max(Klarheit, 0.9)	30 OP	10 s	40 s	Weißer Screenflash mit Büro-Stempelton
audit_vorbereitung	Audit-Vorbereitung	Halbiert Effekte des nächsten Audits.	Audit-Effekte × 0.5	35 OP	bis Audit	60 s	Akustisches Aktenklappen-Geräusch
anreizprogramm	Team-Anreizprogramm	Erhöht Motivation, steigert aber auch Aufwand.	+0.2 Motivation / +0.05 Aufwand	12 OP	20 s	20 s	Freundlicher „Meeting-Ping“


⸻

💡 4. Erweiterbare Maßnahmenideen (Mid- & Late-Game)

ID	Bezeichnung	Beschreibung	Effekt	Kosten	Dauer	CD
standardisierung	Einführung neuer Formularnorm	Aufwandzuwachs −35 %, Klarheit +10 %.	aufwandZuwachsMul=0.65; klarheitAdd=0.1	40	45 s	60 s
fortbildungspflicht	Pflichtseminar Prozessoptimierung	Erhöht langfristig OP-Rate.	opGainMul=1.3	25	40 s	60 s
dienstweg_abkürzen	Nutzung des kleinen Dienstwegs	+50 % Klickeffizienz, aber erhöhte Fehlergefahr.	klickErtragMul=1.5; fehlerChanceMul=1.3	20	15 s	20 s
sozialkredit_bonus	Erhöhte Bewertung durch Vorgesetzte	VP-Bonus am Run-Ende +25 %.	vpBonusAdd=0.25	50	bis Run-Ende	90 s
haushaltsumwidmung	Budgetumschichtung genehmigt	Energieverbrauch −20 %.	energieVerbrauchMul=0.8	25	30 s	30 s
dezernatsfusion	Dezernate zusammengelegt	Alle Zustände stabilisieren sich langsam.	energieAdd=0.1; konzentrationAdd=0.1; motivationAdd=0.1	40	20 s	60 s
vollzugsmeldung	Notfallprotokoll	Sofortige Reduktion von Überlastung um 0.3.	ueberlastungAdd=-0.3	30	sofort	30 s


⸻

🧮 5. Kosten- & Balancing-Logik

Schwierigkeitsphase	OP-Einnahme (ø/min)	empfohlene Maßnahmekosten	empfohlene Dauer	empfohlene CD
Early Game	10–15	10–20 OP	20–30 s	20–30 s
Mid Game	20–35	20–40 OP	25–45 s	30–60 s
Late Game / Zen	35–60	30–60 OP	40–60 s	45–90 s

Empfehlung: Jede Maßnahme sollte max. 20 % der verfügbaren OP kosten, um strategische Nutzung, aber nicht Dauer-Spam zu fördern.

⸻

🔁 6. Interaktion mit Zuständen

Zustand	Positive Wirkung durch Maßnahmen	Negative Nebenwirkung
Energie	Regeneration durch „haushaltsumwidmung“	Erschöpfung bei „dienstweg_abkürzen“
Konzentration	Stabilisierung durch „fortbildungspflicht“	Verlust bei „anreizprogramm“
Motivation	Anstieg bei „anreizprogramm“	Übersteigerung → höherer Aufwand
Klarheit	Fixierung durch „neuordnung“	Keine direkte Nebenwirkung
Aufwand	Reduktion durch „stabilisierung“	Anstieg bei Effizienzboosts
Verwirrung	Senkung durch „schadensbegrenzung“	Steigerung bei Audit-Ereignissen
Überlastung	Reduktion durch „vollzugsmeldung“	kurzfristige Rückkopplung möglich


⸻

🎨 7. UI- & Feedback-Design

Element	Darstellung	Beispiel
Maßnahmenleiste	horizontale Button-Leiste am unteren HUD-Rand	Farbcode je Maßnahmentyp (blau = ordnung, rot = risiko, grün = motivation)
Cooldown-Indikator	Kreisring mit Restzeit	Grauton verblasst → Blau beim Reaktivieren
Aktiver Effekt	Leuchtende Stempel-Icons am oberen Rand	Tooltip: „Maßnahme läuft – verbleibende Dauer: XX s“
Sound	kurzer „Genehmigt“-Stempelton bei Aktivierung	Wav: stempel_confirm.wav


⸻

🧠 8. Implementierungshinweis
	•	MeasuresRuntime verwaltet Aktivierungen, Ablaufzeiten und Effekte.
	•	Effekte werden im Worker angewendet (keine doppelten Additionen im UI).
	•	Nutzung via Event-System:
	•	APPLY_MEASURE(id)
	•	MEASURE_EXPIRED(id)
	•	MEASURE_COOLDOWN_READY(id)

⸻

🔍 9. Tuning-Checkliste
	•	Keine Maßnahme darf OP-Decay kompensieren (keine Perma-Buffs).
	•	Mind. 1 Maßnahme pro Zustand vorhanden.
	•	UI-Feedback sichtbar < 0.3 s nach Klick.
	•	OP-Kosten skalieren mit Run-Dauer.
	•	Späte Maßnahmen beeinflussen mehrere Zustände gleichzeitig.

⸻

🧾 Fazit

Ordnungspunkte-Maßnahmen sind die Werkzeuge der temporären Macht.
Sie geben den Spieler:innen das Gefühl, im Chaos der Verwaltung kurzfristig Kontrolle zu gewinnen – wohl wissend, dass diese Kontrolle nur geliehen ist.

„Verwaltung ist kein Zustand. Sie ist ein ständiger Versuch, Ordnung zu beauftragen.“
— Handbuch für Maßnahmenkompetenz, §4.1