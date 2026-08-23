# WolfPack

A shelter management and foster coordination platform, built for the **San Francisco SPCA** as the first tenant.

WolfPack replaces PetPoint as the shelter's system of record, then adds the layers no existing system provides: a searchable volunteer and foster database, AI-powered dog↔foster and dog↔volunteer matching, and a behavioral journal that builds a dog's history as a byproduct of daily care.

> **Status:** Design complete, pre-implementation. Several stack decisions are still open — see [Blocking decisions](#blocking-decisions).

---

## The problem, in one paragraph

Shelters run foster programs on spreadsheets, group texts, and staff memory. There is no queryable roster of who's available and qualified, so every placement is brokered by a human. Meanwhile the detail that actually predicts a successful adoption — *she panics at skateboards, he settles instantly in a crate* — is observed by the foster and then lost, because the records system has nowhere to put it. WolfPack fixes both by owning the record and making capture effortless.

---

## Documentation

| Document | What it covers |
|---|---|
| **[Pitch deck](docs/The-Foster-Pack-Pitch-Deck.pdf)** | 24 slides — the problem, the product, and the ask. Opens in the browser; original as [`.pptx`](docs/The-Foster-Pack-Pitch-Deck.pptx) |
| **[Product Requirements](docs/WolfPack-PRD.md)** | Problem, personas, domain model, 12 feature areas, NFRs, synthetic data spec, risks, sequencing, open questions |
| **[Solution & Feature Breakdown](docs/WolfPack-Solution-Breakdown.md)** | Architecture, tech stack, repo layout, **18 workstreams** by technical module, shared contracts, merge strategy, testing |
| **[Development Split by Persona](docs/WolfPack-Team-Split-By-Persona.md)** | The same work organized into **6 teams by user persona** — foster, volunteer, admin, community, plus platform and matching. Ownership seams, journeys, and how to run it with fewer people. |

**Which to read first:**
- Deciding *what* to build → **PRD**
- Staffing teams or asking *"what do I own?"* → **Persona split**
- Picking up a module or asking *"can I import this?"* → **Solution breakdown**

---

## Key decisions

| # | Decision |
|---|---|
| D1 | Native mobile (iOS + Android) for fosters and volunteers; web dashboard for admins |
| D2 | **WolfPack replaces PetPoint** and becomes the shelter system of record. One-time historical migration at cutover |
| D3 | Full described scope is v1 |
| D4 | **AI matchmaking, human-decided** — deterministic hard constraints → compatibility scoring → LLM reasoning. Dog↔foster *and* dog↔volunteer |
| D5 | Community forum is publicly readable and cross-tenant; any foster, volunteer, or admin can post |
| D6 | Multi-tenant from day 1 |
| D7 | **In-app notifications primary, quiet by default.** Rare allow-listed push, no SMS notifications, opt-in email digest |
| D8 | Dogs only in v1; species-agnostic data model |
| D9 | Primary value is the volunteer/foster database and AI matching |
| D10 | **AI drafts, humans decide.** Every AI output is an evidence-linked suggestion with a non-AI fallback and a kill switch |
| D11 | EasyVet stays external; future read integration |

---

## How parallel development works

The architecture is a **modular monolith with lint-enforced boundaries**. Teams get isolation without distributed-systems overhead, and merging stays a code-review problem rather than an integration-environment problem.

Five mechanisms make this work — all five are required:

1. **Contract-first** — land your types in `packages/contracts` before writing implementation. Consumers code against mocks immediately and never wait on you.
2. **Exclusive ownership** — every table, module, and mobile feature directory has exactly one owning workstream.
3. **CI boundary enforcement** — cross-module imports outside `contracts` fail the build.
4. **Feature flags by default** — everything merges to `main` dark. No long-lived branches.
5. **Domain events** — cross-module effects go through events, never direct imports.

Full detail in [§2 of the breakdown](docs/WolfPack-Solution-Breakdown.md#2-how-parallel-development-works-here).

---

## Team board

Six teams, four of them persona-aligned. Full specs in the [persona split](docs/WolfPack-Team-Split-By-Persona.md).

| Team | User | Surface | Devs | Owns | Lead | Status |
|---|---|---|---|---|---|---|
| **T1 · Platform & Foundations** | *(serves all)* | Shared infra | 3–4 | WS-0, 7, 12, 13, 14, 17 | _unclaimed_ | Not started |
| **T2 · Foster Experience** | Foster | Mobile | 3 | WS-5, 6, foster roster | _unclaimed_ | Not started |
| **T3 · Volunteer Experience** | Volunteer | Mobile | 2 | WS-2, volunteer roster | _unclaimed_ | Not started |
| **T4 · Shelter Operations** | Admin, coordinator, vet | Admin web | 4 | WS-4, 11, 15, 16 | _unclaimed_ | Not started |
| **T5 · Matching & Intelligence** | Admin decides | Both | 2 | WS-3 | _unclaimed_ | Not started |
| **T6 · Community** | Everyone + public | Mobile + public web | 3 | WS-8, 9, 10 | _unclaimed_ | Not started |

**Don't have 18 developers?** The persona doc has concrete plans for [1, 3, 6, and 12-person teams](docs/WolfPack-Team-Split-By-Persona.md#10-running-this-with-fewer-people). Two rules hold at every size: **never under-staff T1 or T4**, and **T6's legal/policy track starts day 1** regardless of when its engineering does.

---

## Workstream board

The module-level view. Claim by putting your name in the Owner column; full specs in [§4 of the breakdown](docs/WolfPack-Solution-Breakdown.md).

| ID | Workstream | Team | Wave | Depends on | Owner | Status |
|---|---|---|---|---|---|---|
| WS-0 | Platform Foundation | T1 | 0 | — | _unclaimed_ | Not started |
| WS-1 | Volunteer & Foster Database ⭐ | T1/T2/T3 | 1 | WS-0 | _unclaimed_ | Not started |
| WS-4 | Animal Profile & Timeline | T4 | 1 | WS-0 | _unclaimed_ | Not started |
| WS-7 | Inbox & Notifications | T1 | 1 | WS-0 | _unclaimed_ | Not started |
| WS-8 | Community Forum | T6 | 1 | WS-0 | _unclaimed_ | Not started |
| WS-12 | Mobile App Shell | T1 | 1 | WS-0 | _unclaimed_ | Not started |
| WS-13 | Synthetic Data & Environments | T1 | 1 | WS-0 | _unclaimed_ | Not started |
| WS-14 | Analytics & Instrumentation | T1 | 1 | WS-0 | _unclaimed_ | Not started |
| WS-17 | AI Platform ⭐ | T1 | 1 | WS-0 | _unclaimed_ | Not started |
| WS-2 | Task Marketplace | T3 | 2 | WS-1 | _unclaimed_ | Not started |
| WS-5 | Journaling & Media Pipeline ⭐ | T2 | 2 | WS-4 | _unclaimed_ | Not started |
| WS-9 | Moderation & Safety ⚠️ | T6 | 2 | WS-8 | _unclaimed_ | Not started |
| WS-11 | Admin Web Dashboard | T4 + all | 2→3 | WS-1, 2, 3, 6, 15 | _unclaimed_ | Not started |
| WS-15 | Shelter Operations ⭐ | T4 | 2 | WS-4, WS-17 | _unclaimed_ | Not started |
| WS-16 | Medical Records & Health Intelligence | T4 | 2 | WS-4, 15, 17 | _unclaimed_ | Not started |
| WS-3 | AI Matching Engine ⭐ | T5 | 3 | WS-1, 4, 16, 17 | _unclaimed_ | Not started |
| WS-6 | Care Programs & Check-ins | T2 | 3 | WS-5, 7, 16 | _unclaimed_ | Not started |
| WS-10 | Social Sharing | T6 | 3 | WS-5, WS-8 | _unclaimed_ | Not started |

⭐ core bet · ⚠️ highest liability

**Staff these first:** WS-0 blocks everything; WS-17 blocks six streams. Under-resourcing either one stalls the project regardless of headcount elsewhere.

---

## Milestones

| | Milestone | Focus |
|---|---|---|
| M1 | Foundation | Tenancy, identity, mobile shell, seed data, AI platform |
| M2 | Shelter core | Intake → location → medical → outcomes → reporting |
| M3 | Core bet | Volunteer/foster database, task marketplace, inbox |
| M4 | Journaling | Capture, media pipeline, dynamic dog profile |
| M5 | Intelligence & ops | AI matching, care programs, admin dashboard |
| M6 | Community | Forum, moderation, Instagram sharing |
| M7 | Migration & pilot | PetPoint import, parallel run, SFSPCA cohort |
| M8 | GA | Localization, accessibility audit, moderation staffed |

---

## Blocking decisions

Implementation shouldn't start until these are settled:

| # | Decision | Blocks |
|---|---|---|
| D-1 | Confirm the stack — React Native vs. native, NestJS vs. alternatives | WS-0 |
| D-2 | Confirm modular monolith over microservices | WS-0 |
| D-3 | Team size and how many parallel streams we can actually staff | Wave planning |
| D-4 | Hosting/cloud provider | WS-0, WS-5 |
| D-8 | Model provider, and whether SFSPCA requires self-hosting | WS-17 |
| D-11 | Jurisdictions whose stray-hold rules and reporting we must support | WS-15 |
| D-12 | PetPoint cutover sign-off and parallel-run exit criteria | WS-15, M7 |

Plus **15 open product questions** for SFSPCA in [§16 of the PRD](docs/WolfPack-PRD.md#16-open-questions) — baselines, moderation staffing, legal review of forum disclaimers, and the existing behavioral taxonomy are the ones on the critical path.

---

## Things that will bite us if ignored

- **We are a system of record now.** Data loss is catastrophic, not inconvenient. Soft-delete only, point-in-time reconstruction, and *rehearsed* restore drills are engineering work that needs budgeting.
- **The public forum is the biggest liability surface.** Medical-advice exposure, foster-address leakage, and moderation cost all need legal review and staffing decisions starting at M1 — not at M6 when the code is ready.
- **Journaling adoption is make-or-break.** If fosters don't journal, the dynamic profile never materializes and the AI has nothing to reason over. Capture friction is the whole game.
- **PetPoint migration is not a cutover-week task.** Build the importer at M2 against real export samples and reconcile continuously.

---

## Naming

The product is referred to as **WolfPack** throughout; this folder is named *The Foster Pack*. Final name is unresolved (PRD Q10).
