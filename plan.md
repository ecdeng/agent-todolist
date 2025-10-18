# MVP plan & architecture

## Product vision

Build a lightweight personal scratchpad for capturing messy ideas, iterating on them with an LLM, and launching a clean follow-up conversation once the request is polished.

## Final architecture

- **Hosting:** Static site — ideal for GitHub Pages or any static host. No backend required.
- **Tech stack:** Vanilla HTML, CSS, and JavaScript. Zero build tooling.
- **Persistence:** Browser `localStorage` with JSON export for manual backups.
- **LLM integration:** Direct calls to the OpenAI Chat Completions API from the client. The user provides their API key, which is stored only in localStorage.
- **Data model:**
  ```ts
  interface Ticket {
    id: string;
    title: string;
    idea: string;
    summary: string;
    createdAt: string; // ISO timestamp
    updatedAt: string;
    messages: Array<{
      id: string;
      role: "user" | "assistant" | "note";
      content: string;
      createdAt: string;
    }>;
  }
  ```
- **Interaction flow:**
  1. Capture a raw idea in a ticket.
  2. Add free-form notes or send prompts to OpenAI (full conversation history is sent, excluding personal notes).
  3. Populate and refine a “Refined request” field (auto-filled from the latest assistant reply if desired).
  4. Copy the refined request to start a fresh LLM chat in a new tab.

## Key screens

1. **Tickets list (sidebar):** searchable, shows last-updated date and message count.
2. **Workspace:** editable title + idea, conversation thread, refined request tools.
3. **Dialogs:** confirmation (delete/clear) and export (JSON download).

## MVP feature checklist

- [x] Create, save, and delete tickets.
- [x] Store ticket content locally and keep it synced with `localStorage`.
- [x] Maintain a structured conversation with user messages, assistant replies, and human-only notes.
- [x] Call OpenAI’s API with conversation history; surface responses inline.
- [x] Copy refined request and open a new LLM chat tab.
- [x] Export all data as JSON for backups.
- [x] Responsive layout that works well on phones and desktops.

## Post-MVP ideas

1. **Import backups:** allow loading a previously exported JSON file.
2. **Tagging & filters:** organize tickets by theme or priority.
3. **Prompt templates:** quick actions to generate research questions or outline next steps.
4. **Alternative LLM providers:** add model selector and support for custom endpoints.
5. **Multi-device sync:** optional backend (Supabase / Firebase) for authenticated users.
6. **Shareable tickets:** readonly publish link.
7. **Command palette:** keyboard shortcuts for power users.
8. **Attachment support:** link reference docs or images stored elsewhere.
