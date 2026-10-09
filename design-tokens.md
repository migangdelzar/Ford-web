# Design System Specification — Soft Neumorphic KPI Theme

This design system establishes a soft, neumorphic, light, and airy aesthetic for the CRM platform built with **React + TypeScript + Tailwind CSS v4 + shadcn/ui**. Depth and visual hierarchy are created using soft diffused shadows rather than harsh border outlines.

---

## 1. Base Design Tokens & CSS Variables

Centralized in `src/index.css` (and re-exported via `src/globals.css` and `tailwind.config.ts`):

```css
:root {
  /* Canvas & Containers */
  --background: #F5F6FA;         /* Light neutral canvas background */
  --foreground: #1E293B;         /* Dark navy body text */
  --card: #FFFFFF;               /* Pure white elevated cards */
  --card-foreground: #1E293B;    /* Dark slate card typography */
  --muted-foreground: #94A3B8;   /* Soft gray secondary labels */
  --radius: 1.25rem;             /* Global 20px border radius */

  /* 5-Color Accent Palette */
  --accent-pink: #F4638C;
  --accent-pink-soft: rgba(244, 99, 140, 0.12);

  --accent-orange: #F5A623;
  --accent-orange-soft: rgba(245, 166, 35, 0.12);

  --accent-teal: #2DD4BF;
  --accent-teal-soft: rgba(45, 212, 191, 0.12);

  --accent-blue: #4A90D9;
  --accent-blue-soft: rgba(74, 144, 217, 0.12);

  --accent-purple: #9B6EF3;
  --accent-purple-soft: rgba(155, 110, 243, 0.12);
}
```

---

## 2. Accent Color Guidelines — When to Use Which Accent

| Accent | Hex Code | Soft Tint | Intended Usage |
| :--- | :--- | :--- | :--- |
| **Pink / Rose** | `#F4638C` | `rgba(244,99,140,0.12)` | Hot leads, urgent alerts, commercial action triggers, SLAs |
| **Amber / Orange** | `#F5A623` | `rgba(245,166,35,0.12)` | Medium intent / warm leads, warnings, pending statuses |
| **Teal / Emerald** | `#2DD4BF` | `rgba(45,212,191,0.12)` | Positive metrics, successful conversions, active Meta 24h windows |
| **Blue / Sky** | `#4A90D9` | `rgba(74,144,217,0.12)` | Neutral informational badges, channel volume, standard CTAs |
| **Purple / Indigo**| `#9B6EF3` | `rgba(155,110,243,0.12)` | AI automation features, Gemini Concierge, premium rules |

---

## 3. Depth & Shadow System

Borders are omitted (`border-0`) in favor of soft diffused ambient shadows:

- `shadow-soft`: `0 8px 30px rgba(0, 0, 0, 0.04)` — resting elevated state for cards & panels.
- `shadow-soft-hover`: `0 12px 36px rgba(0, 0, 0, 0.07)` — interactive hover states.
- `shadow-soft-inset`: `inset 0 2px 4px rgba(0, 0, 0, 0.04)` — active press states and input tracks.
- Colored soft glows (`shadow-soft-pink`, `shadow-soft-teal`, `shadow-soft-blue`) for primary CTA buttons.

---

## 4. Component Implementation Rules

### 🃏 Card (`src/shared/ui/Card.tsx`)
- `bg-card rounded-[1.25rem] shadow-soft border-0 p-6`
- Zero borders; depth provided by `shadow-soft`.

### 🔘 Button (`src/shared/ui/Button.tsx`)
- Fully rounded pills (`rounded-full`).
- Primary variant uses vibrant linear gradient sweeps (`from-[#F4638C] to-[#F5A623]` or `from-[#2DD4BF] to-[#4A90D9]`).
- Soft matching shadow (`shadow-soft-pink` or `shadow-soft-teal`).

### 🏷️ Badge (`src/shared/ui/Badge.tsx`)
- Pill-shaped (`rounded-full`).
- Built with soft background tints (`bg-accent-pink-soft`, `bg-accent-teal-soft`, etc.) and solid text.

### 📊 Progress Bar (`src/shared/ui/Progress.tsx`)
- Track: light neutral gray (`bg-slate-100`).
- Indicator: accent gradient or solid fill, fully rounded ends (`rounded-full`).

### 🔘 Icon Chips (`src/shared/ui/IconChip.tsx`)
- Circular containers (`w-10 h-10 rounded-full`).
- Soft-tint background (`--accent-X-soft`) with solid accent icon inside.

### 🗂️ Animated Pill Tabs (`src/shared/ui/AnimatedPillTabs.tsx`)
- Active pill: Pure white soft-shadow card sliding over a light gray background track with spring motion physics.
