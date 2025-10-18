# plan.md — MVP

## Goal

A minimal, mobile‑friendly site to:

1. capture ideas quickly,
2. refine them with LLM suggestions,
3. send the finalized prompt to Gemini with one click.

## Scope (MVP)

* Single‑user.
* Public GitHub Pages frontend.
* One serverless function as a secure API proxy.
* Persistence via **GitHub Issues** in a private repo (no database to manage).
* Simple **kanban board** UI: Columns = Draft → Refining → Ready → Sent.

## Architecture

* **Frontend:** Vite + React + TypeScript + Tailwind. Deployed to GitHub Pages.
* **Backend:** Cloudflare Worker (or Netlify/Pages Functions) to:

  * create/read/update ideas using the GitHub REST API (Issues),
  * call Gemini API for suggestions and runs,
  * keep secrets off the client.
* **Storage:** GitHub Issues in a private repo (labels carry status; issue body stores content as markdown with optional YAML front‑matter).
* **LLM:** Gemini 1.5 Pro (Google AI Studio API) called only from the Worker.

## Data Model (GitHub Issues)

* **Issue title:** idea title
* **Issue body:** markdown text for the idea/prompt (optional front‑matter: `model`, `version`)
* **Labels:** `status/draft`, `status/refining`, `status/ready`, `status/sent`
* **Comments:** store LLM suggestions or revision snapshots as needed

## API (Worker)

```
POST   /api/ideas                {title, body} → create issue with label status/draft
GET    /api/ideas?query=&status= → list issues (filter by label)
GET    /api/ideas/:number        → get one (issue number)
PATCH  /api/ideas/:number        {title?, body?, status?}
POST   /api/ideas/:number/suggest {text?} → Gemini suggestions (returns JSON)
POST   /api/ideas/:number/run     {prompt?, model?} → Gemini run (returns response JSON)
```

Auth to the Worker via a single bearer token; Worker holds **GITHUB_APP_TOKEN** and **GEMINI_API_KEY**.

## UI (Kanban + Editor)

* **Kanban board** (mobile‑first): 4 columns; draggable cards on desktop, buttons for “Move to …” on mobile.
* **Card:** title + 1–2 lines of body; tap to open editor.
* **Editor:** large textarea + “Suggest” and “Run” buttons; right panel lists suggestions (accept/apply button appends to editor).
* **Search:** simple client‑side filter by title text.

## Mobile & Accessibility

* Responsive stack (columns collapse to a single column list on small screens with a tab bar to switch columns).
* 44–48px touch targets; sticky bottom action bar for Save/Suggest/Run.
* Semantic HTML (`main`, `nav`, `button`), visible focus, ARIA labels, high contrast.

## Gemini Integration (Worker)

* `suggest`: send current text; return structured JSON `{questions[], fixes[], variants[]}`.
* `run`: send final prompt; return model response; optionally post a comment on the issue with the response summary.

## Deployment

1. Create private GitHub repo for storage (issues enabled).
2. Create GitHub App or PAT with `repo` scope; store token as Worker secret.
3. `wrangler secret put GEMINI_API_KEY` and `GITHUB_APP_TOKEN`.
4. Deploy Worker; set CORS to your Pages domain.
5. GitHub Pages workflow for the Vite build.

## Milestones

* **M0:** Scaffold Vite app; kanban board UI; read/list issues.
* **M1:** Create/update idea; move between columns (update labels).
* **M2:** Editor page; "Suggest" endpoint + UI to apply suggestions.
* **M3:** "Run" endpoint + response display.
* **M4:** Mobile polish, basic a11y pass, simple search.

## Files to Generate

* `/frontend/` Vite React TS app (Tailwind configured)

  * `App.tsx` (kanban board + routing)
  * `components/IdeaCard.tsx`, `components/Board.tsx`, `components/Editor.tsx`
  * `lib/api.ts` (fetch wrappers)
  * `index.html`, `main.tsx`, `tailwind.css`
* `/worker/` Cloudflare Worker

  * `src/index.ts` (routes above)
  * `wrangler.toml` (bindings for tokens, CORS)
* `.github/workflows/pages.yml` (build & deploy)
* `README.md` (setup instructions)

## Notes

* This MVP avoids external databases and PWA/offline features. Add PWA/IndexedDB later if needed.
* If multi‑provider support is desired, keep a simple provider interface in the Worker.
