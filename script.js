// === IMPORTANT: Replace this with your production webhook URL ===
// Example: "https://n8n-nypw.onrender.com/webhook/mora-lead"
const WEBHOOK_URL = "https://n8n-nypw.onrender.com/webhook/mora-lead";

/*
Behavior:
1) tries to 'wake' the server with a quick GET (no-cors) so Render can spin up
2) sends POST with JSON payload
3) on network/server error it saves the lead to localStorage (pendingLeads)
4) user can retry pending leads using Retry button
*/

const form = document.getElementById("leadForm");
const statusEl = document.getElementById("status");
const pendingBox = document.getElementById("pendingBox");
const pendingList = document.getElementById("pendingList");
const retryBtn = document.getElementById("retryPending");

function showStatus(text, color="") {
  statusEl.textContent = text;
  statusEl.style.color = color || "";
}

function loadPending() {
  try {
    const raw = localStorage.getItem("mora_pending_leads");
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}
function savePending(list) {
  localStorage.setItem("mora_pending_leads", JSON.stringify(list));
  renderPending();
}
function renderPending() {
  const list = loadPending();
  if (list.length === 0) {
    pendingBox.hidden = true;
    pendingList.innerHTML = "";
    return;
  }
  pendingBox.hidden = false;
  pendingList.innerHTML = "";
  list.forEach((p, i) => {
    const d = document.createElement("div");
    d.textContent = `${p.name || "—"} • ${p.phone || "—"} • ${p.service || "—"}`;
    d.style.marginBottom = "6px";
    pendingList.appendChild(d);
  });
}

// quick "wake" helper (best-effort). Uses no-cors GET to reduce CORS issues.
async function wakeServer() {
  if (!WEBHOOK_URL || WEBHOOK_URL.includes("https://n8n-nypw.onrender.com/webhook/mora-lead")) return;
  try {
    // do a lightweight GET (no-cors) to wake Render (won't reveal response)
    await fetch(WEBHOOK_URL, { method: "GET", mode: "no-cors", cache: "no-cache" });
  } catch(e){
    // ignore — this is best-effort
  }
}

async function sendLead(payload) {
  if (!WEBHOOK_URL || WEBHOOK_URL.includes("PASTE_YOUR_WEBHOOK_URL_HERE")) {
    throw new Error("Webhook URL not set in script.js — paste your webhook URL in WEBHOOK_URL.");
  }

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    // no special credentials
  });

  // treat non-2xx as failure
  if (!res.ok) {
    const text = await res.text().catch(()=>"");
    const e = new Error("Server returned " + res.status + " " + res.statusText + (text ? ` — ${text}` : ""));
    e.status = res.status;
    throw e;
  }
  return res;
}

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const service = document.getElementById("service").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !email) {
    showStatus("Name and email are required.", "tomato");
    return;
  }

  const payload = {
    name, email, phone, service, message,
    source: "Mora Website",
    timestamp: new Date().toISOString()
  };

  showStatus("Preparing to send…", "gold");

  try {
    // try waking server first (best-effort)
    await wakeServer();
    showStatus("Sending…", "gold");
    await sendLead(payload);

    showStatus("Message sent successfully — we will contact you soon.", "lightgreen");
    form.reset();

  } catch (err) {
    // save to pending
    showStatus("Couldn't reach server — lead saved locally. You can retry.", "tomato");
    const pending = loadPending();
    pending.unshift(payload);
    savePending(pending);
  }
});

// retry pending
if (retryBtn) {
  retryBtn.addEventListener("click", async () => {
    const list = loadPending();
    if (list.length === 0) {
      showStatus("No pending leads to send.", "gold");
      return;
    }
    showStatus("Retrying pending leads…", "gold");
    let success = 0;
    const remaining = [];
    for (const lead of list) {
      try {
        await wakeServer();
        await sendLead(lead);
        success++;
      } catch(e) {
        remaining.push(lead);
      }
    }
    savePending(remaining);
    if (success > 0) {
      showStatus(`${success} lead(s) sent successfully.`, "lightgreen");
    } else {
      showStatus("Retry failed. Server still unreachable.", "tomato");
    }
  });
}

// initial UI
document.getElementById('year').textContent = new Date().getFullYear?.() || new Date().getFullYear();
renderPending();
