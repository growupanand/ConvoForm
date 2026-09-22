# ConvoForm Design Context

## Users
Founder-led study-abroad consultancies in India (B2B, non-technical). Owners and counsellors handling student inquiries over WhatsApp and walk-ins; they care about qualifying leads fast, not about forms or tech.

## Brand Personality
- **3-word personality**: Modern & minimal
- **Emotional goal**: Confidence & trust
- **Voice**: Professional but approachable. Clean, direct, no jargon. The interface should feel like a reliable business tool, not a consumer toy.

## Aesthetic Direction
- **Theme**: Light mode only
- **Visual tone**: Clean, professional, trustworthy. Think Stripe dashboard clarity meets Indian business pragmatism.
- **Anti-references**: 
  - Generic AI-generated SaaS template (centered titles, identical icon cards, same shadows/radius everywhere, placeholder metrics)
  - Over-designed agency sites (heavy animations, gradient soup, flashy effects)
  - No gradient text, no glassmorphism, no border-left accent stripes
- **References**: Stripe, Linear, Vercel dashboard — clean, functional, confidence-inspiring

## Design Principles
1. **Trust over delight**: Every element should reinforce reliability. Counsellors need to feel this is a serious business tool.
2. **Clarity over cleverness**: No confusing layouts or ambiguous interactions. Non-technical users need to accomplish tasks quickly.
3. **Restraint over decoration**: Every visual element must earn its place. White space is a feature, not empty space.
4. **Professional warmth**: Modern and minimal doesn't mean cold. Subtle warmth in typography and spacing creates approachability.
5. **Functional hierarchy**: Visual weight should guide the eye to what matters most — lead qualification, form responses, student data.

## Technical Context
- Next.js 15 monorepo with Turborepo
- Tailwind CSS with shadcn/ui components
- Current fonts: Geist Sans (body) + Montserrat (headings)
- Current theme: HSL-based CSS variables for light/dark
- Light mode: near-white background (#f4f4f4), dark navy primary
