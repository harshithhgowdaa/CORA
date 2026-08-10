# CORA CRM — Design Guidelines
### Visual system adapted from the reference HR dashboard, mapped to CORA's corporate relationship data model

---

## 1. Color System

### Base / Neutral
| Token | Hex | Usage |
|---|---|---|
| `bg-app` | `#B8BCC4` | Outer canvas behind the app frame |
| `bg-shell` | `#FFFFFF` | Main app container background |
| `bg-surface` | `#F7F8FA` | Card backgrounds, sidebar |
| `bg-subtle` | `#F0F1F3` | Empty grid cells, input fields |
| `border-hairline` | `#E7E8EC` | Card borders, dividers |
| `text-primary` | `#1A1D24` | Headings, primary text |
| `text-secondary` | `#6B7280` | Subtitles, labels, meta text |
| `text-muted` | `#9CA3AF` | Disabled/placeholder text |

### Accent — Brand Blue
| Token | Hex | Usage |
|---|---|---|
| `blue-500` | `#3B82F6` | Active nav pill, selected date, links, primary buttons |
| `blue-100` | `#DBEAFE` | Info/neutral pill backgrounds |
| `blue-dashed` | `#60A5FA` | "Today" indicator line in timeline/pipeline views |

### Semantic — Relationship Status
CORA's `Relationship Status` field replaces the reference app's leave types. Same rule applies: **color always carries meaning, never decoration.**

| Status | Color | Hex |
|---|---|---|
| Prospect | Grey | `#9CA3AF` |
| Contacted | Blue | `#3B82F6` |
| Meeting Scheduled | Cyan | `#06B6D4` |
| Discussion | Indigo | `#6366F1` |
| Proposal | Purple | `#8B5CF6` |
| Negotiation | Amber | `#F59E0B` |
| Partnership Signed | Green | `#22C55E` |
| Active Partner | Green (dark) | `#16A34A` |
| Dormant | Grey (muted) | `#D1D5DB` |
| Closed | Slate | `#64748B` |

### Semantic — Follow-up Priority
| Priority | Color | Hex |
|---|---|---|
| Low | Grey | `#9CA3AF` |
| Medium | Blue | `#3B82F6` |
| High | Amber | `#F59E0B` |
| Critical | Red | `#EF4444` |

### Semantic — Follow-up Status
| Status | Color | Hex |
|---|---|---|
| Pending | Blue (translucent) | `#93C5FD` |
| In Progress | Purple gradient | `#8B5CF6` → `#7C3AED` |
| Completed | Green gradient | `#22C55E` → `#16A34A` |
| Overdue | Red gradient | `#EF4444` → `#DC2626` |
| Cancelled | Grey | `#D1D5DB` |

### Accent — Featured / Attention
- `#F5C542` → `#F0B429` warm gold gradient, reserved for **one** highlighted item per view — e.g. the most urgent overdue follow-up, or the next scheduled meeting — mirroring how the reference app reserves gold for its single featured event.

### AI Assistant Orb (if CORA includes an assistant panel)
- Radial gradient sphere: `#DCEBFF` center → `#7FB3F5` edge, glossy highlight.

---

## 2. Typography

| Role | Weight | Size | Usage |
|---|---|---|---|
| Page title | Semibold/Bold | 28–32px | "Companies", "Pipeline" |
| Section title | Semibold | 20–22px | "Upcoming Follow-ups", "Team Workload" |
| Card title | Medium/Semibold | 15–16px | Company name, officer name |
| Body / meta | Regular | 13–14px | Industry, title/designation, timestamps |
| Micro label | Medium | 11–12px | Column headers, status chips |
| Greeting | Semibold | 24px | Dashboard welcome header |

- Sentence case everywhere. Tabular digits for counts (e.g. "18 / 34 active").
- Geometric sans throughout (Inter / Plus Jakarta Sans / General Sans).

---

## 3. Layout & Grid

- **Shell**: Rounded outer container (~24px radius) on neutral grey canvas.
- **Sidebar**: Fixed icon rail (~70px) — Dashboard, Companies, Pipeline, Follow-ups, Reports icons stacked vertically, settings pinned to bottom.
- **Top bar**: Nav pills (active = light blue capsule) + global search + avatar stack of collaborating officers with "+N" overflow + primary CTA ("+ Add Company") + notifications.
- **Main grid**: Full-width primary module on top (Company table / Pipeline board), three-column footer grid below for supporting widgets.
- **Cards**: White/light-grey, ~16–20px radius, hairline border, no heavy shadows, 20–24px padding.
- **Spacing scale**: 8px base unit (8/12/16/20/24/32).

---

## 4. Components — Mapped to CORA Modules

### 4.1 Company Table (replaces "Planned Absences" grid)
The reference app's employee-by-date absence grid maps directly to a **Company-by-Officer ownership grid** or a straightforward company list — pick based on which primary view CORA needs first.

- Left frozen column: company logo/initials avatar + company name + industry (two-line stack, same pattern as employee name + role).
- Row content: relationship status pill (color-coded per §1), primary owner avatar, last interaction date.
- If keeping a timeline-style view (e.g. interaction density per company per week): reuse the hatched weekend-cell pattern for non-business days, dashed "today" line, and full-width pills for scheduled interactions/follow-ups spanning date ranges.
- Status pills: leading icon + label + trailing status sub-badge (dot + word — "Approved"-style badge becomes "Confirmed" / "Pending" / "Overdue").

### 4.2 Officer Avatar Stack
- Overlapping circular avatars with white ring, "+N" overflow circle — used in top bar (all active officers) and on company rows (supporting officers).

### 4.3 Officer Workload Cards (replaces "Onboarding" 2×2 grid)
- 2×2 (or N-up) grid of officer cards: avatar top, name + role centered, rounded progress chip at bottom showing workload — e.g. **"9/18 initiatives active"** instead of "5/10 tasks done."

### 4.4 Follow-up / Interaction Feed (replaces "Future Events")
- Featured card: the most urgent item (next meeting, overdue critical follow-up) gets the gold gradient treatment + live status chip ("Overdue by 2 days" / "In 15 min").
- List items below: plain white cards — title (task/interaction name), description/notes preview, due-date chip, company chip, and an avatar stack of participants.
- Chips: pill-shaped, icon + text, neutral grey background (clock icon for time/due date, building icon for company, calendar icon for date).

### 4.5 Pipeline / Opportunity Board
Not present in the reference screenshot but follows the same token system:
- Kanban columns per stage (Prospect → Contacted → ... → Active Partner), each opportunity a card using the same white-card + hairline-border + status-pill language.
- Officer avatar + expected close date + probability chip on each card.

### 4.6 Executive Dashboard Panel (replaces AI Assistant panel)
Reuse the same panel shape (centered icon, greeting, suggested-action pills, input/search bar) if CORA has a query/report-builder assistant. Otherwise substitute with a KPI summary panel using the same card chrome: greeting → key metric callouts → quick-action pills ("Export report", "View overdue", "Team workload").

### 4.7 Buttons
- Primary CTA ("+ Add Company", "+ New Follow-up"): dark filled rounded-lg button, icon + label.
- Secondary ("Filter", "View all", "Export"): white/outline rounded-full pill, hairline border.

---

## 5. Iconography & Imagery
- Line icons, 1.5–2px stroke, rounded caps.
- Company avatars: logo if available, else colored initials circle (consistent palette derived from company name hash).
- Officer avatars: real photo, consistent circular crop.
- Status pills always pair an icon with color + text (e.g. building icon = Contacted, handshake icon = Partnership Signed, moon icon = Dormant) — never rely on color alone, consistent with the reference app's accessibility pattern.

---

## 6. Interaction & Motion Cues
- Hover/active elevation (soft shadow + slight lift) on interactive pills — same as the reference app's Sick-Leave popover treatment — useful for previewing a follow-up or interaction on hover before opening the full record.
- Dashed "today" indicator for any timeline/calendar-based view (interaction timeline, follow-up due dates).
- Redundant status signaling: color + icon + text label together at all times.

---

## 7. Design Tokens (CSS custom properties)

```css
:root {
  /* Neutrals */
  --bg-app: #B8BCC4;
  --bg-shell: #FFFFFF;
  --bg-surface: #F7F8FA;
  --bg-subtle: #F0F1F3;
  --border-hairline: #E7E8EC;
  --text-primary: #1A1D24;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;

  /* Brand blue */
  --blue-500: #3B82F6;
  --blue-100: #DBEAFE;
  --blue-dashed: #60A5FA;

  /* Relationship status */
  --status-prospect: #9CA3AF;
  --status-contacted: #3B82F6;
  --status-meeting-scheduled: #06B6D4;
  --status-discussion: #6366F1;
  --status-proposal: #8B5CF6;
  --status-negotiation: #F59E0B;
  --status-partnership-signed: #22C55E;
  --status-active-partner: #16A34A;
  --status-dormant: #D1D5DB;
  --status-closed: #64748B;

  /* Follow-up priority */
  --priority-low: #9CA3AF;
  --priority-medium: #3B82F6;
  --priority-high: #F59E0B;
  --priority-critical: #EF4444;

  /* Follow-up status */
  --followup-pending: #93C5FD;
  --followup-inprogress: #8B5CF6;
  --followup-inprogress-dark: #7C3AED;
  --followup-completed: #22C55E;
  --followup-completed-dark: #16A34A;
  --followup-overdue: #EF4444;
  --followup-overdue-dark: #DC2626;
  --followup-cancelled: #D1D5DB;

  /* Featured accent */
  --accent-gold: #F5C542;
  --accent-gold-dark: #F0B429;

  /* Radius */
  --radius-shell: 24px;
  --radius-card: 18px;
  --radius-pill: 999px;
  --radius-cell: 12px;

  /* Spacing base */
  --space-unit: 8px;
}
```

---

## 8. Screen-to-Reference Mapping

| Reference app element | CORA equivalent |
|---|---|
| Planned Absences grid | Company list / ownership grid |
| Employee row (avatar, name, role) | Company row (logo, name, industry) |
| Vacation/Paid Leave/Sick Leave pills | Relationship status pills |
| Approved / Pending badge | Confirmed / Pending / Overdue badge |
| Future Events (gold featured card) | Most urgent follow-up or upcoming meeting |
| Onboarding 2×2 cards | Officer workload cards |
| "5/10 tasks done" chip | "9/18 initiatives active" chip |
| AI Assistant panel | Report/query assistant or KPI summary panel |
| Add Employee button | Add Company / New Follow-up button |
| Avatar stack (top bar) | Active officers avatar stack |

---

## 9. Core Principles to Preserve
1. **Cool neutral base** — color is reserved for relationship status, priority, and urgency, never decoration.
2. **Redundant status signaling** — icon + color + text together on every pill/badge.
3. **One featured item per view** — gold accent used sparingly (single most urgent follow-up/meeting), not spread across multiple cards.
4. **Consistent pill vocabulary** — nav states, status badges, and chips all share the same rounded-pill shape.
5. **Generous whitespace, soft radii** — calm, approachable feel appropriate for a relationship-management tool used daily by officers and leadership.
