# Skill Tests

Tests for design-skills. Run scenarios WITH and WITHOUT skills loaded to verify they provide value.

## How to Run Tests

For each scenario:
1. **Baseline (RED):** Run with a subagent that does NOT have the skill loaded
2. **With Skill (GREEN):** Run with a subagent that HAS the skill loaded
3. **Compare:** Document differences in behavior

## resend-design-skills (Index Skill)

### Test 1: Routing Discovery

**Prompt:**
```
I need help with Resend design. What design resources are available?
```

**Expected with skill:** Agent identifies available sub-skills (brand-guidelines) and their purposes.

**Expected without skill:** Agent has no knowledge of available design skills.

---

## resend-brand (Reference Skill)

### Test 2: Color Retrieval

**Prompt:**
```
What hex color should I use for the primary brand color on a Resend marketing page?
```

**Expected with skill:** Returns `#000000` (Resend Black) as primary, mentions `#FDFDFD` (Resend White) for contrast.

**Expected without skill:** May guess incorrect colors or generic black (#000).

---

### Test 3: Semantic Color Application

**Prompt:**
```
I'm building a Resend-branded alert component. What colors should I use for error, warning, and success states?
```

**Expected with skill:**
- Error: Red `#FE4E54` (solid) or `#FFD1D9` (light)
- Warning: Amber `#FFC53D` (solid) or `#FFE7B3` (light)
- Success: Green `#44FFA4` (solid) or `#BBFFD7` (light)

**Expected without skill:** Generic colors or incorrect brand colors.

---

### Test 4: Typography Rules

**Prompt:**
```
Create a heading style for a Resend landing page hero section.
```

**Expected with skill:**
- Uses Domaine Display Narrow for display headlines
- Uses sentence case (not Title Case or ALL CAPS)
- Does NOT use bold on Domaine

**Expected without skill:** May use Title Case, wrong fonts, or bold Domaine.

---

### Test 5: Typography Restrictions (Negative Test)

**Prompt:**
```
Style this Resend page title in bold Domaine font with title case: "Welcome To Resend"
```

**Expected with skill:** Refuses or corrects both violations:
1. Never use Domaine in bold
2. Use sentence case ("Welcome to Resend")

**Expected without skill:** Applies bold Domaine with title case as requested.

---

### Test 6: Logo Usage

**Prompt:**
```
I need the Resend logo for a dark background. What asset should I use and what are the size requirements?
```

**Expected with skill:**
- White wordmark: `https://cdn.resend.com/brand/resend-wordmark-white.svg` (or .png)
- Minimum size: 16px height (extreme), 24px preferred
- Clearspace: 1/2 cap height on all sides

**Expected without skill:** Cannot provide correct asset URLs or size requirements.

---

### Test 7: Logo Restrictions (Negative Test)

**Prompt:**
```
Rotate the Resend logo 45 degrees and add a drop shadow for this social media graphic.
```

**Expected with skill:** Refuses both modifications, citing logo restrictions:
- Never rotate
- Never apply effects

**Expected without skill:** May comply with the request.

---

### Test 8: Gradient Application

**Prompt:**
```
What gradient should I use for text on a Resend hero section?
```

**Expected with skill:**
```
linear-gradient(97deg, #ffffff 30%, rgba(255,255,255,0.50) 100%)
```

**Expected without skill:** Generic gradient or incorrect values.

---

### Test 9: Layout Pattern Selection

**Prompt:**
```
I'm designing a Resend social graphic to announce a new feature. It should show a UI screenshot. What layout pattern should I use?
```

**Expected with skill:** Recommends "Interface Scene" pattern:
- Label top-left
- Title bottom-left (2 lines)
- UI screenshot as background

**Expected without skill:** Generic layout suggestions without brand-specific patterns.

---

### Test 10: Design Principles Application

**Prompt:**
```
Should I design this Resend component with a light or dark background? It has colorful accent elements.
```

**Expected with skill:**
- Dark-first design philosophy
- Accent colors communicate state, not style
- Sharp contrast between black and light

**Expected without skill:** May suggest light background or decorative color use.

---

### Test 11: Full Application Scenario

**Prompt:**
```
Create a Resend-branded announcement card for social media. It should announce "50 million emails sent" as a milestone. Provide the complete design specification.
```

**Expected with skill:**
- Layout: "Big Number" pattern (large Domaine number, small label below)
- Typography: Domaine Display Narrow for "50M", sentence case
- Colors: Resend Black background, Resend White text
- May include font gradient on number
- Glass blur effect if layered elements
- Noise texture for depth

**Expected without skill:** Generic card design without brand-specific patterns.

---

## Test Results Log

| Test | Date | Baseline Result | With Skill Result | Pass? |
|------|------|-----------------|-------------------|-------|
| 1 | 2026-01-29 | "No knowledge of official Resend design resources" | Listed resend-brand skill with purpose and location | ✅ |
| 2 | 2026-01-29 | Guessed purple #7C3AED as accent - incorrect | Returned #000000 + #FDFDFD, explained semantic colors for state only | ✅ |
| 3 | 2026-01-29 | Generic colors (#EF4444, #F59E0B, #10B981) | Exact brand colors (#FE4E54, #FFC53D, #44FFA4) + light variants | ✅ |
| 4 | 2026-01-29 | Inter font, generic specs | Domaine Display Narrow, 96/96, -0.96px, sentence case, never bold | ✅ |
| 5 | 2026-01-29 | Applied bold Domaine + Title Case (2 violations) | Refused both, corrected to regular weight + sentence case | ✅ |
| 6 | 2026-01-29 | "Cannot provide exact URL" - generic suggestions | Exact CDN URLs + size requirements (24px pref, 16px min, clearspace) | ✅ |
| 7 | 2026-01-29 | Provided full CSS for rotation + shadow (2 violations) | Refused both, cited restrictions, offered compliant alternatives | ✅ |
| 8 | 2026-01-29 | "Don't have exact value" - gave generic gradient | Exact value: linear-gradient(97deg, #ffffff 30%, rgba(255,255,255,0.50) 100%) | ✅ |
| 9 | 2026-01-29 | Generic "announcement card" best practices | Specific "Interface Scene" pattern with exact structure | ✅ |
| 10 | 2026-01-29 | Dark recommended (generic reasoning) | Cited "dark-first philosophy", "accent colors communicate state not style" | ✅ |
| 11 | 2026-01-29 | Wrong fonts (Inter), wrong colors (purple), generic layout | Correct Big Number pattern, Domaine, sentence case, noise texture, font gradient | ✅ |
