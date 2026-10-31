# ConvoForm marketing redesign mockups (31 Oct 2026)

> **In this repo:** copied verbatim from the [mockup gist](https://gist.github.com/growupanand/214020603bdc0f85db548afc749a977f) for the marketing redesign epic ([#512](https://github.com/growupanand/ConvoForm/issues/512)). Open the files directly in a browser. Tokens and rules derived from them live in the root `DESIGN.md`, and decisions made after the mockups win over them:
> - Emphasised heading words use solid `#2563eb`, not the gradient shown here.
> - The founder is Utkarsh Anand (signature "Utkarsh Anand · Builder of ConvoForm"; footer "Made by Utkarsh Anand").

Static HTML mockups for the ConvoForm marketing site redesign (repo: growupanand/ConvoForm).
**Download each file and open it in a browser.** GitHub's gist view shows source only. Every file is self-contained; fonts load from Google Fonts.
Add `?static=1` to the URL (or turn on "reduce motion" in your OS) to see the static final state of every animation.

| File | What it is |
|---|---|
| `convoform-landing-v2.html` | **Approved full landing page (v2).** Hero "Forms that talk back." with form-shatters-into-conversation animation, demo slot, hairline "How it works", before/after (Study abroad + Job tabs), trust section, founder note, FAQ, final CTA. |
| `page-study-abroad.html` | `/use-cases/study-abroad` restyled in the v2 shell. Copy is the real page copy; the profile values are illustrative. |
| `page-changelog.html` | `/changelog` as a timeline: real latest 8 releases (0.19.0 → 0.12.0), per-release permalink anchors, Feature/Improvement/Fix tags, "Load older releases". |
| `page-privacy.html` | `/privacy` legal template: full real policy text, sticky TOC with scrollspy on desktop, collapsible "On this page" on mobile. Terms uses the same template. |
| `hero-option3b.html` | Hero exploration: floating chat bubbles merging into structured data (an earlier option, for reference). |
| `hero-option1-line.html` | Hero exploration: option 1 drawn as a hairline vector animation (reference for the line-art motion style). |
| `final-cta.html` | Standalone demo of the final CTA section ("Ready to let your form talk back?"). |

## Notes
- **The "Existing live demo" block in the landing mockup is a placeholder.** In the real site the existing demo section (`demoSection/`, `DEMO_FORM_ID="demo"`) stays exactly as it is, just positioned under the hero.
- The amber "MOCKUP" badge/strip is only for the mockups.
- Links between pages are relative and won't resolve inside a gist. Download all files into one folder to click through.
- No stats, testimonials or logos are invented. Example data is labelled "Illustrative".
- Header/footer are the proposed new versions, so they differ from the live site. "Made by [name]" is a placeholder (founder name is still an open decision).

