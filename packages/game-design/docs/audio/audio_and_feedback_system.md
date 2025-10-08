Audio- & Feedback-System – Bürokratie der Unendlichkeit

Ablagepfad: packages/game-design/docs/audio/audio_and_feedback_system.md
Version: 1.0

⸻

🎯 Ziel

Das Audio- & Feedback-System übersetzt Spielereignisse in hörbare und haptisch-visuelle Rückmeldungen.
Es unterstützt die kafkaesk-bürokratische Stimmung, ohne zu überfrachten, und bleibt barrierefrei, datengetrieben und performant.

⸻

🧩 Leitprinzipien
	•	Zurückhaltend, aber bedeutungsvoll: Wenige, klare Motive. Kein Dauerfeuer.
	•	Bürokratisches Klangbild: Papier, Stempel, Tacker, Neonbrummen, Flurhall.
	•	Adaptiv: Lautstärke und Dichte hängen von Ordnung/Aufwand und Zuständen ab.
	•	Nicht-blockierend: Audio läuft im WebAudio-Graph, Rendering bleibt frei.
	•	Barrierearm: Lautstärke, Ducking, Mute und Reduktion für sensible Nutzer.

⸻

🔊 Klangschichten (Layer)
	1.	UI-SFX – Klicks, Stempel, Tooltips, Tab-Wechsel.
	2.	Gameplay-SFX – Papierstapel, Automatismen, Power-Ups, Audits.
	3.	Ambience – Raumklang (Büro), Uhrticken, Klimaanlage, Neon.
	4.	Musik/Drone – dezente, „verwaltete“ Pads; verdichtet sich bei Chaos.
	5.	Voice-Tags (optional) – einzelne gesprochene Formulareinträge (selten).

Mixing-Priorität: Gameplay > UI > Musik > Ambience.

⸻

🧱 Architektur (WebAudio)

Komponenten
	•	AudioContext (einmalig, lazy)
	•	Busse (GainNodes): master, sfx, ui, amb, music
	•	Ducking: Sidechain-ähnlich via zeitgesteuertem Gain auf music
	•	Limiter (optional): DynamicsCompressorNode am Master

flowchart LR
  SRC1[BufferSource SFX] --> SFX(sfx bus)
  SRC2[BufferSource UI] --> UI(ui bus)
  SRC3[BufferSource Amb] --> AMB(amb bus)
  SRC4[BufferSource Music] --> MUS(music bus)
  SFX --> M(master)
  UI --> M
  AMB --> M
  MUS --> DUCK{duck}
  DUCK --> M
  M --> OUT((destination))


⸻

🧰 AudioService – API (High-Level)

export interface AudioService {
  init(): Promise<void>; // lädt Assets, erstellt Kontext & Busse
  playSfx(id: SfxId, opts?: { volume?: number; rate?: number }): void;
  playUi(id: UiId, opts?: { volume?: number; rate?: number }): void;
  playAmb(id: AmbId, loop?: boolean): void;
  playMusic(id: MusicId, opts?: { loop?: boolean; fadeMs?: number }): void;
  stopMusic(fadeMs?: number): void;
  setBusVolume(bus: 'master'|'sfx'|'ui'|'amb'|'music', vol: number): void;
  setDucking(amount: number, releaseMs?: number): void; // 0..1
}

Kontextabhängige Helfer

onRunStart(); onRunEnd(); onAudit(); onPowerUp(id); onOverload(level);


⸻

📦 Asset-Pipeline
	•	Formate: OGG (primär), MP3 (Fallback), WAV (nur für Prototyp/Recording).
	•	Loudness-Norm: Ziel -16 LUFS integrierte Lautheit; Peaks < -1 dBFS.
	•	Benennung: category_name_variant.ogg (z. B. sfx_stamp_soft.ogg).
	•	Ordner: apps/web/public/audio/{sfx,ui,amb,music}.
	•	Preload-Manifest: audio_manifest.json mit Pfaden, Lautstärke-Offsets, Tags.

Beispiel audio_manifest.json

{
  "sfx": {
    "stamp_soft": { "src": "/audio/sfx/stamp_soft.ogg", "gain": -3 },
    "paper_shuffle": { "src": "/audio/sfx/paper_shuffle.ogg", "gain": -6 }
  },
  "ui": {
    "hover": { "src": "/audio/ui/hover.ogg", "gain": -12 },
    "click": { "src": "/audio/ui/click.ogg", "gain": -10 }
  },
  "amb": {
    "office_day": { "src": "/audio/amb/office_day.ogg", "gain": -14, "loop": true }
  },
  "music": {
    "drone_calm": { "src": "/audio/music/drone_calm.ogg", "gain": -12, "loop": true },
    "drone_chaos": { "src": "/audio/music/drone_chaos.ogg", "gain": -12, "loop": true }
  }
}


⸻

🎚️ Dynamik & Parameter-Mapping

Audio reagiert auf Zustände und Meter:

Input	Mapping	Wirkung
klarheit ↑	music Filter öffnet (LPF 500→3000 Hz)	mehr Transparenz
aufwand ↑	music Gain +2..+6 dB, amb Noise +3 dB	dichter, lauter
energie ↓	SFX-Rate −10 %, UI-Klick leiser	Trägheit
ueberlastung ↑	Ducking music 0.4→0.7	Fokus auf SFX/Warnung

Preset-Wechsel: drone_calm ⇄ drone_chaos bei aufwand Schwellen 0.6/0.4 (Hysterese).

⸻

🧪 Ereignis→Audio-Matrix

Ereignis	SFX	Musik	Ambience	Notiz
Klick/Stempel	sfx.stamp_soft	–	–	kurzer Attack, 200ms
Tooltip Open	ui.hover	–	–	sehr leise
Power-Up aktiv	sfx.power_on	Ducking 0.5/400ms	–	Glanzlayer
Audit	sfx.gong_low	drone_chaos +3 dB	amb.office_day +1 dB	Warnblende
Run-Ende	sfx.paper_close	FadeOut 800ms	–	Feierabend
Beförderung	sfx.stamp_heavy	drone_calm +2 dB	Papierrauschen	feierlich nüchtern


⸻

🧭 UX-Regeln
	•	Max. 1 SFX pro 80 ms (Throttle) pro Kategorie.
	•	Seriendämpfung: bei 5+ identischen SFX in 1 s → -6 dB darauf folgende Treffern.
	•	Ducking: bei Warnungen: Musik -6 dB für 600 ms.
	•	Mute/Reduce: Schalter: Mute, -50 %, Normal.

⸻

♿ Barrierefreiheit
	•	Audio-Globaleinstellungen: Lautstärke pro Bus, Mute, „Reduzierte Effekte“.
	•	Haptisches Feedback (optional): Vibration über WebHaptics (falls verfügbar) synchron zu sfx.stamp_soft & Warnungen.
	•	Visuelle Spiegelung: Jede Audio-Warnung hat ein visuelles Gegenstück (Farbflash, Outline).

⸻

⚙️ Implementierungsplan
	1.	AudioService mit Bussen, Preload & Cache (AudioBuffer, Promise-Registry).
	2.	State-Mapping (Zustände → Parameter) im AudioConductor (kleiner Ticker in UI).
	3.	Event-Hooks in Engine/Worker → UI Dispatch → Audio.
	4.	Settings-Panel (Slider, Mute, Test-Sound).
	5.	Assets produzieren (10 SFX, 2 Drones, 1 Ambience) – Loudness-Check.

⸻

🧪 Tests
	•	Unit: Preload, Play, Stop, Ducking-Envelope.
	•	E2E: hörbares Feedback bei Klick, Audit, Power-Up, Run-Ende.
	•	Performance: CPU < 3 % im Idle (AudioContext + 3 Loops), Garbage minimal.

⸻

📁 Dateien
	•	apps/web/src/services/audio/audioService.ts
	•	apps/web/src/services/audio/audioManifest.ts
	•	apps/web/src/services/audio/audioConductor.ts (State-Mapping)
	•	apps/web/public/audio/... (Assets)
	•	apps/web/src/features/settings/AudioSettings.tsx

⸻

📘 Stil & Klangbibliothek (Empfehlung)
	•	SFX-Erzeugung: kurze, trockene Samples; wenig Hall (Büro ist trocken).
	•	Musik: 2 Layer – „calm“ (ruhige Drone), „chaos“ (gesättigt, pulsierend).
	•	Ambience: Lüfter/Neon/Raum – subtil, nicht nervig.

⸻

🧾 Zusammenfassung

Das Audio- & Feedback-System stützt das Gefühl einer überstrukturierten, kontrollierten Umgebung:
SFX sind präzise, Musik reagiert auf Ordnung/Aufwand, und Warnungen rücken mechanisch in den Vordergrund.
Durch WebAudio-Busse, Ducking und datengetriebene Manifeste bleibt die Umsetzung skalierbar und teamfähig.