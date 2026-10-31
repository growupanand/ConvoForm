---
name: ConvoForm
description: Forms that talk back. Marketing site design system (landing + public pages).
colors:
  paper: "#fafbfc"
  surface: "#ffffff"
  ink: "#0f172a"
  muted: "#475569"
  text: "#64748b"
  slate: "#94a3b8"
  hair: "#cbd5e1"
  hair-soft: "#e2e8f0"
  blue-50: "#eff6ff"
  blue-100: "#dbeafe"
  blue-200: "#bfdbfe"
  blue-300: "#93c5fd"
  blue-400: "#60a5fa"
  blue-500: "#3b82f6"
  blue-600: "#2563eb"
  blue-700: "#1d4ed8"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Inter, sans-serif"
    fontSize: "clamp(40px, 6.4vw, 76px)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, Inter, sans-serif"
    fontSize: "clamp(32px, 4.2vw, 50px)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.03em"
  title-lg:
    fontFamily: "Bricolage Grotesque, Inter, sans-serif"
    fontSize: "clamp(24px, 2.6vw, 32px)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bricolage Grotesque, Inter, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title-sm:
    fontFamily: "Bricolage Grotesque, Inter, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.2
  quote:
    fontFamily: "Bricolage Grotesque, Inter, sans-serif"
    fontSize: "clamp(20px, 2.2vw, 26px)"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  button:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.08em"
  label-text:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  xs: "4px"
  sm: "14px"
  md: "20px"
  lg: "26px"
  xl: "32px"
  pill: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  6: "24px"
  8: "32px"
  11: "44px"
  14: "56px"
  16: "64px"
  section-mobile: "76px"
  section: "112px"
  gutter-mobile: "16px"
  gutter: "24px"
  container: "1160px"
components:
  button-primary:
    backgroundColor: "{colors.blue-600}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "15px 24px"
  button-primary-hover:
    backgroundColor: "{colors.blue-700}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "15px 24px"
  button-small:
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  eyebrow:
    textColor: "{colors.blue-600}"
    typography: "{typography.label}"
  tab:
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "9px 16px"
  tab-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.blue-600}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "20px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "6px 9px"
  chat-bubble-ai:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "9px 13px"
  chat-bubble-user:
    backgroundColor: "{colors.blue-600}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "9px 13px"
  chat-bubble-follow-up:
    backgroundColor: "{colors.blue-50}"
    textColor: "{colors.blue-700}"
    rounded: "{rounded.sm}"
    padding: "9px 13px"
---

# Design System: ConvoForm

Scope: the public marketing site, `apps/web/src/app/(public)/**` and `apps/web/src/components/common/publicLayout/**`. The signed-in dashboard is not covered here. Product context lives in `PRODUCT.md`; the approved mockups (source of every token below) are in `docs/design/marketing/`, with `convoform-landing-v2.html` as the reference.

## Overview

**Creative North Star: "The Drafting Table"**

A clean sheet of off-white paper, ruled with fine hairlines, where a form is drawn in pencil and then comes alive as a conversation. Everything structural is line work: 1.25px strokes, dotted grids, dashed dividers for "before" states. The single blue ink marks only what matters: the action, the follow-up question, the answer that got fixed. Display type is confident and slightly characterful (Bricolage Grotesque), reading text is quiet (Inter), and anything that names a thing (labels, steps, field keys) is set in small uppercase mono like an annotation on a drawing.

The page should feel calm, honest and precise, closer to a well-made tool than to an agency showcase. Motion exists to explain (a form breaking into a conversation, a line flowing from a form into a spreadsheet), never to decorate, and it always settles into a readable final state.

**Key Characteristics:**

- Off-white paper (`paper`) with white `surface` panels; flat, defined by hairlines rather than shadows.
- One accent: `blue-600`. The rest of the blue scale only tints, glows and states.
- Three type voices: Bricolage Grotesque for headings, Inter for body, JetBrains Mono for labels.
- 1.25px hairline borders everywhere; dashed hairlines mean "static / before / placeholder".
- Line-art (hairline SVG) illustrations and viewport-triggered motion with a static final frame.
- Mobile first: the typical visitor is on a phone, coming from Instagram.

### Motion

Motion tokens (machine-readable copies live in `.impeccable/design.json`):

| Token | Value | Use |
|---|---|---|
| `ease-out` | `cubic-bezier(0.33, 1, 0.68, 1)` (cubic out) | Elements arriving: fades, slides, chips, cells |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` (cubic in-out) | Line draws, things moving from A to B, stroke-dashoffset |
| `ease-pop` | `cubic-bezier(0.34, 1.56, 0.64, 1)` (back out) | Chat bubbles and chips popping in only; never for layout |
| `duration-micro` | `150ms` | Button hover (background, lift) |
| `duration-fast` | `200ms` | Border colour changes on hover |
| `duration-toggle` | `250ms` | FAQ plus-to-cross rotation, small state toggles |
| `duration-pop` | `280ms` | Bubble/chip pop-in |
| `duration-draw` | `500ms` | One-shot hairline stroke draws |
| `stagger` | `120ms` | Delay between sibling items in a reveal |
| `loop-hero` | `8s` | Hero "form shatters into conversation" loop |
| `loop-scene` | `6s` to `10.8s` | Section loops (before/after, trust icons, how it works) |
| `ambient` | `9s` to `11s`, `ease-in-out` | Background orb drift, the only infinite CSS animation |
| `hover-lift` | `translateY(-1px)` | Buttons on hover |

**The In-View Rule.** Animations start only when their element is on screen: an IntersectionObserver at `threshold: 0.2` for looping scenes, `0.3` for one-shot reveals (which disconnect after firing). Wait for `document.fonts.ready` before measuring or starting.

**The Pause-Offscreen Rule.** Each animation keeps its own clock and advances it only while visible. Scrolling away freezes it; scrolling back resumes where it stopped. Clamp the per-frame delta (max 0.1s) so a backgrounded tab never jumps.

**The Static-Final-State Rule.** Under `prefers-reduced-motion: reduce` (and `?static=1` for review), render every animation at its final, fully informative frame, drop transitions, and use `scroll-behavior: auto`. The static frame must tell the whole story on its own.

## Colors

Cool, near-white paper and slate inks, with a single confident blue.

### Primary

- **Signal Blue** (`blue-600`): the one accent. Primary buttons, eyebrows, active tabs, links, emphasised words in headings, the "fixed" answer, step numbers. Hover deepens to **Deep Signal Blue** (`blue-700`), which is also the text colour on follow-up bubbles.
- **Blue tints** (`blue-50` to `blue-500`): never used as a second accent. `blue-50` fills follow-up bubbles; `blue-200`/`blue-300` are the hairline colour of featured panels and active borders; `blue-300`/`blue-400` and `blue-200` feed soft background glows.

### Neutral

- **Paper** (`paper`): page background on every public page, and the header backdrop at 86% opacity.
- **Surface** (`surface`): cards, panels, chat windows, inputs.
- **Ink** (`ink`): headings and primary text.
- **Muted** (`muted`): body copy, leads, nav links.
- **Text** (`text`): secondary copy, captions, small labels that must be read.
- **Slate** (`slate`): decorative only: FAQ numbers, dividers' glyphs, illustration strokes, disabled states.
- **Hair** (`hair`): the 1.25px hairline on cards, buttons, tabs, FAQ rules.
- **Hair Soft** (`hair-soft`): 1px inner dividers, header bottom border, table cell rules.

### Named Rules

**The One Accent Rule.** `blue-600` is the only accent and covers well under 10% of any screen. No second hue, no purple, no amber outside mockup-only badges.

**The Solid Emphasis Rule.** Emphasised words in `h1`/`h2` are solid `blue-600`. No gradient text, anywhere (owner decision on #513; the mockups' gradient `em` is superseded).

**The Readable Ink Rule.** Text someone needs to read uses `ink`, `muted` or `text` (4.5:1 or better on `paper`). `slate` fails contrast for small text and is for decoration only.

## Typography

**Display Font:** Bricolage Grotesque (optical size 12 to 96, weights 600 and 700), falling back to Inter.
**Body Font:** Inter (400, 500, 600, 700), falling back to system-ui.
**Label/Mono Font:** JetBrains Mono (400, 500), falling back to ui-monospace.

Load all three from Google Fonts through `next/font/google` (`Bricolage_Grotesque`, `Inter`, `JetBrains_Mono`) with `display: "swap"`, exposed as CSS variables. **Nohemi is removed** (decided on #512) and is not used on public pages; nor are Montserrat or Geist.

**Character:** a grotesque with a bit of warmth and quirk at display sizes, paired with a neutral workhorse body and a technical mono that annotates.

### Hierarchy

- **Display** (`display`): the hero `h1` only.
- **Headline** (`headline`): section `h2`s, max width about 760px. The final CTA's `h2` goes up to `clamp(34px, 4.6vw, 56px)` with line-height 1.04.
- **Title Large** (`title-lg`): featured card titles (use-case card).
- **Title** (`title`): step titles, panel titles. FAQ questions use the same face at 18px/1.3 (16.5px on mobile).
- **Title Small** (`title-sm`): trust card titles.
- **Quote** (`quote`): the founder note.
- **Lead** (`lead`): section intros, colour `muted`, max width 620px. The hero subline is `clamp(15.5px, 1.5vw, 18px)` / 1.55.
- **Body** (`body`) and **Body Small** (`body-sm`): card copy, answers, footer links. Keep lines to about 65ch.
- **Label** (`label`): eyebrows, step numbers, tabs and field keys; uppercase, colour `blue-600` for eyebrows, `text` otherwise. Field keys in tables may drop to 10px.
- **Label Text** (`label-text`): mono running text like the proof strip and footer credit.

### Named Rules

**The Annotation Rule.** Mono is for naming things (labels, keys, steps, captions), never for sentences longer than one line.

**The Tight Display Rule.** Display and headline sizes always carry negative tracking (`-0.035em` / `-0.03em`); body text never does.

## Layout

- **Container:** `container` max width, centred, with `gutter` side padding (`gutter-mobile` at 900px and below).
- **Sections:** `section` vertical padding (`section-mobile` at 900px and below). Section intros are an eyebrow, an `h2`, then a lead; centred only for the hero, FAQ and similar single-column moments.
- **Header:** sticky, 64px tall (58px on mobile).
- **Grids:** three columns for steps, four for trust cards (two at 1100px and below, one at 900px and below), two-column split panels that stack on mobile.
- **Breakpoints:** `900px` is the main mobile switch; `1100px` drops dense grids to two columns. The existing live demo has its own `1024px` desktop check and is left alone.
- **Rhythm:** spacing comes from the `spacing` scale (4, 8, 12, 16, 24, 32, 44, 56, 64). Card padding is 20 to 40px; section blocks sit 28 to 48px below their intro.
- **Mobile:** CTAs stack full width (max 340px); tabs stretch to fill the row; tables reflow to two columns. Nothing may scroll horizontally at 360px (`overflow-x: clip` on `html, body`).

**The Demo Slot Rule.** The live demo sits directly under the hero. Its component tree (`demoSection/`) is never restyled or rewritten; only the wrapper around it may change.

## Elevation & Depth

Flat by default. Depth comes from hairlines, white panels on paper, a faint dotted grid and soft, blurred blue glows behind the one featured element in a section. Shadows are rare and always blue-tinted.

### Shadow Vocabulary

- **Primary button glow** (`box-shadow: 0 10px 26px -14px rgba(37,99,235,.7)`): primary buttons only.
- **Floating chat** (`box-shadow: 0 22px 50px -30px rgba(37,99,235,.4)`): the hero chat window.
- **Focus halo** (`box-shadow: 0 0 0 2px #bfdbfe`): a highlighted overlay card.
- **Background glow:** a radial gradient of `blue-300` at about 32 to 42% alpha, blurred 30 to 60px, placed behind a featured panel. Never more than one per section.
- **Dot grid:** `radial-gradient(circle at 1px 1px, rgba(15,23,42,.07) 1px, transparent 0)` at `22px 22px`, usually masked to fade at the edges.

**The Hairline-Not-Shadow Rule.** A card is separated from the page by a 1.25px `hair` border, not by a drop shadow.

## Shapes

- **Hairline:** `1.25px solid hair` is the default border (`--hw` in the mockup). Inner dividers are `1px solid hair-soft`. Dashed hairlines mark a "before", static or placeholder state.
- **Radius:** `xs` for drawings of old-style form inputs; `sm` for chat bubbles, field chips and small tiles; `md` for cards and trust tiles (18 to 22px panels round to this family); `lg` for large feature cards and the founder card; `xl` for the final CTA panel and hero stage (28px); `pill` for buttons, tabs, chips and badges. Large panels step down one radius size on mobile.
- **Chat bubbles:** `sm` radius with the corner nearest the speaker cut to 4 to 5px.
- **Line art:** SVG strokes use `vector-effect: non-scaling-stroke`, round caps and joins, `hair`/`slate` for structure and `blue-600` for the moving or "fixed" part.

## Components

### Buttons

- **Shape:** fully rounded pill (`pill`).
- **Primary:** `blue-600` fill, white text, 600 weight, 15px, padding 15px 24px, primary button glow.
- **Hover / Focus:** background to `blue-700` and a 1px lift over `duration-micro`. Focus shows a visible 2px `blue-600` outline with offset.
- **Secondary:** translucent white fill, `ink` text, 1.25px `hair` border; hover darkens the border to `slate` and lifts 1px.
- **Small:** padding 10px 16px, 14px text, used in the header.

### Chips

- **Style:** white fill, 1px `hair-soft` border, `pill` radius, 11.5px Inter 500 in `muted` with the value in 600 `ink`.
- **Feature tag:** mono label in `blue-600` with a 1.25px `blue-200` border and a small leading icon.

### Cards / Containers

- **Corner Style:** `md` (20px) default, `lg` (26px) for feature cards.
- **Background:** white at 60 to 70% over the paper, or solid `surface` for the featured panel.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1.25px `hair`; featured panel uses 1.25px `blue-200`; "before" panels use a dashed `hair` border.
- **Internal Padding:** 20px (tiles) to 40px (feature cards); 26px on split panes.

### Tabs

A pill track (1.25px `hair` border, 4px padding) holding mono uppercase tab labels. The active tab gets a white fill, a `blue-300` hairline and `blue-600` text. Tabs fill the row on mobile.

### Navigation

Sticky header on 86% `paper` with a 14px backdrop blur and a 1px `hair-soft` bottom border. Logo in Bricolage Grotesque 600 22px with the accent on part of the word mark. Links are 14px Inter 500 in `muted`, `ink` on hover, pill hit areas. A GitHub pill in mono shows the real star count. **Sign in** stays visible on every viewport and must link to `/auth/sign-in`.

### FAQ

Native `<details>`/`<summary>` rows divided by 1.25px `hair` rules. A mono index number in `slate`, the question in the display face, and a 28px circular plus that rotates 45° to a cross over `duration-toggle`; the open question turns `blue-700`.

### Conversation (signature)

The product's core image: a short chat with an assistant bubble, a user bubble, and a **follow-up** bubble (`blue-50` fill, `blue-700` text, `blue-300`/`blue-400` hairline, tagged with a mono "FOLLOW-UP" label) that asks the question a human would. Captured answers appear as chips or table cells, with the fixed value in `blue-600`. Example data is realistic, Indian and in INR (for example "₹20 lakh / year"), and labelled "Illustrative".

### Hairline Illustration (signature)

Explanatory line drawings (how it works, trust icons, export to CSV / Sheets) drawn with 1.25px non-scaling strokes on the paper, animated with `ease-in-out` and following the three motion rules above.

## Do's and Don'ts

### Do:

- **Do** keep `paper` as the page background and use `blue-600` as the single accent.
- **Do** use 1.25px hairlines for every card, button outline, tab track and divider rule.
- **Do** set headings in Bricolage Grotesque, body in Inter and labels in JetBrains Mono, all via `next/font`.
- **Do** start animations in view, pause them off-screen and give them a complete static final frame for reduced motion.
- **Do** design at 360px first and check there is no horizontal scroll.
- **Do** write prices and example values in INR and label sample data "Illustrative".
- **Do** follow the mockups in `docs/design/marketing/` for layout and motion intent.

### Don't:

- **Don't** use gradient text; emphasis is solid `blue-600`.
- **Don't** add a second accent colour or reuse the mockups' amber "MOCKUP" badges on the real site.
- **Don't** use Nohemi, Montserrat or Geist on public pages.
- **Don't** use drop shadows to separate cards; only the documented blue-tinted shadows exist.
- **Don't** use `slate` for text people need to read.
- **Don't** invent stats, testimonials, logos, user counts or prices.
- **Don't** modify `demoSection/` or anything inside it.
- **Don't** ship an animation that loops while off-screen or ignores `prefers-reduced-motion`.
