// script.js
// Replace with your active n8n webhook URL (example: https://your-n8n-domain/webhook/mora-leads)
const BACKEND_WEBHOOK = "https://YOUR_N8N_DOMAIN/webhook/mora-leads";

document.addEventListener("DOMContentLoaded", () => {
  // set footer year
  const y = new Date().getFullYear();
  document.getElementById("year").textContent = y;

  // mobile menu toggle
  const mobileBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // form submit
  const form = document.getElementById("leadForm");
  const statusEl = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      statusEl.textContent = "Submitting…";
      statusEl.classList.remove("text-green-400", "text-red-400");

      // collect data
      const payload = {
        name: (document.getElementById("name") || {}).value || "",
        business: (document.getElementById("business") || {}).value || "",
        phone: (document.getElementById("phone") || {}).value || "",
        requirement: (document.getElementById("requirement") || {}).value || "",
        source: "website",
        page: window.location.href,
        timestamp: new Date().toISOString()
      };

      try {
        // send JSON to n8n webhook
        const resp = await fetch(BACKEND_WEBHOOK, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (resp.ok) {
          statusEl.textContent = "Thanks — your request has been submitted. We'll contact you soon.";
          statusEl.classList.add("text-green-400");
          form.reset();
        } else {
          const text = await resp.text();
          console.error("Server error:", text);
          statusEl.textContent = "Submission failed. Try again or call +91 85250 00808.";
          statusEl.classList.add("text-red-400");
        }
      } catch (err) {
        console.error("Network error:", err);
        statusEl.textContent = "Network error. Please try again later or message on WhatsApp.";
        statusEl.classList.add("text-red-400");
      }
    });
  }
});
