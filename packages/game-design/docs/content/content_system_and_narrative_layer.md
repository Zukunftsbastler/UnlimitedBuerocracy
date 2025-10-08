Content-System & Narrative Layer – Bürokratie der Unendlichkeit

Ablagepfad: packages/game-design/docs/content/content_system_and_narrative_layer.md
Version: 1.0

⸻

🎯 Ziel

Dieses Dokument beschreibt das Content-System und den narrativen Layer von Bürokratie der Unendlichkeit.
Es legt fest, wie Texte, Tooltips, Ereignisse und sarkastische Nachrichten erzeugt, gespeichert, getriggert und erweitert werden.

Der Content ist integraler Bestandteil der Atmosphäre des Spiels: Er vermittelt kafkaeske Überforderung durch bürokratisch-formalistische Sprache, strukturiert in klaren, datengetriebenen Einheiten.

⸻

🧩 Systemarchitektur

Das Content-System besteht aus:
	1.	Content-Packs – Sammlungen von Texten, Tooltips, Ereignissen etc. im JSON-Format.
	2.	Trigger-System – entscheidet, welche Inhalte wann angezeigt werden.
	3.	ContentService – zentrale API für UI und Simulation (Zufall, Filter, Gewichtung).
	4.	Linter & Tools – Validierung und Vorschau von Content-Packs (CLI).
	5.	Dexie-Integration – lokale Speicherung und Versionierung.

⸻

📦 Content-Packs

Struktur

{
  "id": "core-de-v1",
  "version": "1.0",
  "sprache": "de",
  "inhalt": [ContentDoc, ...]
}

ContentDoc

interface ContentDoc {
  id: string;
  schluessel: string;         // eindeutiger Key
  text: string;               // eigentlicher Inhalt
  tags: string[];             // Filter & Sortierung
  seltenheit: 'haeufig' | 'ungewoehnlich' | 'rar';
  gewicht: number;            // Wahrscheinlichkeit im Pool
  cooldownSek: number;        // Sperrzeit nach Anzeige
  trigger?: Trigger;          // optionale Anzeige-Bedingung
  typ?: 'tooltip' | 'dialog' | 'nachricht' | 'ereignis';
}

Trigger

interface Trigger {
  rangMin?: number;
  klarheitMin?: number;
  aufwandMax?: number;
  laufzeitSekMin?: number;
  praedikat?: string; // z.B. 'audit', 'pause', 'befoerderung'
}

Beispiel:

{
  "id": "msg_kaffee_pause_01",
  "schluessel": "nachricht.pause.kaffee",
  "text": "Sie genehmigen sich eine Pause. Der Kaffee schmeckt nach Einverständniserklärung.",
  "tags": ["pause", "energie"],
  "seltenheit": "haeufig",
  "gewicht": 2,
  "cooldownSek": 180,
  "trigger": {"energie": 0.3, "praedikat": "pause"}
}


⸻

⚙️ Trigger-System

Das Trigger-System filtert Inhalte nach Spielzustand.
Ein ContentTrigger prüft Werte aus dem aktuellen Snapshot:

function isTriggerActive(trigger: Trigger, state: GameSnapshot): boolean

Ablauf:
	1.	Alle ContentDocs mit passenden Tags zum Eventtyp werden geladen.
	2.	Alle mit aktiven Triggerbedingungen werden gefiltert.
	3.	Auswahl per Gewichtung & Seltenheit.
	4.	Bei Anzeige → cooldownSek aktivieren.

Beispiel-Events:

Event	TriggerKey	Beschreibung
Energie niedrig	energie < 0.3	Meldungen über Erschöpfung
Aufwand hoch	aufwand > 0.8	Chaos-Texte, Büro-Alarm
Neuer Rang	rangMin <= aktuellerRang	Beförderungstexte
Laufzeit lang	laufzeitSekMin	Langzeit-Dialoge


⸻

🗂️ Typen von Content

Typ	Beschreibung	Beispiel
tooltip	UI-Hilfe, bürokratisch formuliert	„Statusangaben sind verbindlich, bis sie rückwirkend angepasst werden.“
dialog	kurze Bildschirm-Overlays	„Sie haben ein Formular erfolgreich nicht abgeschickt.“
nachricht	zufällige Büro-Kommentare	„Ihr Antrag auf Verständnis wurde eingereicht.“
ereignis	Gameplay-Reaktionen (z. B. Audit, Beförderung)	„Das Dezernat hat neue Zielvorgaben festgelegt.“


⸻

🧠 Gewichtung & Seltenheit

Seltenheit	Gewicht	Beschreibung
haeufig	1–3	Alltagsmeldungen
ungewoehnlich	4–8	besondere Reaktionen
rar	10+	seltene Meta-/Philosophie-Texte

Gewichtete Auswahl:

p(anzeige) = gewicht / Σ(gewicht aller aktiven Einträge)

Einträge mit höherer Seltenheit erscheinen seltener, aber mit stärkerem Effekt (z. B. Farbwechsel, Ton, Zitat).

⸻

🧮 Zufall & Kontrolle

Verwendet deterministischen PRNG mit Seed = runId + contentPackId.

Ziel: gleiche Seed → gleiche Content-Sequenz (reproduzierbar für Tests).
PRNG implementiert über Mulberry32.

⸻

💾 Speicherung & Versionierung
	•	Content-Packs sind versioniert (z. B. core-de-v1, core-de-v2).
	•	Dexie speichert Metadaten:

interface ContentMeta {
  id: string;          // Pack-ID
  version: string;     // semver
  aktiv: boolean;      // aktiviert im aktuellen Build
  cooldowns: Record<string, number>; // pro ContentDoc
}

Beim Spielstart prüft der Loader auf neue Versionen und migriert automatisch.

⸻

🔍 Linter-Regeln

Zod-basierte Validierung
	•	text min. 5 Zeichen, keine Sonderzeichen außerhalb [.,!?():;-\n]
	•	Keine Dopplungen von schluessel.
	•	Tags nur aus vordefinierter Liste (pause, audit, energie, klarheit, befoerderung, aufwand, meta).

CLI-Command

pnpm run lint:content

Validiert alle JSON-Dateien in packages/content-packs/.

Optionen:
	•	--pack core-de-v1 → validiert spezifisches Pack.
	•	--strict → bricht bei Warnung ab.

⸻

🧩 Narrative Layer

Ton & Stil
	•	Bürokratisch, sarkastisch, überformalisiert.
	•	Keine direkte Emotion, nur Prozesslogik.
	•	Ironische Selbstreferenzen erlaubt (Meta-Texte z. B. über Spielsysteme).
	•	Stilrichtlinie: „Kafka trifft Verwaltungsakt“.

Sprachregeln
	•	Verwende Passiv: „wurde eingereicht“, „konnte nicht zugeordnet werden“.
	•	Häufige Substantivketten: „Antragsverzögerungsoptimierung“.
	•	Satzlänge variabel, bevorzugt 1–2 Hauptsätze.
	•	Kein Umgangston, keine Slangwörter.

Kategorien

Kategorie	Beispiel	Stil
Routine	„Der Vorgang läuft erwartungsgemäß schleppend.“	neutral
Warnung	„Ihr Effizienzdefizit wurde behördlich festgestellt.“	formal
Erfolg	„Ihr Formular hat ein positives Selbstbild entwickelt.“	absurd
Meta	„Das System dankt für Ihre fortgesetzte Simulation.“	ironisch


⸻

🎭 Dynamische Platzhalter

Unterstützung für Laufzeitvariablen im Text:

"text": "Sie haben ${akten} Akten bearbeitet, ${name}."

Laufzeitersetzung durch formatText().

Reservierte Platzhalter:
	•	${name} – Spielername oder Rangtitel
	•	${akten} – Anzahl bearbeiteter Akten
	•	${zeit} – aktuelle Spielzeit im Run
	•	${vp} – verdiente VP

⸻

🧰 Tools & Previewer

Content Previewer (Dev-UI)
	•	Filter nach Tags, Trigger, Gewicht, Typ.
	•	Zufallsauswahl simulieren.
	•	Cooldowns testen.
	•	Direktlink zu JSON-Editor.

Editor-Vorschlag

Ein einfacher WYSIWYG-ähnlicher Editor im Browser:
	•	Validierung via Zod.
	•	Autocomplete für Tags.
	•	Vorschau der Wahrscheinlichkeit (Balken).

⸻

🧾 Erweiterbarkeit
	•	Neue Sprachen = neues Pack (core-en-v1, core-da-v1).
	•	Externe Mods (User-Packs) möglich – Sandbox-Validierung beim Import.
	•	Packs werden über Signaturen geprüft (sha256) und lokal registriert.

⸻

🧮 Beispiel eines Mini-Packs

{
  "id": "core-de-v1",
  "version": "1.0",
  "sprache": "de",
  "inhalt": [
    {
      "id": "nachricht_01",
      "schluessel": "system.willkommen",
      "text": "Willkommen im Dezernat für unbegrenzte Zuständigkeiten.",
      "tags": ["meta"],
      "seltenheit": "haeufig",
      "gewicht": 1,
      "cooldownSek": 60
    },
    {
      "id": "ereignis_05",
      "schluessel": "audit.start",
      "text": "Ein spontanes Audit hat Ihre Pläne formal bestätigt und faktisch verzögert.",
      "tags": ["audit", "aufwand"],
      "seltenheit": "ungewoehnlich",
      "gewicht": 3,
      "cooldownSek": 120,
      "trigger": {"aufwandMax": 0.7, "praedikat": "audit"}
    }
  ]
}


⸻

🧾 Zusammenfassung

Das Content-System bietet:
	•	modulare, versionierte Packs,
	•	deterministische Triggerlogik,
	•	formalisierte Schreibregeln,
	•	Tools zur Pflege und Vorschau.

Es schafft eine skalierbare Grundlage, um hundertfach variierende, satirisch-bürokratische Texte zu liefern, die sich dynamisch an den Spielzustand anpassen.

⸻

✅ Nächste Schritte
	1.	Implementierung von ContentService (Laden, Caching, Triggerprüfung, Weighted Pick).
	2.	CLI-Linter mit Zod-Validierung fertigstellen.
	3.	JSON-Schema für ContentDoc/Pack in packages/game-core/contracts ablegen.
	4.	Content-Previewer-UI entwickeln.
	5.	Erstellen weiterer Packs: core-tooltips-de-v1, core-narrative-de-v1, core-events-de-v1.