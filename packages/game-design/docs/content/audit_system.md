Das Audit-System

Ein Audit ist eine zeitlich begrenzte Überprüfung des Systems, bei der die Verwaltung die Ordnung des Spielers selbst untersucht.
Narrativ stellt es eine Mischung aus Kontrolle, Prüfung und metaphysischem Feedback dar: Das System beobachtet sich selbst – und zieht Konsequenzen.

Audits treten nicht zufällig, sondern pseudoregular auf. Sie sind die strukturelle Rückkopplung zwischen Chaos und Ordnung: Wenn ein Spieler zu lange zu effizient arbeitet oder zu viele Fehler anhäuft, kündigt das System eine Prüfung an.

⸻

Grundprinzipien

Ein Audit ist eine temporäre Spielphase von 10–60 Sekunden, in der bestimmte Regeln geändert werden.
Der Spieler wird aus seinem gewohnten Rhythmus gerissen – Klickgeschwindigkeit, Zustandsveränderungen und UI-Effekte ändern sich spürbar.
Audits sind nicht optional. Sie erscheinen als Teil des Systems selbst: ein unentrinnbares Selbstkontrollinstrument der Bürokratie.

Audits haben immer drei Phasen:
	1.	Ankündigung: Das System kündigt das Audit mit akustischen Signalen und visuellen Effekten an – z. B. blinkende Akten, lauter werdender Hintergrundton oder ein eingeblendetes Formular mit der Überschrift „Audit in Vorbereitung – Bitte bleiben Sie ruhig.“
	2.	Durchführung: Während des Audits werden Werte überprüft und Zustände aktiv beeinflusst.
	3.	Auswertung: Nach Ablauf der Prüfzeit entscheidet das System, ob der Spieler den Audit bestanden hat oder nicht. Diese Entscheidung kann einen Run-Ende-Trigger auslösen.

⸻

Auslöser eines Audits

Ein Audit kann auf mehrere Arten ausgelöst werden:
	•	Zeitbasiert: Nach einer festen Zeitspanne (z. B. alle 3 Minuten Simulationszeit).
	•	Fehlerbasiert: Wenn innerhalb kurzer Zeit zu viele Fehlstempel oder ineffiziente Aktionen erfolgen.
	•	Zustandsbasiert: Wenn Klarheit unter 0.5 fällt oder Verwirrung über 0.8 steigt.
	•	Ereignisbasiert: Bestimmte Power-Ups oder Maßnahmen (z. B. „Dienstweg abkürzen“) können ein Sonder-Audit provozieren.

Die Auslöser sind kumulativ gewichtet, sodass sich ein Audit häufiger ankündigt, je chaotischer der Zustand des Systems ist.

⸻

Ablauf und Wirkung

Während des Audits ändert sich das Verhalten der Kernsimulation spürbar.
Der Bildschirm erhält eine leicht rötliche oder gelbliche Färbung (je nach Schwere des Audits).
Bestimmte Klicks sind deaktiviert oder führen zu unvorhersehbaren Effekten.
Zustände wie Klarheit, Aufwand und Verwirrung bewegen sich stärker gegeneinander: kleine Abweichungen werden stark verstärkt.

Beispiel:
Wenn der Spieler mit 0.6 Klarheit und 0.3 Verwirrung in ein Audit geht, kann das Audit innerhalb weniger Sekunden beide Werte in gegensätzliche Extreme verschieben.
Das Ziel ist, die Kontrolle zu behalten – durch korrektes Timing, rechtzeitige Maßnahmen oder das gezielte Aktivieren von Ordnungspunkten.

⸻

Bestehen und Scheitern

Das Audit bewertet den Zustand des Systems am Ende der Prüfphase.
Dabei werden Klarheit, Verwirrung und Aufwand zu einem Bewertungswert verrechnet:

auditScore = klarheit * 0.5 - verwirrung * 0.3 - aufwand * 0.2

Wenn der Audit-Score über einem Schwellenwert (z. B. 0.25) liegt, gilt das Audit als bestanden.
Liegt er darunter, gilt das Audit als gescheitert.

Bei Bestandenen Audits erhält der Spieler eine kleine Belohnung (z. B. zusätzliche Ordnungspunkte, eine temporäre Effizienzsteigerung oder ein Bonus auf VP am Run-Ende).
Bei Gescheiterten Audits folgt sofortige Strafe:
Verwirrung steigt stark an, Klarheit sinkt deutlich, oder – im schlimmsten Fall – der Run endet direkt mit dem Kommentar „Audit negativ – Vollzugsmeldung ausgestellt.“

⸻

Einflussmöglichkeiten durch den Spieler

Der Spieler kann Audits nicht vermeiden, aber vorbereiten.
Das System soll den Eindruck vermitteln, dass Kontrolle möglich, aber nie vollständig ist.
Folgende Maßnahmen wirken sich direkt auf Audits aus:
	•	Audit-Vorbereitung: Halbiert die negativen Effekte des nächsten Audits.
	•	Neuordnung: Erhöht kurzfristig die Klarheit, wodurch das Audit leichter zu bestehen ist.
	•	Stabilisierung: Dämpft Aufwandzuwachs während des Audits, was sekundär hilft.
	•	Anreizprogramm: Erhöht Motivation, was zu mehr Klickgeschwindigkeit führt – kann riskant sein, aber die Performance verbessern.

Langfristig können im Skilltree Meta-Upgrades freigeschaltet werden, die z. B. den Audit-Score um einen Prozentsatz verbessern oder die Häufigkeit von Audits reduzieren.

⸻

Visuelles und akustisches Feedback

Audits sollen sich spürbar bedrohlich anfühlen.
Das UI verdunkelt sich, Farben verschieben sich ins Kalte, der Cursor zittert leicht, und die Musik schwillt zu einem tiefen Brummen an.
Ein digitales Stempelgeräusch ertönt regelmäßig im Hintergrund, als würde das System selbst Formulare gegen den Spieler abstempeln.

Am oberen Bildschirmrand erscheint ein Fortschrittsbalken mit der Beschriftung:

„Audit läuft – bitte bleiben Sie ruhig.“

Der Spieler kann währenddessen weiterarbeiten, aber jeder Klick wirkt sich stärker auf die Zustände aus.
Die meisten Power-Ups sind deaktiviert, außer solchen, die direkt auf Klarheit oder Aufwand wirken.

⸻

Meta-Design-Ziel

Audits erfüllen mehrere Funktionen gleichzeitig:
	1.	Spannungsschübe: Sie unterbrechen den gewohnten Spielfluss in unregelmäßigen Abständen.
	2.	Lernmechanik: Sie zwingen Spieler, das System zu verstehen – wer sich vorbereitet, besteht.
	3.	Bürokratisches Drama: Sie sind das Gefühl, „vom eigenen System überprüft zu werden“.
	4.	Balancing-Werkzeug: Sie verhindern endloses Grinding, weil sie Runs aktiv verkürzen können.
	5.	Narrative Tiefe: Sie verstärken den kafkaesken Charakter – der Spieler erlebt Kontrolle als Illusion.

⸻

Erweiterte Ideen (Spätphase)
	•	Audit-Level: Spätere Audits werden systemisch intelligenter und adaptiv – sie reagieren auf Spielstil.
	•	Schein-Audits: Falsche Prüfungen, die keinen Effekt haben, aber denselben Stress erzeugen.
	•	Re-Audit: Wird ausgelöst, wenn ein Audit erfolgreich manipuliert wurde – doppelter Effekt.
	•	Voll-Audit: Endgame-Ereignis, das alle Zustände gleichzeitig bewertet und direkt über Run-Ende oder Prestige entscheidet.

⸻

Fazit

Ein Audit ist kein gewöhnliches Ereignis, sondern das bürokratische Gewissen des Spiels.
Es überprüft nicht nur die Zustände der Spielfigur, sondern symbolisch auch das Verhalten des Spielers selbst – ob er die Ordnung wirklich versteht oder sie nur reproduziert.

„Das Audit ist keine Prüfung. Es ist die Verwaltung, die nach sich selbst sucht.“
— Auszug aus dem Handbuch für Selbstkontrolle, §12.3