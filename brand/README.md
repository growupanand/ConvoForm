# ConvoForm brand kit

This folder is the single home for the ConvoForm mark. The SVGs here are the
source of truth; every PNG and ICO, plus the Next.js asset files that wrap them,
are generated copies. `apps/web/src/app/manifest.ts` is hand-maintained but only
points at the generated icons.

**Before changing the logo, favicon, app icons, OG mark or social avatar, read
this file.** Edit the SVG masters, then run `pnpm brand:export`. Do not hand-edit
anything under `apps/web/src/app/` or `apps/web/public/` that this kit generates.

## The mark

A question, then an answer: a slate ask bar followed by a blue answer bar. It is
a conversation, not a letter or a chat bubble. The offset between the bars is
intentional and locked. V5 is the current mark.

## Folder layout

```
brand/
  README.md                       ← you are here
  icon/                           ← SVG sources (source of truth)
    master.svg                    ← paper tile master, 512 viewBox
    favicon.svg                   ← dark-aware 32 viewBox (browser favicon)
    favicon-16.svg                ← 16px optical cut
    favicon-32.svg                ← 32px optical cut
    filled-sibling.svg            ← blue tile for iOS / PWA home screens
    maskable-512.svg              ← safe-zone version for Android / maskable
    mono-black.svg                ← one-colour mark for light backgrounds
    mono-white.svg                ← one-colour mark for dark backgrounds
    app-icon.svg                  ← same geometry as master (paper)
  social/
    avatar-400.svg                ← circle-safe avatar for X / LinkedIn / GitHub
    avatar-400.png                ← generated export for upload
    og-1200x630.svg               ← social share artwork with mark + wordmark
    og-1200x630.png               ← generated export for upload
  export/
    export.mjs                    ← regenerates every PNG / ICO
    *.png, favicon.ico            ← generated only, never edit
```

## Locked geometry and colours

### Master (512 × 512) — `icon/master.svg`

- Tile: paper `#fafbfc`, full bleed, **no border**
- Ask bar: `x=80 y=144 w=272 h=88 rx=44`, slate `#94a3b8`
- Answer bar: `x=160 y=280 w=272 h=88 rx=44`, blue-600 `#2563eb`

### Favicon (16 / 32, dark-aware) — `icon/favicon.svg`

Light tile slate-100 `#f1f5f9`; ask `#94a3b8`; answer `#2563eb`.

| Size | Ask bar | Answer bar |
| --- | --- | --- |
| 16 | `x=2 y=3 w=9 h=4 rx=2` | `x=5 y=9 w=9 h=4 rx=2` |
| 32 | `x=4 y=7 w=18 h=7 rx=3.5` | `x=10 y=18 w=18 h=7 rx=3.5` |

Dark mode (`prefers-color-scheme: dark` in `favicon.svg`): tile ink `#0f172a`,
ask `#cbd5e1`, answer blue-400 `#60a5fa`.

### Filled sibling — `icon/filled-sibling.svg`

Used for `apple-icon.png` (iOS home screen) and as the preferred tile where a
single home-screen icon is chosen.

- Tile: blue-600 `#2563eb`
- Ask bar: blue-200 `#bfdbfe`
- Answer bar: white `#ffffff`

### Maskable 512 — `icon/maskable-512.svg`

Same as the master, with the bars scaled `0.90` about the centre so they stay
inside the Android safe zone.

### One-colour siblings

- `mono-black.svg`: paper `#fafbfc` tile, both bars ink `#0f172a`
- `mono-white.svg`: ink `#0f172a` tile, both bars white `#ffffff`

### Social

- `avatar-400.svg`: 512 viewBox, circle-safe, bars scaled `0.90`
- `og-1200x630.svg`: paper `#fafbfc`, mark, `Convo` blue-600 / `Form` ink
  wordmark, hairline, tagline `Forms that talk back.`

## Clear space

Keep empty margin around the tile equal to about **⅛ of the tile edge** before
any other UI, text or image. On a 32px icon that is 4px; on a 512px tile it is
64px. The maskable and avatar files already bake in the safe-zone scale.

## Minimum size

Do not use the mark below **16px**. Prefer **32px or larger** in UI. At 16px use
`favicon-16.svg`; at 32px use `favicon-32.svg`; above that use `master.svg`.

## Which file for which use

| Use | File |
| --- | --- |
| Browser favicon | `icon/favicon.svg` and the generated `favicon.ico` |
| iOS home screen | `icon/filled-sibling.svg` (`apple-icon.png` @ 180) |
| PWA manifest 192 / 512 | `icon/app-icon.svg` (paper) |
| Android / maskable home screen | `icon/maskable-512.svg` |
| X / LinkedIn / GitHub avatar | `social/avatar-400.png` (or the SVG) |
| OG / WhatsApp / X / LinkedIn link preview | `social/og-1200x630.png`; the live `/api/og` route draws the same mark |
| Light background | `icon/master.svg`, `icon/app-icon.svg` or `icon/mono-black.svg` |
| Dark background | dark favicon colours or `icon/mono-white.svg` |
| Clerk / generic `/logo.png` consumer | generated `apps/web/public/logo.png` (master @ 512) |

## Regenerating assets

From the repo root:

```bash
pnpm brand:export
```

This uses `sharp` (a root dev dependency) to render every raster file from the
SVGs, builds a 16+32 PNG-in-ICO favicon, and copies the generated files into the
Next.js locations below. Re-running it with the same `sharp` version produces
review-stable output; there is no other post-processing step.

Never edit the generated copies by hand — change the SVG master and re-run the
script.

## Next.js files and generated copies

These files exist because Next.js requires them at fixed paths. The image and
ICO files are generated from `brand/`; `manifest.ts` is hand-maintained wiring
that points at the generated icons.

| Next.js file | Source |
| --- | --- |
| `apps/web/src/app/icon.svg` | `brand/icon/favicon.svg` (dark-aware) |
| `apps/web/src/app/favicon.ico` | `brand/export/favicon.ico` (16 + 32) |
| `apps/web/src/app/apple-icon.png` | `brand/export/apple-icon-180.png` (filled sibling @ 180) |
| `apps/web/public/apple-touch-icon.png` | same filled sibling, for legacy iOS requests |
| `apps/web/public/logo.png` | `brand/export/logo-512.png` (master @ 512) |
| `apps/web/public/icon-192.png` | `brand/export/app-icon-192.png` |
| `apps/web/public/icon-512.png` | `brand/export/app-icon-512.png` |
| `apps/web/public/maskable-512.png` | `brand/export/maskable-512.png` |
| `apps/web/src/app/manifest.ts` | serves the three icons above |

Favicons and app icons cache aggressively. Test in a private window or
hard-refresh after deploying.

## Don'ts

- No gradients.
- No border, outline or stroke on the tile.
- No stretching — keep the square aspect ratio.
- No recolouring the bars outside the locked palette above.
- Never swap the bar order or put the blue answer bar on top.
- No drop shadows.
- No rotating or tilting the mark.
- Do not invent a different mark, round the tile, or add a chat tail.
- Do not export PNGs by hand or edit generated `apps/web` copies; re-run
  `pnpm brand:export` instead.
