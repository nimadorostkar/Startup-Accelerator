# VC Summit — Project Docs

Start here before changing the app or building the backend.

| Doc | Read it when | What's in it |
| --- | --- | --- |
| [pages-and-features.md](pages-and-features.md) | Changing any page, form or rule | Every route, every field with its form name and validation, the application lifecycle, the admin panel, security rules and how they were verified |
| [backend-integration.md](backend-integration.md) | Building the real backend | The two swap-point contracts (`auth.ts`, `store.ts`), build order, PostgreSQL schema, rules the backend must enforce, notifications, optional REST API, tests to automate |

**Keep them current:** update the relevant doc in the same commit as the change it describes. The online copy of the pages reference ([claude.ai doc](https://claude.ai/code/artifact/2a03db74-a0d6-470e-8f68-c69424658a6b)) is for sharing and comments. It does not sync automatically; these files are the source of truth.

## Quick facts

- **Stack:** Next.js 16 (App Router, Server Actions), React 19, Tailwind CSS 4, TypeScript. No other dependencies.
- **Areas:** landing page `/` · sign-in `/login` `/register` `/forgot-password` · founder dashboard `/dashboard/*` · review panel `/admin/*`.
- **Stand-ins still in place:** sign-in (`src/lib/auth.ts`) and storage (`src/lib/application/store.ts`, a local JSON file in `.data/`).
- **Run it:** `npm run dev`, then open `/dashboard` or `/admin`. In development you're signed in automatically as a stand-in user who is both a founder and a reviewer.
- **Sample data:** `npm run seed:demo` (add) · `npm run seed:demo -- --reset` (remove).
