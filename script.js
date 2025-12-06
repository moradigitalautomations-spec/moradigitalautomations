// === Replace this with your production webhook URL ===
// e.g. const WEBHOOK_URL = "https://n8n-nypw.onrender.com/webhook/mora-lead";
const WEBHOOK_URL = "PASTE_YOUR_WEBHOOK_URL_HERE";

/* UX helpers */
const form = document.getElementById("leadForm");
const statusEl = document.getElementById("status");
const pendingBox = document.getElementById("pendingBox");
const pendingListEl = document.getElementById("pendingList");
const retryBtn = document.getElementById("retryPending");
const yearEl = document.getElementById("year");
const menuBtn = document.getElementById("menuBtn");
const navList = document.getElementById("navList");

// set year if element exists
if (yearEl) yearEl.textContent = new Date().getFullYear();

// mobile menu (three dots)
if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    if (navList.style.display === "flex") navList.style.display = "none";
    else navList.style.display = "flex";
    navList.style.flexDirection = "column";
    navList.style.gap = "12px";
  });
}

function showStatus(text, color) {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.style.color = color || "";
}

/* Local pending leads storage */
function loadPending() {
  try { return JSON.parse(localStorage.getItem("mora_pending_leads") || "[]"); }
  catch(e){ return []; }
}
function savePending(list) { localStorage.setItem("mora_pending_leads", JSON.stringify(list)); renderPending(); }
function renderPending() {
  const list = loadPending();
  if (!pendingBox) return;
  if (list.length === 0) {
    pendingBox.hidden = true; pendingListEl.innerHTML = ""; return;
  }
  pendingBox.hidden = false;
  pendingListEl.innerHTML = "";
  list.forEach((p,i) => {
    const el = document.createElement("div");
    el.textContent = `${p.name || '—'} • ${p.phone || '—'} • ${p.service || '—'}`;
    el.style.marginBottom = "6px";
    pendingListEl.appendChild(el);
  });
}

/* Best-effort wake (no-cors GET) */
async function wakeServer() {
  if (!WEBHOOK_URL || WEBHOOK_URL.includes("PASTE_YOUR_WEBHOOK_URL_HERE")) return;
  try {
    await fetch(WEBHOOK_URL, { method: "GET", mode: "no-cors", cache: "no-cache" });
  } catch(e) { /* ignore */ }
}

/* Send POST */
async function sendLead(payload) {
  if (!WEBHOOK_URL || WEBHOOK_URL.includes("PASTE_YOUR_WEBHOOK_URL_HERE")) {
    throw new Error("Webhook URL not set in script.js");
  }
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text().catch(()=>"");
    const err = new Error(`Server ${res.status} ${res.statusText} ${txt}`);
    err.status = res.status; throw err;
  }
  return res;
}

/* Submit handler */
if (form) {
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email) {
      showStatus("Please provide name and email.", "tomato");
      return;
    }

    const payload = {
      name, email, phone, service, message,
      source: "Mora Website",
      timestamp: new Date().toISOString()
    };

    showStatus("Preparing to send…", "gold");
    try {
      await wakeServer();
      showStatus("Sending…", "gold");
      await sendLead(payload);
      showStatus("Message sent successfully — thank you!", "lightgreen");
      form.reset();
    } catch (err) {
      showStatus("Couldn't reach server — lead saved locally. Use 'Retry pending'.", "tomato");
      const list = loadPending();
      list.unshift(payload);
      savePending(list);
    }
  });
}

/* Retry pending leads */
if (retryBtn) {
  retryBtn.addEventListener("click", async () => {
    const list = loadPending();
    if (!list.length) { showStatus("No pending leads.", "gold"); return; }
    showStatus("Retrying pending leads…", "gold");
    const remaining = [];
    let sent = 0;
    for (const p of list) {
      try { await wakeServer(); await sendLead(p); sent++; }
      catch(e) { remaining.push(p); }
    }
    savePending(remaining);
    if (sent) showStatus(`${sent} lead(s) sent successfully.`, "lightgreen");
    else showStatus("Retry failed. Server still unreachable.", "tomato");
  });
}

// initial render
renderPending();
