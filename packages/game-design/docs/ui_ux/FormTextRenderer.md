# FormTextRenderer – 1960–80er-Jahre Formular-Look

Diese Datei beschreibt, wie Texte aus `form_texts.json` in einem typischen Formularstil der 1960er bis 1980er Jahre gerendert werden können.  
Das Ziel ist ein authentischer, leicht gealterter Behörden-Look: sauber, aber leicht absurd.  
Der unten stehende Code ist ein **Vorschlag** und nutzt **möglicherweise nicht exakt korrekte Pfade** – diese müssen ggf. an dein Projekt angepasst werden.

---

## 🎨 Gestaltungsprinzipien

- **Schriftarten:**  
  - Haupttext: *IBM Plex Sans* – neutral, technisch, wirkt amtlich  
  - Kopf-/Fußzeilen: *IBM Plex Mono* – erinnert an Schreibmaschine oder Kopie  
- **Textausrichtung:** Blocksatz mit deutscher Silbentrennung (`hyphens: auto`)  
- **Positionierung:** Text beginnt **nicht am oberen Rand**, sondern etwa **20–30 %** weiter unten  
- **Variation:** Jeder Formulartext erhält leichte zufällige Abweichungen (Rotation, Abstand, Spaltenbreite usw.)  
- **Look:** wie Kopie eines Schreibmaschinenformulars oder altes Amtsblatt (60er–80er Jahre)  
- **Titelgestaltung:** keine übergroßen Überschriften – stattdessen dieselbe Schriftart, **fett** oder **versalien**  

---

## 🧩 Aufbau & Komponenten (Vorschlag)

Der folgende Code demonstriert eine mögliche Implementierung in React + TypeScript.  
Er erzeugt typografisch glaubhafte Formulare auf zufälligen Papier-Canvases.  
**Hinweis:** Pfade und Strukturen sind als Vorschlag zu verstehen.

---

### Fonts & Styles

```bash
pnpm add @fontsource/ibm-plex-sans @fontsource/ibm-plex-mono

:root {
  --form-font: "IBM Plex Sans", system-ui, Arial, Helvetica, sans-serif;
  --form-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, monospace;
}

.form-text-justified {
  text-align: justify;
  text-justify: inter-word;
  hyphens: auto;
}

.form-print-grain {
  position: relative;
}

.form-print-grain::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.06;
  background:
    radial-gradient(circle at 20% 30%, #000 0 0.5px, transparent 1px),
    radial-gradient(circle at 70% 60%, #000 0 0.5px, transparent 1px);
  mix-blend-mode: multiply;
  filter: contrast(120%) brightness(95%);
}

Layout-Utils (z. B. utils/textLayout.ts)
export function splitIntoParagraphs(text: string): string[] {
  // Trenne Text in Absätze an Punkten, vermeide gängige Abkürzungen
  const cleaned = text.replace(/\s+/g, " ").trim();
  const parts = cleaned
    .split(/(?<=\.)\s+(?![a-zäöüß])/i)
    .map(p => p.trim())
    .filter(Boolean);
  return parts;
}

export function seededVariation(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const rnd = (min: number, max: number) => {
    h ^= h << 13;
    h ^= h >> 17;
    h ^= h << 5;
    const t = (h >>> 0) / 0xffffffff;
    return min + (max - min) * t;
  };
  return {
    rotateDeg: rnd(-2.0, 2.0),
    topShiftPct: rnd(18, 32),
    maxWidthPct: rnd(56, 70),
    lineHeight: rnd(1.35, 1.55),
    letterSpacing: rnd(-0.1, 0.15),
    paragraphGap: rnd(8, 14)
  };
}


Komponente (z. B. components/FormTextRenderer.tsx)
import React, { useMemo } from "react";
import { splitIntoParagraphs, seededVariation } from "../utils/textLayout";

type FormText = { title: string; text: string };

interface Props {
  content: FormText;
  lang?: string;
  alignCenterBlock?: boolean;
}

const FormTextRenderer: React.FC<Props> = ({
  content,
  lang = "de",
  alignCenterBlock = true
}) => {
  const paras = useMemo(() => splitIntoParagraphs(content.text), [content.text]);
  const v = useMemo(
    () => seededVariation(content.title + content.text.slice(0, 16)),
    [content]
  );

  const containerStyle: React.CSSProperties = {
    transform: `rotate(${v.rotateDeg}deg)`,
    top: `${v.topShiftPct}%`,
    maxWidth: `${v.maxWidthPct}%`,
    lineHeight: v.lineHeight.toString(),
    letterSpacing: `${v.letterSpacing}px`,
    gap: `${v.paragraphGap}px`
  };

  return (
    <section
      className={`form-print-grain ${
        alignCenterBlock ? "absolute left-1/2 -translate-x-1/2" : ""
      } px-6`}
      style={containerStyle}
      lang={lang}
      aria-label="Formulartext"
    >
      <h2
        className="font-semibold mb-2"
        style={{
          fontFamily: "var(--form-font)",
          fontSize: "1rem",
          letterSpacing: "0.02em"
        }}
      >
        {content.title.toUpperCase()}
      </h2>

      <div className="h-px w-full mb-3" style={{ background: "rgba(0,0,0,.55)" }} />

      <div
        className="form-text-justified flex flex-col"
        style={{ fontFamily: "var(--form-font)", fontSize: "0.95rem" }}
      >
        {paras.map((p, i) => (
          <p key={i} className="mb-0">
            {p}
          </p>
        ))}
      </div>

      <div
        className="mt-3 text-xs opacity-70"
        style={{ fontFamily: "var(--form-mono)" }}
      >
        AZ: — / Blatt: 1 / Kopie
      </div>
    </section>
  );
};

export default FormTextRenderer;

Verwendung
import FormTextRenderer from "./components/FormTextRenderer";
import texts from "@/data/form_texts.json";

const random = texts[Math.floor(Math.random() * texts.length)];

export function ActiveForm() {
  return (
    <div className="relative w-full h-full">
      {/* Beispiel: Hintergrundpapier */}
      {/* <img src={bg} className="absolute inset-0 w-full h-full object-contain" /> */}
      <FormTextRenderer content={random} />
    </div>
  );
}


Um noch mehr Bürokratie-Charme zu erzeugen, kannst du pro Formular eine generierte Kopfzeile hinzufügen.
Diese kann aus einem einfachen JSON stammen (z. B. /src/data/form_headers.json), das zufällig kombiniert wird.

Beispielinhalt
[
  "Abt. 47/B – Vordruckwesen",
  "Hauptamt für verwaltungstechnische Vorgänge",
  "Interne Verfügungsstelle für Antragswesen",
  "Referat für Aktenfortschreibung und Nachbearbeitung",
  "Koordinierungsstelle für organisatorische Zuständigkeiten",
  "Zentrale Registratur zur Selbstprüfung",
  "Amt für die Sicherung der formalen Ordnung",
  "Büro für übergeordnete Unterlagenprüfung",
  "Sektion für redundante Verwaltungsprozesse",
  "Archiv der fortlaufenden Aktenneuerfassung"
]

Diese Kopfzeile kannst du über der Titelzeile anzeigen:
const header = headers[Math.floor(Math.random() * headers.length)];
...
<p
  className="text-xs opacity-80 mb-1"
  style={{ fontFamily: "var(--form-mono)" }}
>
  {header}
</p>