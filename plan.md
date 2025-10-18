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
* Simple database for persistence.
* Kanban board UI: Columns = Draft → Refining → Ready → Sent.

## Architecture

* **Frontend:** Vite + React + TypeScript + Tailwind. Deployed to GitHub Pages.
* **Backend:** Cloudflare Worker to:

  * CRUD ideas in a lightweight database,
  * call Gemini API for suggestions and runs,
  * keep secrets off the client.
* **Database:** **Cloudflare D1 (SQLite)** bound to the Worker. No external infrastructure.
* **LLM:** Gemini 1.5 Pro (Google AI Studio API), called only from the Worker.

## Data Model (D1 / SQLite)

```sql
-- ideas
CREATE TABLE IF NOT EXISTS ideas (
  id TEXT PRIMARY KEY,             -- uuid
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft|refining|ready|sent
  model TEXT DEFAULT 'gemini-1.5-pro',
  created_at TEXT NOT NULL,        -- ISO8601
  updated_at TEXT NOT NULL
);

-- revisions (optional for MVP; can be added later)
CREATE TABLE IF NOT EXISTS revisions (
  id TEXT PRIMARY KEY,
  idea_id TEXT NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  source TEXT NOT NULL,            -- user|llm
  snapshot TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- runs (log of prompt executions)
CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  idea_id TEXT REFERENCES ideas(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  response TEXT,                   -- JSON string
  model TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_revisions_idea ON revisions(idea_id);
CREATE INDEX IF NOT EXISTS idx_runs_idea ON runs(idea_id);
```

## API (Worker)

```
POST   /api/ideas                  {title, body} → create (status=draft)
GET    /api/ideas?query=&status=   → list (LIKE on title/body; optional status)
GET    /api/ideas/:id              → get one
PATCH  /api/ideas/:id              {title?, body?, status?}
POST   /api/ideas/:id/suggest      {text?} → Gemini suggestions (JSON)
POST   /api/ideas/:id/run          {prompt?, model?} → Gemini run (JSON)
GET    /api/ideas/:id/runs         → list runs
```

Auth to the Worker via a single bearer token. Secrets live in Worker env: `GEMINI_API_KEY`, `API_TOKEN`.

## UI (Kanban + Editor)

* **Kanban board:** 4 columns; desktop drag‑and‑drop; on mobile use explicit “Move to …” actions.
* **Card:** title + first line of body; tap to open editor.
* **Editor:** textarea + buttons for Suggest / Run; simple side panel lists suggestions with Apply.
* **Search:** client‑side filter (title/body) with a debounced query to `/api/ideas?query=`.

## Mobile & Accessibility

* Columns collapse to a single list with tabs for Draft/Refining/Ready/Sent.
* Sticky bottom action bar on small screens for Save/Suggest/Run.
* 44–48px touch targets; semantic elements; visible focus; ARIA labels; high contrast.

## Gemini Integration (Worker)

* `suggest`: send current text; return `{questions[], fixes[], variants[]}`.
* `run`: send final prompt; return model response; store in `runs`.

## Deployment

1. **Database**: `wrangler d1 create ideas_db`; apply schema via `wrangler d1 execute ideas_db --file=./schema.sql`.
2. **Worker**: bind D1 in `wrangler.toml`:

   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "ideas_db"
   database_id = "<id from create>"
   ```

   Add secrets: `wrangler secret put GEMINI_API_KEY`, `wrangler secret put API_TOKEN`.
3. **Frontend**: build with Vite and deploy to GitHub Pages via Actions.
4. **CORS**: Restrict Worker responses to your Pages domain.

## Milestones

* **M0:** Vite app; kanban board UI; list ideas from D1.
* **M1:** Create/update ideas; move status between columns.
* **M2:** Editor page; Suggest endpoint + apply suggestions.
* **M3:** Run endpoint + display streamed response.
* **M4:** Mobile polish, basic a11y, simple search.

## Files to Generate

* `/frontend/` Vite React TS app (Tailwind)

  * `App.tsx` (kanban + routes)
  * `components/Board.tsx`, `IdeaCard.tsx`, `Editor.tsx`
  * `lib/api.ts`
* `/worker/`

  * `src/index.ts` (routes)
  * `schema.sql` (SQL above)
  * `wrangler.toml`
* `.github/workflows/pages.yml`
* `README.md` (setup steps)

## Notes

* This keeps the stack minimal and self‑contained on Cloudflare (Worker + D1).
* If you prefer a hosted Postgres later, swap D1 for Supabase/Neon without changing the API contract.
