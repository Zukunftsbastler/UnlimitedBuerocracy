# Ordnungspunkte-System (OP) – Bürokratie der Unendlichkeit

> Ablagepfad: `packages/game-design/docs/balancing/ordnungspunkte_system.md`  
> Version: 1.0

---

## 🎯 Ziel
Ordnungspunkte (**OP**) stellen eine **taktische, temporäre Ressource** dar, die den Spieler für **strukturiertes, effizientes Arbeiten** belohnt und ihm erlaubt, kurzfristige **Verwaltungsmaßnahmen** auszulösen, um Chaos zu begrenzen oder Prozesse zu optimieren.

Im Gegensatz zu:
- **AP (Aktenpunkte)** → kurzfristige Output-Währung (Klick/Automation)  
- **VP (Verwaltungspunkte)** → langfristige Meta-Währung (Beförderungen, Kurse, Privilegien)  

…sind **OP** eine **laufzeitgebundene Steuerungskraft** – eine Art *innerbürokratische Disziplin*.

---

## 🧩 Grundprinzipien
1. **OP entstehen nicht aus AP**  
   – sie leiten sich aus geordnetem Verhalten im Run ab (hohe Klarheit, geringe Fehlerquote, niedriger Aufwand).

2. **OP verfallen wieder (Decay)**  
   – sie können nicht gehortet oder in spätere Runs übertragen werden.

3. **OP bezahlen temporäre Maßnahmen (Policies)**  
   – kleine, spürbare Eingriffe ins laufende System mit begrenzter Dauer.

4. **OP erzeugen einen zusätzlichen Entscheidungsspielraum**  
   – taktische Tiefe, ohne strategische Persistenz.

---

## ⚙️ Erzeugung (Tick-basiert)

Formel pro Simulationsschritt `dt`:
OP’ = OP
+ (r_base
+ a1 * max(0, klarheit - 0.6)
+ a2 * max(0, 0.7 - aufwand)
+ a3 * max(0, motivation - 0.5)
- b1 * fehlerquote
- b2 * spikes) * dt
- decay * OP * dt

**Empfohlene Standardwerte:**

| Parameter | Bedeutung | Default |
|------------|------------|----------|
| `r_base` | Grundzuwachs | 0.02 OP/s |
| `a1` | Bonus durch Klarheit | 0.30 |
| `a2` | Bonus durch geringen Aufwand | 0.25 |
| `a3` | Bonus durch Motivation | 0.15 |
| `b1` | Malus durch Fehler | 0.40 |
| `b2` | Malus durch Schwankungen (Spikes) | 0.20 |
| `decay` | natürlicher Verfall | 0.03/s |
| `cap` | Maximum | 100 |

**Bonuseffekte (optional):**
- „Fehlerfrei-Streak“: +0.1 OP/s, solange keine Fehler in den letzten 5 s.
- „Ruhiger Betrieb“: +0.05 OP/s bei Automation-Varianz < 5 %.

---

## 🧱 Verwendung (Maßnahmen)

Ordnungspunkte werden eingesetzt, um **temporäre bürokratische Maßnahmen** zu beantragen.  
Diese erzeugen gezielte, spürbare Effekte, wirken aber nur für die Dauer des Runs.

| Maßnahme (Bezeichnung) | Effekt | Kosten | Dauer | CD |
|------------------------|---------|--------:|-------:|----:|
| Temporäre Prozessstabilisierung | Aufwandzuwachs −20 % | 20 | 30 s | 30 s |
| Internes Umlageverfahren | Automation +25 % | 15 | 20 s | 20 s |
| Sonderausschuss Schadensbegrenzung | Verwirrung −0.2 (sofort) | 25 | – | 25 s |
| Formale Neuordnung | Klarheit = max(Klarheit, 0.9) | 30 | 10 s | 40 s |
| Audit-Vorbereitung | Nächstes Audit halbiert Effekte | 35 | bis Audit | 60 s |
| Team-Anreizprogramm | Motivation +0.2, Aufwand +0.05 | 12 | 20 s | 20 s |

**Regeln:**
- Maximal **5 aktive Maßnahmen** gleichzeitig.  
- Maßnahmen teilen sich eine globale Abklingzeit (CD), falls mehrfach aktiviert.  
- OP werden **sofort** bei Aktivierung abgezogen.  
- **Auto-Spend (optional):** Wenn Überlastung > 0.9 und OP ≥ 25 → automatisch „Schadensbegrenzung“.

---

## 🪶 Visualisierung im UI

| Element | Darstellung | Dynamik |
|----------|--------------|----------|
| **OP-Meter** | kreisförmiger Indikator (rechts im HUD) | Farbe wechselt von grün → gelb → rot je nach Ordnung |
| **Maßnahmenleiste** | Buttons mit Icons & Tooltips | Aktivierbar bei ausreichenden OP |
| **Aktive Maßnahmen** | Stempel-Icons im HUD mit Countdown | Ablauf per Fade-out + Soundeffekt |

**Tooltip-Stil:**  
> „Genehmigte Maßnahme zur temporären Aufrechterhaltung innerer Ordnung.“

---

## 📦 Beispielkonfiguration (`balancing.json`)

```json
{
  "ordnungspunkte": {
    "cap": 100,
    "decay": 0.03,
    "r_base": 0.02,
    "a": { "klarheit": 0.30, "aufwandNeg": 0.25, "motivation": 0.15 },
    "b": { "fehlerquote": 0.40, "spikes": 0.20 }
  },
  "measures": {
    "maxSimultan": 5,
    "definitions": [
      { "id":"stabilisierung", "kosten":20, "dauer":30, "cd":30, "effekt":"aufwandZuwachsMul=0.8" },
      { "id":"umlageverfahren", "kosten":15, "dauer":20, "cd":20, "effekt":"automationMul=1.25" },
      { "id":"schadensbegrenzung", "kosten":25, "dauer":0,  "cd":25, "effekt":"verwirrungAdd=-0.2" },
      { "id":"neuordnung", "kosten":30, "dauer":10, "cd":40, "effekt":"klarheitClampMin=0.9" },
      { "id":"audit_vorbereitung", "kosten":35, "dauer":0,  "cd":60, "effekt":"naechstesAuditMul=0.5" },
      { "id":"anreizprogramm", "kosten":12, "dauer":20, "cd":20, "effekt":"motivationAdd=0.2;aufwandAdd=0.05" }
    ]
  }
}