/**
 * Text Layout Utilities for Form Rendering
 * 1960s-80s bureaucratic form style
 */

export function splitIntoParagraphs(text: string): string[] {
  // Clean text and split into paragraphs
  const cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Split at periods, but avoid common abbreviations
  const parts = cleaned
    .split(/(?<=\.)\s+(?![a-zäöüß])/i)
    .map((p) => p.trim())
    .filter(Boolean);
  
  return parts;
}

export function seededVariation(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  
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
    paragraphGap: rnd(8, 14),
  };
}

// Form department headers for authentic bureaucratic feel
export const FORM_HEADERS = [
  'Abt. 47/B – Vordruckwesen',
  'Hauptamt für verwaltungstechnische Vorgänge',
  'Interne Verfügungsstelle für Antragswesen',
  'Referat für Aktenfortschreibung und Nachbearbeitung',
  'Koordinierungsstelle für organisatorische Zuständigkeiten',
  'Zentrale Registratur zur Selbstprüfung',
  'Amt für die Sicherung der formalen Ordnung',
  'Büro für übergeordnete Unterlagenprüfung',
  'Sektion für redundante Verwaltungsprozesse',
  'Archiv der fortlaufenden Aktenneuerfassung',
];
