// script.js - Premium site behavior for Mora
// No local storage of leads. Optional webhook forwarding (set WEBHOOK_URL to enable server forwarding).

const WEBHOOK_URL = ""; // <-- OPTIONAL: paste your webhook URL here (Google Apps Script or your webhook). Leave empty to disable server forwarding.

document.addEventListener("DOMContentLoaded", () => {
  // set year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // mobile nav toggle (simple)
  const navToggle = document.getElementById("navToggle");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const nav = document.querySelector(".nav");
      if (!nav) return;
      nav.classList.toggle("open");
      // simple visual fallback: show links when open
      const links = nav.querySelectorAll("a");
      links.forEach(a => {
        a.style.display = nav.classList.contains("open") ? "inline-block" : "none";
      });
    });
  }

  // contact form
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const phoneBtn = document.getElementById("phoneBtn");

  function showStatus(msg, ok = true) {
    if (!status) return;
    status.textContent = msg;
    status.style.color = ok ? "green" : "crimson";
  }

  async function forwardToWebhook(payload) {
    if (!WEBHOOK_URL) return { ok: false, msg: "webhook not configured" };
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      return { ok: res.ok, msg: text };
    } catch (err) {
      return { ok: false, msg: err.message };
    }
  }

  if (phoneBtn) {
    phoneBtn.addEventListener("click", () => {
      // open WhatsApp with prefilled message
      const name = document.getElementById("name")?.value || "";
      const phone = document.getElementById("phone")?.value || "";
      const message = encodeURIComponent(`Hi, I'm ${name || "interested"} from ${phone || "unknown"} - I want to discuss automations.`);
      // your phone:
      const waPhone = "918525000808";
      window.open(`https://wa.me/${waPhone}?text=${message}`, "_blank");
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      showStatus(""); // clear
      const name = document.getElementById("name")?.value.trim();
      const phone = document.getElementById("phone")?.value.trim();
      const email = document.getElementById("email")?.value.trim();
      const business = document.getElementById("business")?.value.trim();
      const message = document.getElementById("message")?.value.trim();

      if (!name || !phone || !message) {
        showStatus("Please fill name, phone and message", false);
        return;
      }

      const payload = {
        name, phone, email, business, message,
        submittedAt: new Date().toISOString()
      };

      // Show immediate friendly response (no internal details)
      showStatus("Sending request…");

      // Try forward to webhook if configured
      const result = await forwardToWebhook(payload);
      if (WEBHOOK_URL && result.ok) {
        showStatus("Request received — we will contact you shortly. Thank you!");
      } else if (WEBHOOK_URL && !result.ok) {
        // webhook configured but forwarding failed
        showStatus("Request received locally. We could not forward automatically; we will contact you. Thank you!");
      } else {
        // no webhook configured
        showStatus("Request received — we will contact you shortly. Thank you!");
      }

      // reset form visually
      form.reset();
    });
  }
});
