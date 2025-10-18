# Usage guide

This project is a static site that helps you capture rough ideas, iterate on them with an LLM, and spin up a fresh conversation when you are ready. Everything runs client-side.

## 1. Run locally

1. Serve the files with any static server. For a quick preview:
   ```bash
   python -m http.server 4173
   ```
2. Open <http://localhost:4173> in your browser.

> Tip: you can also double-click `index.html` to open it directly, but some browsers block `fetch` calls from `file://` URLs. Using a local server avoids that.

## 2. Deploy to GitHub Pages

1. Push the repository to GitHub.
2. In **Settings → Pages**, choose the `main` branch with the `/` root as the source.
3. Save. GitHub will build and serve the static files automatically.

## 3. First-time setup in the app

1. Click **New ticket** and give it a title plus any messy thoughts.
2. Scroll to the **Conversation** panel.
3. Paste your OpenAI API key (starts with `sk-...`) and click **Save key**. The key stays in your browser’s `localStorage`; it is never sent anywhere else.
4. Type a question or instruction in the message box.
5. Choose **Add note** to keep it private, or **Send to LLM** to get an OpenAI reply. The full conversation (excluding notes) is sent every time so the model keeps context.

## 4. Refining a request

1. After a helpful assistant reply, click **Use last assistant reply** to drop it into **Refined request**.
2. Edit the text until it is the exact instruction you want to give an LLM.
3. Click **Copy & start clean chat**. The summary is copied to your clipboard and a new ChatGPT tab opens so you can paste it as the first message.

## 5. Managing tickets

- **Save**: Click **Save** in the idea panel to update the ticket metadata.
- **Delete**: Use the **Delete** button (confirmation required).
- **Clear conversation**: Resets the chat history for the ticket.
- **Search**: Filter tickets via the search box in the sidebar.

## 6. Backing up your data

1. Click **Export** in the header.
2. Copy the JSON or click **Download** to save a backup file.
3. Backups currently import manually: open `localStorage` in your browser dev tools and replace the `ideaTickets` entry with the JSON.

## 7. Mobile tips

- The layout collapses to a single column.
- Buttons remain large (44px+) for thumb-friendly tapping.
- Toasts confirm saves, errors, and LLM actions.

## 8. Troubleshooting

| Problem                            | Fix                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **OpenAI request fails**           | Double-check your API key, billing status, or model access. Errors surface in the toast.                 |
| **Clipboard copy blocked**         | Browsers require user interaction; click the button again or copy manually from the refined request box. |
| **Data lost after clearing cache** | Export regularly. Everything lives in your browser storage.                                              |

Enjoy exploring your ideas! If you need more power later, see future enhancements in `plan.md`.
