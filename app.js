const threads = [
  {
    id: "gemini",
    name: "Gemini",
    status: "Online • Ready for ADK",
    avatar: "G",
    messages: [
      { role: "info", text: "Today 9:41 AM" },
      {
        role: "them",
        text: "Hi, I'm Gemini. Hook me up to your backend and I'll take it from here.",
        time: "9:41 AM",
      },
      {
        role: "them",
        text: "Want to try a quick prompt before we go live?",
        time: "9:42 AM",
      },
      {
        role: "me",
        text: "Let's make this feel exactly like iMessage.",
        time: "9:43 AM",
      },
    ],
  },
  {
    id: "design",
    name: "Design QA",
    status: "Offline",
    avatar: "D",
    messages: [
      { role: "info", text: "Yesterday" },
      {
        role: "them",
        text: "Ship this build with the iMessage polish. It's spot on.",
        time: "4:18 PM",
      },
    ],
  },
];

const threadListEl = document.getElementById("threadList");
const messageListEl = document.getElementById("messageList");
const typingIndicator = document.getElementById("typingIndicator");
const contactNameEl = document.getElementById("contactName");
const contactStatusEl = document.getElementById("contactStatus");
const contactAvatarEl = document.getElementById("contactAvatar");
const composerForm = document.getElementById("composerForm");
const composerInput = document.getElementById("composerInput");
const sendButton = composerForm.querySelector(".send");
const searchInput = document.getElementById("search");

let activeThreadId = threads[0].id;

renderThreadList();
renderConversation();

threadListEl.addEventListener("click", (event) => {
  const item = event.target.closest(".thread");
  if (!item) return;
  const { threadId } = item.dataset;
  activeThreadId = threadId;
  renderThreadList();
  renderConversation();
});

composerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = composerInput.value.trim();
  if (!text) return;
  addMessage("me", text);
  composerInput.value = "";
  composerInput.style.height = "auto";
  toggleSendState();
  simulateTyping();
});

composerInput.addEventListener("input", () => {
  composerInput.style.height = "auto";
  composerInput.style.height = `${composerInput.scrollHeight}px`;
  toggleSendState();
});

searchInput.addEventListener("input", () => {
  renderThreadList(searchInput.value.toLowerCase());
});

function renderThreadList(filter = "") {
  threadListEl.innerHTML = "";
  threads
    .filter((thread) =>
      thread.name.toLowerCase().includes(filter) ||
      (thread.messages.at(-1)?.text?.toLowerCase() || "").includes(filter),
    )
    .forEach((thread) => {
      const li = document.createElement("li");
      li.className = "thread";
      li.dataset.threadId = thread.id;
      li.setAttribute("role", "listitem");
      li.setAttribute("aria-selected", thread.id === activeThreadId);

      const avatar = document.createElement("div");
      avatar.className = "avatar";
      avatar.textContent = thread.avatar;

      const name = document.createElement("p");
      name.className = "name";
      name.textContent = thread.name;

      const status = document.createElement("span");
      status.className = "status-dot";
      status.hidden = thread.status.toLowerCase() !== "online • ready for adk";
      name.appendChild(status);

      const preview = document.createElement("p");
      preview.className = "preview";
      preview.textContent = thread.messages.at(-1)?.text || "No messages yet";

      const meta = document.createElement("p");
      meta.className = "meta";
      meta.textContent = thread.status;

      const textWrap = document.createElement("div");
      textWrap.appendChild(name);
      textWrap.appendChild(preview);
      textWrap.appendChild(meta);

      li.appendChild(avatar);
      li.appendChild(textWrap);
      threadListEl.appendChild(li);
    });
}

function renderConversation() {
  const thread = threads.find((item) => item.id === activeThreadId);
  if (!thread) return;

  contactNameEl.textContent = thread.name;
  contactStatusEl.textContent = thread.status;
  contactAvatarEl.textContent = thread.avatar;
  contactAvatarEl.style.background =
    thread.id === "gemini"
      ? "linear-gradient(135deg, #00c6ff, #0072ff)"
      : "linear-gradient(135deg, #7c7c7c, #4a4a4a)";

  messageListEl.innerHTML = "";

  let previousRole = null;

  thread.messages.forEach((message) => {
    if (message.role === "info") {
      const info = document.createElement("div");
      info.className = "info";
      info.textContent = message.text;
      messageListEl.appendChild(info);
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = `message ${message.role}`;

    const row = document.createElement("div");
    row.className = "message-row";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    const isNewStack = previousRole !== message.role;
    bubble.classList.add(isNewStack ? "with-tail" : "stacked");
    bubble.textContent = message.text;

    row.appendChild(bubble);
    wrapper.appendChild(row);

    const time = document.createElement("span");
    time.className = "time";
    time.textContent = message.time ?? formatTime(new Date());
    wrapper.appendChild(time);

    messageListEl.appendChild(wrapper);

    previousRole = message.role;
  });

  messageListEl.scrollTop = messageListEl.scrollHeight;
}

function addMessage(role, text) {
  const thread = threads.find((item) => item.id === activeThreadId);
  if (!thread) return;
  thread.messages.push({ role, text, time: formatTime(new Date()) });
  renderConversation();
}

function simulateTyping() {
  typingIndicator.classList.add("visible");
  setTimeout(() => {
    typingIndicator.classList.remove("visible");
    addMessage(
      "them",
      "I'll be ready the moment you plug in the Gemini ADK endpoint. Until then, enjoy the iMessage vibes!",
    );
  }, 1100);
}

function formatTime(date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function toggleSendState() {
  const hasContent = composerInput.value.trim().length > 0;
  sendButton.disabled = !hasContent;
}

toggleSendState();
