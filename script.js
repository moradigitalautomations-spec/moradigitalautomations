// ======= script.js =======
// IMPORTANT: Replace this with your production webhook URL (exact).
// Example: const WEBHOOK_URL = "https://n8n-nypw.onrender.com/webhook/mora-lead";
const WEBHOOK_URL = "https://n8n-nypw.onrender.com/webhook/mora-lead";

// ----- Element hooks (IDs expected in HTML) -----
const form = document.getElementById("leadForm");
const statusEl = document.getElementById("status");
const pendingBox = document.getElementById("pendingBox");
const pendingListEl = document.getElementById("pendingList");
const retryBtn = document.getElementById("retryPending");
const menuBtn = document.getElementById("menuBtn");
const navList = document.getElementById("navList");
const yearEl = document.getElementById("year");

// set footer year if element exists
if (yearEl) {
  try { yearEl.textContent = new Date().getFullYear(); } catch(e){}
}

// mobile menu toggle (three-dot)
if (menuBtn && navList) {
  menuBtn.addEventListener("click", () => {
    const shown = getComputedStyle(navList).display !== "none" && navList.style.display !== "none";
    navList.style.display = shown ? "none" : "flex";
    navList.style.flexDirection = "column";
    navList.style.gap = "12px";
  });
}

// ----- Utilities -----
function debugLog(...args) {
  if (window.console && window.console.log) console.log("[mora-script]", ...args);
}

function showStatus(text, color = "") {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.style.color = color || "";
}

// LocalStorage helpers for pending leads
const PENDING_KEY = "mora_pending_leads";
function loadPending() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    debugLog("Failed to parse pending leads:", e);
    return [];
  }
}
function savePending(list) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(list));
  } catch (e) {
    debugLog("Failed to save pending leads:", e);
  }
  renderPending();
}
function addPending(item) {
  const list = loadPending();
  list.unshift(item);
  savePending(list);
}
function clearPending() {
  savePending([]);
}
function renderPending() {
  if (!pendingBox || !pendingListEl) return;
  const list = loadPending();
  if (!list.length) {
    pendingBox.hidden = true;
    pendingListEl.innerHTML = "";
    return;
  }
  pendingBox.hidden = false;
  pendingListEl.innerHTML = "";
  list.forEach((p, i) => {
    const div = document.createElement("div");
    div.textContent = `${p.name || "—"} • ${p.phone || "—"} • ${p.service || "—"} • ${new Date(p.timestamp).toLocaleString()}`;
    div.style.marginBottom = "6px";
    pendingListEl.appendChild(div);
  });
}

// Best-effort wake (works with Render-type hosts that sleep).
// Uses no-cors GET to avoid CORS failures revealing server content.
async function wakeServer() {
  if (!WEBHOOK_URL || WEBHOOK_URL.includes("https://n8n-nypw.onrender.com/webhook/mora-lead")) return;
  try {
    await fetch(WEBHOOK_URL, { method: "GET", mode: "no-cors", cache: "no-cache" });
    debugLog("Wake request sent (no-cors).");
  } catch (e) {
    debugLog("Wake request error (ignored):", e);
  }
}

// Sends the lead via POST and throws on failure
async function postLeadJSON(payload, timeoutMs = 15000) {
  if (!WEBHOOK_URL || WEBHOOK_URL.includes("https://n8n-nypw.onrender.com/webhook/mora-lead")) {
    throw new Error("Webhook URL not set in script.js. Paste your webhook URL into WEBHOOK_URL.");
  }

  // timeout wrapper
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(id);

    // Accept 2xx as success. Some webhook endpoints respond 204/200.
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(`Server returned ${res.status} ${res.statusText} ${text}`);
      err.status = res.status;
      throw err;
    }

    // success
    return res;
  } catch (err) {
    clearTimeout(id);
    // Distinguish abort/timeouts
    if (err.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw err;
  }
}

// Attempts to resend a list of pending leads; returns number sent
async function flushPending() {
  const pending = loadPending();
  if (!pending.length) return 0;
  showStatus("Retrying pending leads...", "gold");
  const remaining = [];
  let sent = 0;
  for (const lead of pending) {
    try {
      await wakeServer();
      await postLeadJSON(lead);
      sent++;
      debugLog("Pending lead sent:", lead);
    } catch (e) {
      debugLog("Pending lead send failed:", e);
      remaining.push(lead);
    }
  }
  savePending(remaining);
  if (sent) showStatus(`${sent} pending lead(s) sent.`, "lightgreen");
  else if (!remaining.length) showStatus("No pending leads remaining.", "gold");
  return sent;
}

// Auto-retry when connection restored
window.addEventListener("online", async () => {
  debugLog("Browser online — attempting to flush pending leads.");
  try {
    await flushPending();
  } catch (e) {
    debugLog("Flush after online failed:", e);
  }
});

// ----- Form submit handling -----
if (form) {
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    // Read form values (IDs expected)
    const name = (document.getElementById("name") || {}).value || "";
    const email = (document.getElementById("email") || {}).value || "";
    const phone = (document.getElementById("phone") || {}).value || "";
    const service = (document.getElementById("service") || {}).value || "";
    const message = (document.getElementById("message") || {}).value || "";

    if (!name.trim() || !email.trim()) {
      showStatus("Please provide name and email.", "tomato");
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      service: service.trim(),
      message: message.trim(),
      source: "Mora Website",
      timestamp: new Date().toISOString()
    };

    showStatus("Preparing to send…", "gold");
    try {
      // Try to wake server quickly (best-effort)
      await wakeServer();

      showStatus("Sending…", "gold");
      await postLeadJSON(payload);

      showStatus("Message sent successfully — thank you!", "lightgreen");
      form.reset();
      debugLog("Lead sent:", payload);

      // Try flush pending too (in case previous leads exist)
      setTimeout(() => flushPending().catch(e => debugLog("flushPending err:", e)), 500);

    } catch (err) {
      debugLog("Send failed:", err);
      // Save locally
      addPending(payload);
      showStatus("Couldn't reach server — lead saved locally. Use 'Retry pending'.", "tomato");
    }
  });
}

// Retry pending button handler
if (retryBtn) {
  retryBtn.addEventListener("click", async () => {
    try {
      const sent = await flushPending();
      if (!sent) showStatus("Retry finished — no leads were sent.", "gold");
    } catch (e) {
      debugLog("Retry click error:", e);
      showStatus("Retry failed. Server still unreachable.", "tomato");
    }
  });
}

// Initial render of pending leads on page load
renderPending();

// Safety-check: if webhook URL missing, show a clear message in status
if (!WEBHOOK_URL || WEBHOOK_URL.includes("https://n8n-nypw.onrender.com/webhook/mora-lead")) {
  showStatus("Webhook URL not set in script.js — paste your webhook URL into WEBHOOK_URL.", "tomato");
  debugLog("Webhook URL placeholder present. Edit script.js and add your webhook URL.");
}
