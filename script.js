// script.js
// Simple form handling: save leads locally, try to POST to webhook (if set).
// Set WEBHOOK_URL to your deployed Google Apps Script webhook URL to forward leads to Google Sheets.

const WEBHOOK_URL = ""; // <-- OPTIONAL: paste your webhook URL here (see Apps Script below)

document.addEventListener("DOMContentLoaded", () => {
  // year
  document.getElementById("year").innerText = new Date().getFullYear();

  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const exportBtn = document.getElementById("exportCsv");

  // load or init leads
  let leads = JSON.parse(localStorage.getItem("mora_leads_v1") || "[]");

  function saveLeads() {
    localStorage.setItem("mora_leads_v1", JSON.stringify(leads));
  }

  function showStatus(msg, ok=true) {
    status.innerText = msg;
    status.style.color = ok ? "green" : "crimson";
  }

  async function postToWebhook(payload) {
    if (!WEBHOOK_URL) return {ok:false, msg:"no webhook set"};
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
      return {ok: res.ok, msg: await res.text()};
    } catch(e) {
      return {ok:false, msg: e.message};
    }
  }

  function csvDownload(rows, filename="mora-leads.csv") {
    const cols = Object.keys(rows[0] || {});
    const csv = [cols.join(",")].concat(
      rows.map(r => cols.map(c => `"${String(r[c]||"").replace(/"/g,'""')}"`).join(","))
    ).join("\r\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  exportBtn.addEventListener("click", () => {
    if (!leads.length) return showStatus("No leads to export", false);
    csvDownload(leads);
    showStatus("CSV export started");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const business = document.getElementById("business").value.trim();
    const message = document.getElementById("message").value.trim();
    if (!name || !phone || !message) {
      showStatus("Please fill name, phone & message", false);
      return;
    }

    const lead = {
      id: Date.now().toString(),
      name, phone, email, business, message,
      createdAt: new Date().toISOString()
    };

    // save locally first
    leads.unshift(lead); // newest first
    saveLeads();
    showStatus("Saved locally ✓ — sending…");

    // try to POST to webhook if provided
    const result = await postToWebhook(lead);
    if (result.ok) {
      showStatus("Lead saved & forwarded to sheet ✓");
    } else {
      showStatus("Lead saved locally. Forward failed: " + result.msg, false);
    }

    form.reset();
  });
});
