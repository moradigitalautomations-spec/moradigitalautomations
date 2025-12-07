// script.js — contact form sender + basic UI helpers
const WEBHOOK_URL = "https://n8n-nypw.onrender.com/webhook/mora-lead";

// Graceful fetch with timeout
function fetchWithTimeout(url, options = {}, timeout = 9000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), timeout);
    fetch(url, options)
      .then((res) => { clearTimeout(timer); resolve(res); })
      .catch((err) => { clearTimeout(timer); reject(err); });
  });
}

// When DOM ready
document.addEventListener("DOMContentLoaded", () => {
  // form on contact page has id "site-contact-form"
  const form = document.getElementById("site-contact-form");
  if (!form) return;

  const statusEl = document.getElementById("form-status");
  const submitBtn = document.getElementById("form-submit-btn");
  const resetBtn = document.getElementById("form-reset-btn");

  const setStatus = (text, cls) => {
    statusEl.textContent = text;
    statusEl.className = "status " + (cls || "");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("Sending…", "sending");
    submitBtn.disabled = true;
    submitBtn.style.opacity = 0.7;

    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const service = form.service.value.trim();
    const message = form.message.value.trim();

    if (!name || !email) {
      setStatus("Please provide name and email.", "error");
      submitBtn.disabled = false;
      submitBtn.style.opacity = 1;
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      name, phone, email, service, message,
      source: "Mora Website"
    };

    try {
      const res = await fetchWithTimeout(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }, 10000);

      if (!res.ok) {
        // non-2xx -> parse json message if available
        let text = `Server returned ${res.status}`;
        try {
          const j = await res.json();
          text = j.message || JSON.stringify(j);
        } catch (_) {}
        throw new Error(text);
      }

      setStatus("Message sent — thank you! We will contact you shortly.", "success");
      form.reset();

    } catch (err) {
      console.error("Webhook POST error:", err);
      // Save locally as fallback
      try {
        const stored = JSON.parse(localStorage.getItem("mora_offline_leads") || "[]");
        stored.push({...payload, savedAt: new Date().toISOString()});
        localStorage.setItem("mora_offline_leads", JSON.stringify(stored));
      } catch (_) {}

      setStatus("Couldn't reach server — saved locally. We'll retry when online.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = 1;
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      setStatus("", "");
    });
  }

  // Optionally attempt to resend saved leads when coming back online
  window.addEventListener("online", async () => {
    const saved = JSON.parse(localStorage.getItem("mora_offline_leads") || "[]");
    if (!saved.length) return;
    setStatus("Retrying saved leads…", "sending");
    for (let item of saved.slice()) {
      try {
        const r = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(item)
        });
        if (r.ok) {
          // remove this item from saved list
          const list = JSON.parse(localStorage.getItem("mora_offline_leads") || "[]");
          const idx = list.findIndex(i => i.timestamp === item.timestamp && i.name === item.name);
          if (idx > -1) {
            list.splice(idx,1);
            localStorage.setItem("mora_offline_leads", JSON.stringify(list));
          }
        }
      } catch (e) {
        console.warn("Retry failed:", e);
        // stop trying for now
        break;
      }
    }
    setTimeout(()=> setStatus("", ""), 1800);
  });
});
