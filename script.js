// === IMPORTANT: Replace the string below with your production webhook URL ===
const WEBHOOK_URL = "PASTE_YOUR_WEBHOOK_URL_HERE";

/* --- UI hooks --- */
const form = document.getElementById("leadForm");
const statusEl = document.getElementById("status");
const pendingBox = document.getElementById("pendingBox");
const pendingList = document.getElementById("pendingList");
const retryBtn = document.getElementById("retryPending");
const menuBtn = document.getElementById("menuBtn");
const navList = document.getElementById("navList");
const yearEl = document.getElementById("year");

// set footer year if present
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* mobile menu (three-dot) */
if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    if (navList.style.display === "flex") {
      navList.style.display = "none";
    } else {
      navList.style.display = "flex";
      navList.style.flexDirection = "column";
      navList.style.background = "transparent";
      navList.style.gap = "12px";
    }
  });
}

/* status helper */
function showStatus(text, color = "") {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.style.color = color || "";
}

/* pending leads in localStorage */
function loadPending() {
  try { return JSON.parse(localStorage.getItem("mora_pending_leads") || "[]"); }
  catch(e) { return []; }
}
function savePending(list) { localStorage.setItem("mora_pending_leads", JSON.stringify(list)); renderPending(); }
function renderPending() {
  const list = loadPending();
  if (!pendingBox) return;
  if (list.length === 0) { pendingBox.hidden = true; pendingList.innerHTML = ""; return; }
  pendingBox.hidden = false;
  pendingList.innerHTML = "";
  list.forEach((p) => {
    const d = document.createElement("div");
    d.textContent = `${p.name || "—"} • ${p.phone || "—"} • ${p.service || "—"}`;
    d.style.marginBottom = "6px";
    pendingList.appendChild(d);
  });
}

/* best-effort wake server (no-cors GET) */
async function wakeServer() {
  if (!WEBHOOK_URL || WEBHOOK_URL.includes("PASTE_YOUR_WEBHOOK_URL_HERE")) return;
  try {
    await fetch(WEBHOOK_URL, { method: "GET", mode: "no-cors", cache: "no-cache" });
  } catch(e) { /* ignore */ }
}

/* send lead */
async function sendLead(payload) {
  if (!WEBHOOK_URL || WEBHOOK_URL.includes("PASTE_YOUR_WEBHOOK_URL_HERE")) {
    throw new Error("Webhook URL not set — edit script.js");
  }
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text().catch(()=>"");
    const err = new Error(`Server ${res.status} ${res.statusText} ${t}`);
    err.status = res.status; throw err;
  }
  return res;
}

/* form submit */
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

    const payload = { name, email, phone, service, message, source: "Mora Website", timestamp: new Date().toISOString() };

    showStatus("Preparing to send…", "gold");
    try {
      await wakeServer();
      showStatus("Sending…", "gold");
      await sendLead(payload);
      showStatus("Message sent successfully — we will contact you soon.", "lightgreen");
      form.reset();
    } catch (err) {
      showStatus("Couldn't reach server — lead saved locally. Use Retry pending.", "tomato");
      const list = loadPending();
      list.unshift(payload);
      savePending(list);
    }
  });
}

/* retry pending */
if (retryBtn) {
  retryBtn.addEventListener("click", async () => {
    const list = loadPending();
    if (!list.length) { showStatus("No pending leads.", "gold"); return; }
    showStatus("Retrying pending leads…", "gold");
    const remaining = [];
    let sent = 0;
    for (const lead of list) {
      try {
        await wakeServer();
        await sendLead(lead);
        sent++;
      } catch(e) {
        remaining.push(lead);
      }
    }
    savePending(remaining);
    if (sent) showStatus(`${sent} lead(s) sent successfully.`, "lightgreen");
    else showStatus("Retry failed. Server still unreachable.", "tomato");
  });
}

/* initial render */
renderPending();
