// script.js - Shared behavior for all pages

// OPTIONAL: set WEBHOOK_URL to forward leads (hidden from UI). Leave empty to disable forwarding.
const WEBHOOK_URL = ""; // e.g. "https://your-n8n-or-apps-script-url"

// On DOM ready
document.addEventListener("DOMContentLoaded", () => {
  // Show year in footer
  const y = new Date().getFullYear();
  document.querySelectorAll("#year").forEach(el => el.textContent = y);

  // Theme toggle (keeps simple toggling class on body)
  const themeToggle = document.getElementById("themeToggle");
  const root = document.body;
  const saved = localStorage.getItem("mora_theme");
  if (saved) root.className = saved;
  if (themeToggle) themeToggle.addEventListener("click", () => {
    const next = root.classList.contains("light") ? "" : "light";
    root.className = next;
    localStorage.setItem("mora_theme", next);
  });

  // Mobile nav toggle
  const menuBtn = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  if(menuBtn && mobileNav) menuBtn.addEventListener("click", ()=> mobileNav.classList.toggle("hidden"));

  // Simple reveal animation
  const obs = new IntersectionObserver((items) => {
    items.forEach(i => { if(i.isIntersecting) i.target.classList.add("in"); });
  }, {threshold: 0.15});
  document.querySelectorAll("[data-anim]").forEach(el => obs.observe(el));

  // WhatsApp Quick: prefill message using values if available
  const waQuick = document.getElementById("waQuick");
  if(waQuick){
    waQuick.addEventListener("click", () => {
      const name = document.getElementById("name")?.value || 'Hello';
      const phone = document.getElementById("phone")?.value || '';
      const text = encodeURIComponent(`Hi Mora, I'm ${name} ${phone ? '('+phone+')' : ''}. I need automation help.`);
      window.open(`https://wa.me/918525000808?text=${text}`, "_blank");
    });
  }

  // Form handlers for contact and booking (store lead locally & optionally forward)
  function saveLead(key, payload){
    // Save to localStorage array
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push(payload);
    localStorage.setItem(key, JSON.stringify(existing));
    return existing.length;
  }

  async function forwardLead(payload){
    if(!WEBHOOK_URL) return {ok:false, msg:"webhook empty"};
    try {
      const r = await fetch(WEBHOOK_URL, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)});
      const text = await r.text();
      return {ok:r.ok, msg:text};
    } catch(err){
      return {ok:false, msg: err.message};
    }
  }

  // Contact form
  const contactForm = document.getElementById("contactForm");
  if(contactForm){
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = contactForm.querySelector("#name")?.value || "";
      const phone = contactForm.querySelector("#phone")?.value || "";
      const email = contactForm.querySelector("#email")?.value || "";
      const message = contactForm.querySelector("#message")?.value || "";
      const payload = {name, phone, email, message, ts:new Date().toISOString(), page: location.pathname};
      // save locally
      saveLead("mora_leads", payload);
      // optionally forward
      const res = await forwardLead(payload);
      const status = document.getElementById("formStatus");
      if(!WEBHOOK_URL || !res.ok){
        status.textContent = "Thanks — request received. We will contact you soon.";
      } else {
        status.textContent = "Thanks — your request was forwarded. We'll contact you soon.";
      }
      contactForm.reset();
    });
  }

  // Booking form
  const bookingForm = document.getElementById("bookingForm");
  if(bookingForm){
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        name: bookingForm.querySelector("#bname")?.value || "",
        phone: bookingForm.querySelector("#bphone")?.value || "",
        email: bookingForm.querySelector("#bemail")?.value || "",
        business: bookingForm.querySelector("#bshop")?.value || "",
        service: bookingForm.querySelector("#bservice")?.value || "",
        notes: bookingForm.querySelector("#bnotes")?.value || "",
        ts: new Date().toISOString(),
        page: location.pathname
      };
      saveLead("mora_leads", payload);
      const res = await forwardLead(payload);
      const status = document.getElementById("bookStatus");
      if(!WEBHOOK_URL || !res.ok){
        status.textContent = "Booking request saved. We will reach out to schedule your call.";
      } else {
        status.textContent = "Booking request forwarded. We will contact you shortly.";
      }
      bookingForm.reset();
    });

    // Clear button
    const btnClear = document.getElementById("btnClear");
    if(btnClear) btnClear.addEventListener("click", ()=> { bookingForm.reset(); document.getElementById("bookStatus").textContent = "";});
  }

  // Contact quick form (on contact page)
  const quickContact = document.getElementById("contactForm");
  if(quickContact){
    // handled above for id contactForm
  }

  // small utility: reveal year placeholders if missing
  document.querySelectorAll("#year").forEach(el => el.textContent = new Date().getFullYear());
});
