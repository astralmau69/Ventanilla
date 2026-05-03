# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server at http://localhost:3217
npm run build      # Production build
npm start          # Production server
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit (0 errors is the bar)
```

## Architecture

**Touchpad Kiosko** is an elderly-friendly hospital kiosk for requesting medical appointment tickets ("fichas"). Built with Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, and GSAP.

### Key Architectural Decision

All three screens (`WelcomeScreen`, `CarnetScreen`, `MenuScreen`) are **mounted simultaneously** inside `KioskApp.tsx`—not routed via Next.js pages. This is intentional: GSAP needs both screens in the DOM to animate between them. `flushSync()` is used to force synchronous React state updates before GSAP timelines start, preventing race conditions.

### Screen Flow

```
P0 WelcomeScreen → P1 CarnetScreen → P2 MenuScreen
   (greeting)        (ID input)        (action menu)
```

State lives entirely in `KioskApp.tsx`: `step`, `carnet`, `patient`, `hour`, `dark`.

### Animations

- **`useScreenTransition.ts`** — Curtain reveal between screens (800ms total: outgoing screen slides -8% X + fades, incoming slides in from +8% X, child elements stagger 80ms)
- **`useEchoTouch.ts`** — Touch feedback: button scales to 0.97 then elastic rebound, `.echo-ring` span animates scale + opacity simultaneously (700ms)

### Design System

Tokens are CSS variables in `src/app/globals.css` (`:root` / `.dark` class). Extended in `tailwind.config.ts` with:
- **Typography:** Body 2rem, H1 4.5rem, Display 7.5rem — oversized for elderly readability
- **Touch targets:** Minimum 88×88px (ideal 120×120px), separated by 16–24px
- **Neo-brutalist style:** 4px solid borders + 6px offset shadow (`shadow-surface`, `shadow-accent`), shadow collapses on `:active`
- **Fonts:** Plus Jakarta Sans (headings) + Atkinson Hyperlegible (body — designed for low vision)
- **Accent color:** `#0055FF`

### Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

## Project Context

- **Target users:** Elderly hospital patients — every interaction must be obvious and forgiving
- **UX constraint:** Full ticket flow in ≤60 seconds, ≤4 touches
- **Status:** Sprint 1 complete (3 screens + 2 animations). Sprint 2 adds specialty selection (P3), error states, inactivity timeout, and Playwright E2E tests
- **Planned backend (Sprints 4–7):** NestJS microservices (ms-turnos, ms-pacientes, ms-impresion), PostgreSQL, Redis, NATS
- **Deployment target:** Chromium kiosk mode on Ubuntu 22.04 LTS with Epson TM-T20 thermal printer

## Detailed plan

See `PLAN_KIOSCO_HOSPITALARIO.md` for the full 8-sprint roadmap, microservice architecture diagram, UX principles, and hardware specs.
See `ESTADO_ACTUAL.md` for current build metrics and what remains per sprint.
