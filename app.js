const STORAGE_KEY = "ideaTickets";
const API_KEY_STORAGE = "ideaTickets.apiKey";
const MODEL = "gpt-4o-mini";

const ticketTemplate = document.getElementById("ticketTemplate");
const workspaceTemplate = document.getElementById("workspaceTemplate");
const messageTemplate = document.getElementById("messageTemplate");

const ticketListEl = document.getElementById("ticketList");
const workspaceEl = document.getElementById("workspace");

const createTicketBtn = document.getElementById("createTicketBtn");
const exportBtn = document.getElementById("exportBtn");
const searchInput = document.getElementById("searchInput");

const exportDialog = document.getElementById("exportDialog");
const confirmDialog = document.getElementById("confirmDialog");
const confirmMessage = document.getElementById("confirmMessage");
const downloadExportBtn = document.getElementById("downloadExportBtn");
const exportOutput = document.getElementById("exportOutput");

let state = loadState();
let selectedId = state.tickets[0]?.id ?? null;
let searchTerm = "";

renderTicketList();
renderWorkspace();

createTicketBtn.addEventListener("click", () => {
  const ticket = createTicket();
  state.tickets.unshift(ticket);
  selectedId = ticket.id;
  persistState();
  renderTicketList();
  renderWorkspace();
});

exportBtn.addEventListener("click", () => {
  exportOutput.value = JSON.stringify(state, null, 2);
  exportDialog.showModal();
});

downloadExportBtn.addEventListener("click", () => {
  const blob = new Blob([exportOutput.value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `idea-tickets-${new Date().toISOString()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value.toLowerCase();
  renderTicketList();
});

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { tickets: [] };
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.tickets)) {
      return { tickets: [] };
    }
    return parsed;
  } catch (error) {
    console.warn("Failed to load state", error);
    return { tickets: [] };
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createTicket() {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  return {
    id,
    title: "Untitled ticket",
    idea: "",
    summary: "",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

function formatDate(isoString) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

function renderTicketList() {
  ticketListEl.innerHTML = "";
  const filtered = state.tickets.filter((ticket) => {
    if (!searchTerm) return true;
    return (
      ticket.title.toLowerCase().includes(searchTerm) ||
      ticket.idea.toLowerCase().includes(searchTerm) ||
      ticket.summary.toLowerCase().includes(searchTerm)
    );
  });

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
      <div>
        <strong>No tickets yet</strong>
        Start by capturing a messy thought with “New ticket”.
      </div>
    `;
    ticketListEl.appendChild(empty);
    return;
  }

  for (const ticket of filtered) {
    const instance = ticketTemplate.content.firstElementChild.cloneNode(true);
    const titleEl = instance.querySelector(".ticket-title");
    const snippetEl = instance.querySelector(".ticket-snippet");
    const updatedEl = instance.querySelector(".ticket-updated");
    const messageEl = instance.querySelector(".ticket-messages");

    titleEl.textContent = ticket.title || "Untitled ticket";
    const snippet = ticket.idea || ticket.summary || "No details yet.";
    snippetEl.textContent =
      snippet.length > 140 ? `${snippet.slice(0, 137)}…` : snippet;
    updatedEl.textContent = formatDate(ticket.updatedAt);
    messageEl.textContent = `${ticket.messages.length}`;

    if (ticket.id === selectedId) {
      instance.dataset.active = "true";
    }

    instance.addEventListener("click", () => {
      selectedId = ticket.id;
      renderTicketList();
      renderWorkspace();
    });

    instance.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectedId = ticket.id;
        renderTicketList();
        renderWorkspace();
      }
    });

    ticketListEl.appendChild(instance);
  }
}

function renderWorkspace() {
  workspaceEl.innerHTML = "";
  const ticket = state.tickets.find((item) => item.id === selectedId);

  if (!ticket) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
      <div>
        <strong>Create a ticket to begin</strong>
        Your workspace will appear here once you select a ticket.
      </div>
    `;
    workspaceEl.appendChild(empty);
    return;
  }

  const instance = workspaceTemplate.content.firstElementChild.cloneNode(true);
  const titleInput = instance.querySelector("#ticketTitle");
  const ideaInput = instance.querySelector("#ticketIdea");
  const summaryInput = instance.querySelector("#summaryInput");
  const saveBtn = instance.querySelector("#saveTicketBtn");
  const deleteBtn = instance.querySelector("#deleteTicketBtn");
  const clearBtn = instance.querySelector("#clearConversationBtn");
  const conversationList = instance.querySelector("#conversation");
  const messageForm = instance.querySelector("#messageForm");
  const messageInput = instance.querySelector("#messageInput");
  const sendMessageBtn = instance.querySelector("#sendMessageBtn");
  const addNoteBtn = instance.querySelector("#addNoteBtn");
  const generateSummaryBtn = instance.querySelector("#generateSummaryBtn");
  const copySummaryBtn = instance.querySelector("#copySummaryBtn");
  const apiKeyInput = instance.querySelector("#apiKeyInput");
  const saveKeyBtn = instance.querySelector("#saveKeyBtn");

  titleInput.value = ticket.title;
  ideaInput.value = ticket.idea;
  summaryInput.value = ticket.summary;

  const savedKey = localStorage.getItem(API_KEY_STORAGE) ?? "";
  apiKeyInput.value = savedKey;

  renderMessages(ticket.messages, conversationList, ticket.id);

  titleInput.addEventListener("input", () => {
    ticket.title = titleInput.value;
  });

  ideaInput.addEventListener("input", () => {
    ticket.idea = ideaInput.value;
  });

  summaryInput.addEventListener("input", () => {
    ticket.summary = summaryInput.value;
    updateTicket(ticket.id, { summary: ticket.summary });
  });

  saveBtn.addEventListener("click", () => {
    updateTicket(ticket.id, {
      title: titleInput.value.trim() || "Untitled ticket",
      idea: ideaInput.value,
    });
    showToast("Ticket saved");
    renderTicketList();
  });

  deleteBtn.addEventListener("click", async () => {
    const confirmed = await confirmAction(
      "Delete this ticket? This action cannot be undone.",
    );
    if (!confirmed) return;
    state.tickets = state.tickets.filter((item) => item.id !== ticket.id);
    if (selectedId === ticket.id) {
      selectedId = state.tickets[0]?.id ?? null;
    }
    persistState();
    renderTicketList();
    renderWorkspace();
  });

  clearBtn.addEventListener("click", async () => {
    if (ticket.messages.length === 0) return;
    const confirmed = await confirmAction(
      "Clear all messages in this conversation?",
    );
    if (!confirmed) return;
    ticket.messages = [];
    updateTicket(ticket.id, { messages: [] });
    renderWorkspace();
  });

  saveKeyBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    if (!key.startsWith("sk-")) {
      showToast(
        "That key does not look right. Make sure it starts with sk-.",
        true,
      );
      return;
    }
    localStorage.setItem(API_KEY_STORAGE, key);
    showToast("API key saved locally");
  });

  messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;
    const apiKey =
      apiKeyInput.value.trim() || localStorage.getItem(API_KEY_STORAGE);
    if (!apiKey) {
      showToast("Add your OpenAI API key first.", true);
      return;
    }

    const userMessage = createMessage("user", text);
    ticket.messages.push(userMessage);
    updateTicket(ticket.id, { messages: ticket.messages });
    renderMessages(ticket.messages, conversationList, ticket.id);
    messageInput.value = "";

    sendMessageBtn.disabled = true;
    sendMessageBtn.textContent = "Thinking…";

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: MODEL,
            messages: buildOpenAIMessages(ticket.messages),
          }),
        },
      );

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Failed to reach OpenAI");
      }

      const data = await response.json();
      const assistantText = data.choices?.[0]?.message?.content?.trim();
      if (assistantText) {
        const assistantMessage = createMessage("assistant", assistantText);
        ticket.messages.push(assistantMessage);
        updateTicket(ticket.id, {
          messages: ticket.messages,
          summary: summaryInput.value,
        });
        renderMessages(ticket.messages, conversationList, ticket.id);
      }
      showToast("Model replied");
    } catch (error) {
      console.error(error);
      showToast(error.message || "OpenAI request failed", true);
    } finally {
      sendMessageBtn.disabled = false;
      sendMessageBtn.textContent = "Send to LLM";
    }
  });

  addNoteBtn.addEventListener("click", () => {
    const text = messageInput.value.trim();
    if (!text) return;
    const note = createMessage("note", text);
    ticket.messages.push(note);
    updateTicket(ticket.id, { messages: ticket.messages });
    renderMessages(ticket.messages, conversationList, ticket.id);
    messageInput.value = "";
    showToast("Note added");
  });

  generateSummaryBtn.addEventListener("click", () => {
    const lastAssistant = [...ticket.messages]
      .reverse()
      .find((msg) => msg.role === "assistant");
    if (!lastAssistant) {
      showToast("No assistant replies yet to use.", true);
      return;
    }
    summaryInput.value = lastAssistant.content;
    updateTicket(ticket.id, { summary: summaryInput.value });
    showToast("Summary filled from last reply");
  });

  copySummaryBtn.addEventListener("click", async () => {
    const text = summaryInput.value.trim();
    if (!text) {
      showToast("Write a summary before copying.", true);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast("Summary copied. Opening a fresh chat…");
      window.open("https://chat.openai.com/", "_blank", "noopener");
    } catch (error) {
      showToast("Could not copy to clipboard.", true);
    }
  });

  workspaceEl.appendChild(instance);
}

function renderMessages(messages, container, ticketId) {
  container.innerHTML = "";
  messages.forEach((message) => {
    const instance = messageTemplate.content.firstElementChild.cloneNode(true);
    instance.dataset.id = message.id;
    const roleEl = instance.querySelector(".message-role");
    const timeEl = instance.querySelector(".message-time");
    const contentEl = instance.querySelector(".message-content");
    const deleteBtn = instance.querySelector(".delete-message");

    roleEl.textContent =
      message.role === "assistant"
        ? "Assistant"
        : message.role === "note"
          ? "Note"
          : "You";
    contentEl.textContent = message.content;
    timeEl.textContent = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(message.createdAt));
    timeEl.dateTime = message.createdAt;

    if (message.role === "note") {
      instance.classList.add("note");
    }

    deleteBtn.addEventListener("click", () => {
      removeMessage(ticketId, message.id);
    });

    container.appendChild(instance);
  });
}

function createMessage(role, content) {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

function removeMessage(ticketId, messageId) {
  const ticket = state.tickets.find((item) => item.id === ticketId);
  if (!ticket) return;
  ticket.messages = ticket.messages.filter((msg) => msg.id !== messageId);
  updateTicket(ticketId, { messages: ticket.messages });
  renderWorkspace();
}

function buildOpenAIMessages(messages) {
  const history = [
    {
      role: "system",
      content:
        "You are an assistant helping refine brainstorming tickets. Provide thoughtful follow ups and clear summaries when asked.",
    },
  ];
  for (const message of messages) {
    if (message.role === "note") continue;
    if (message.role === "user" || message.role === "assistant") {
      history.push({ role: message.role, content: message.content });
    }
  }
  return history;
}

function updateTicket(id, updates) {
  state.tickets = state.tickets.map((ticket) => {
    if (ticket.id !== id) return ticket;
    return {
      ...ticket,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  });
  persistState();
}

function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast ${isError ? "error" : ""}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.add("visible");
  });
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2800);
}

async function confirmAction(message) {
  confirmMessage.textContent = message;
  confirmDialog.showModal();
  const value = await new Promise((resolve) => {
    const handler = (event) => {
      confirmDialog.removeEventListener("close", handler);
      resolve(confirmDialog.returnValue === "confirm");
    };
    confirmDialog.addEventListener("close", handler, { once: true });
  });
  return value;
}

// Toast styles
const toastStyle = document.createElement("style");
toastStyle.textContent = `
.toast {
  position: fixed;
  inset-inline: 0;
  bottom: 24px;
  margin: 0 auto;
  width: min(360px, calc(100vw - 32px));
  background: rgba(15, 23, 42, 0.88);
  color: #f8fafc;
  padding: 0.85rem 1.2rem;
  border-radius: 14px;
  text-align: center;
  font-weight: 500;
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  border: 1px solid rgba(148, 163, 184, 0.35);
  z-index: 9999;
}
.toast.visible {
  transform: translateY(0);
  opacity: 1;
}
.toast.error {
  background: rgba(249, 115, 22, 0.85);
  color: #0f172a;
}
`;
document.head.appendChild(toastStyle);
