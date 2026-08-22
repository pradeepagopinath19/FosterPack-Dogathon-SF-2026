# FosterPack-Dogathon-SF-2026
**Every foster has a pack.**

An AI-agent-powered incident-coordination portal for foster dog networks. One message from a foster caregiver becomes prioritized, assigned, trackable actions — walks, vet runs, medication, supplies, backup care — routed to volunteers, shelter staff, and vet teams automatically. Each dog carries a living profile — temperament, feeding, medical notes, quirks. AI coordinates; authorized humans decide.

## Getting started

The frontend lives in [`web/`](web) — Next.js (App Router) + TypeScript + Tailwind CSS.

Requires **Node 18.18+** (check [`web/.nvmrc`](web/.nvmrc); run `nvm use` inside `web/` if you use nvm).

```bash
cd web
npm install
npm run dev
```

Then open http://localhost:3000.

Currently scaffolded: volunteer and foster-parent profile pages (list + detail) with mock data. Dog profiles are modeled in [`web/src/types/index.ts`](web/src/types/index.ts) for future persistence but have no UI yet.
