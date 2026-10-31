# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Small teams and agencies that collect enquiries, applications or feedback and then follow up with a person. The sharpest-fit audience is **Indian study-abroad consultancies**: founder-led, non-technical owners and counsellors who qualify student leads before the first call.

How they meet ConvoForm matters for every public page:

- They usually arrive **on a phone, from Instagram** (an ad, a reel or a bio link), not from a desktop search.
- They share their own forms on **WhatsApp**, in social bios and in enquiry replies.
- They care about getting usable answers fast, not about forms or AI as technology.

The form's respondents (students, applicants, customers) are a second audience. They only ever see the shared form, never the marketing site.

## Product Purpose

ConvoForm turns a static form into a short conversation. A creator describes the fields they need, AI drafts the form, they review and publish it, and share a link. Respondents answer in a chat; when an answer does not meet the field (for example a budget without a currency or scope), ConvoForm asks a follow-up before it saves the answer and moves on. The creator reviews structured answers alongside the full conversation.

Success for a creator: the answers are complete enough to act on without a second round of messages.

## Positioning

The form asks the follow-up question a counsellor would otherwise ask by hand ("₹20 lakh per year, or in total?"), so answers arrive structured and usable. Built and run by one named maker, open source under Apache 2.0, and self-hostable.

## Operating Context

- Creators build and review forms in the web dashboard. Respondents answer on the public form link, mostly on mobile.
- Forms are shared as links over WhatsApp, Instagram and websites. Telegram is also supported as a channel.
- Responses can be exported to CSV and synced to Google Sheets. Google Forms can be imported.
- Production runs on Vercel (`sin1`) with the database in Singapore.

## Capabilities and Constraints

- Free plan: 500 responses in total per organization, 10 forms, 100 MB of file storage, 5 AI form generations per month (8 fields each). Source: `packages/common/src/config/bmp/pricing.ts`.
- **Currency:** prices and examples on the marketing site are in **INR** (₹, with Indian units such as lakh). Paid-plan prices are not decided; do not show any.
- The landing page's live demo (`apps/web/src/app/(public)/(landingPage)/_components/demoSection/`, form id `demo`) is a real, working form. It stays exactly as it is.
- Auth is Clerk. Sign in lives at `/auth/sign-in`, sign up at `/auth/register`.
- Undecided: which AI provider production uses, and the promise "existing users will hear about it first" (both tracked in #516).

## Brand Commitments

- Name: **ConvoForm**.
- Maker: **Utkarsh Anand** ([@growupanand](https://github.com/growupanand)). Founder note signature: "Utkarsh Anand · Builder of ConvoForm". Footer: "Made by Utkarsh Anand".
- Voice: plain and honest. Short sentences, no jargon, no hype. Professional but approachable; a reliable business tool, not a consumer toy.
- Visual system: see `DESIGN.md`. Approved mockups: `docs/design/marketing/`.

## Evidence on Hand

- Real: the live demo form, the open-source repo and its GitHub stars, the changelog, and the study-abroad use-case copy (`apps/web/src/app/(public)/use-cases/study-abroad/`).
- Founder photo: `apps/web/public/images/founder/utkarsh-anand.jpg` once added, falling back to `https://github.com/growupanand.png`.
- **Absent, never fabricate:** customer logos, testimonials, user or response counts, ratings, benchmarks, press, and paid-plan prices. Example data in illustrations must be labelled "Illustrative".

## Product Principles

1. **No invented proof.** If a claim can't be pointed to in the repo or the product, it doesn't ship.
2. **Mobile first, because the audience is.** The first visit is a phone from Instagram; a share is a WhatsApp link.
3. **Usable answers over clever forms.** Every feature is judged by whether the creator can act on the answer without chasing it.
4. **Show, don't claim.** The working demo is the strongest argument; keep it close to the top and keep it real.
5. **Plain words.** Explain in the respondent's and the counsellor's language, not AI or form-builder terms.

## Accessibility & Inclusion

- Public pages must not scroll horizontally at 360px wide.
- Every animation is triggered in view, pauses off-screen and has a static final state under `prefers-reduced-motion: reduce`.
- Lighthouse mobile score of 90 or more on public pages.
