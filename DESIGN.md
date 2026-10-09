# DESIGN.md — Architecture & Color Discipline

## 1. THREE-PART COLOR SYSTEM CONSTITUTION

This application uses a strict three-part color system to eliminate visual noise and guarantee clarity.

### System 1: Primary System (Single-Hue Focus Only)
- `primary` (`#007AFF`), `primary-600` (`#0062CC`), `primary-100` (`#E8F1FF`), `primary-50` (`#F4F9FF`)
- Used **ONLY** for:
  - Primary buttons and their hover state (`primary` / `primary-600`).
  - Active navigation item background and icon/text (`primary-100` background + `primary` icon/text).
  - Active/selected filter or segmented-control state.
  - Focus rings.
  - The single most important metric or chart line per screen (e.g. Lead Volume Trend).
- *Never* use full-strength primary for anything decorative or for more than one element's worth of emphasis per screen.

### System 2: Semantic System (Status & Meaning Only)
Used **ONLY** where color conveys status or functional meaning. Never used for decorative purposes or neutral categories.
- `success` (`#3D9A5C`): SLA healthy, handoff expected & met, successful operations.
- `warning` (`#C17E1F`): SLA at risk, warm lead temperature, notes/annotations, manual action required.
- `danger` (`#C4453A`): SLA failed, hot lead temperature, error states, API delivery failures.
- `info` (`#4A8FA8`): Neutral operational status, bot messages, scenario badges in diagnostics.

### System 3: Categorical System (Identity & Classification Only)
Used **ONLY** for classification without status or rank implication. Assigned in a fixed, consistent order so the same category always gets the same color everywhere.
- `cat-1` (`#007AFF` - iOS Blue / Reused primary as natural default for WhatsApp)
- `cat-2` (`#9CA3AF` - Muted Gray)
- `cat-3` (`#C9A24B` - Antique Gold)
- `cat-4` (`#B37B99` - Muted Plum)

---

## 2. NEUTRAL CANVAS & SIDEBAR SURFACES

- `bg` (`#F8F9FB`): App background canvas (subtle slate white, clean and modern).
- `card` (`#FFFFFF`): Elevated content cards and panels.
- `border` (`#EEF0F3`): Delicate structural hairline borders.
- `text-900` (`#1C1E26`): Executive Charcoal (headings, stat numbers, lead titles).
- `text-500` (`#6B7280`): Body text, secondary details.
- `text-400` (`#9CA3AF`): Footnotes, metadata, timestamps.
- `sidebar-bg` (`#FFFFFF` or `#F8F9FB`): Ultra-clean light sidebar.
- `sidebar-text` (`#6B7280`): Muted charcoal for inactive navigation items.

---

## 3. COLOR SYSTEM DECISION TABLE

| Page / Component | Color Used | System | Rationale |
| :--- | :--- | :--- | :--- |
| **Sidebar Canvas** | `sidebar-bg` (`#FFFFFF`) | Surface | Clean, crisp sidebar area matching iOS style |
| **Sidebar Nav Inactive** | `sidebar-text` (`#6B7280`) | Surface | Low visual weight for non-selected sections; no decorative colors |
| **Sidebar Nav Active** | `bg-primary-100` + `text-primary` | Primary | Active sidebar navigation focus |
| **Primary Buttons** (*Guardar*, *Exportar*, *Probar*, *Send*) | `primary` (`#007AFF`) fill | Primary | Standard primary call-to-action; `primary-600` on hover |
| **Destructive/Rare Actions** (*Vaciar*, *Restablecer*) | `danger` (`#C4453A`) outline/ghost | Semantic | Ghost style so they read as available-but-cautious; never filled to avoid prominent noise |
| **Unread Dot & Active Thread** | `primary` (`#007AFF`) | Primary | Single-purpose focus callout for active inbox navigation |
| **KPI Stat Card (Total Leads)** | `primary-100` bg, `primary` icon | Primary | Primary focal card on the metric dashboard |
| **SLA/Response KPI Cards** | Semantic by health state | Semantic | Dynamic cards (e.g. green/yellow/red by SLA compliance) |
| **Radial Gauges (SLA, Conversión)** | `success` / `warning` / `danger` by threshold | Semantic | Status-driven metrics (>=95% success, 80-94% warning, <80% danger) |
| **Channel Split Chart** | `cat-1` through `cat-4` in fixed order | Categorical | Channel identities have no inherent status meaning |
| **Lead Trend Volume Chart Line** | `primary` (`#007AFF`) | Primary | The single primary metric line on the analytics screen |
| **Lead Temperature Badges** | `danger` (Hot) / `warning` (Warm) / `info` (Cold) | Semantic | Direct representation of commercial lead temperature status |
| **Message Bubbles (Bot / Human / Note)** | `info` (Bot) / `primary-100` (Human) / `warning` (Note) | Semantic / Primary | Clear identification of message context |
| **Scenario Badges in Diagnostic** | `info` (`#4A8FA8`) | Semantic | Neutral operational test scenario classification |
| **Handoff Expected Indicators** | `success` (Met) / `warning` (Unmet) | Semantic | Outcome status of test execution |
| **Audit Event Type Icons** | `info` (Standard) / `danger` (Error) / `warning` (Review) | Semantic | Every audit event carries real operational status meaning |
