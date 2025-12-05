// script.js - Royal Premium behavior
// Optional: configure WEBHOOK_URL to forward leads to Google Sheets / n8n (hidden from UI)
const WEBHOOK_URL = ""; // PUT your webhook URL here (optional). Leave empty to disable forwarding.

document.addEventListener("DOMContentLoaded", () => {
  // year
  const y = new Date().getFullYear();
  const yEl = document.getElementById("year");
  if (yEl) yEl.textContent = y;

  // theme toggle (persist)
  const themeToggle = document.getElementById("themeToggle");
  const root = document.body;
  const saved = localStorage.getItem("mora_theme");
  if (saved) {
    root.className = saved;
  } else {
    root.className = "dark-theme"; // default
  }
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.classList.contains("dark-theme") ? "light-theme" : "dark-theme";
      root.className = next;
      localStorage.setItem("mora_theme", next);
    });
  }

  // mobile nav
  const menuToggle = document.getElementById("menuToggle") || document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => mobileNav.classList.toggle("hidden"));
  }

  // scroll animations: reveal elements with data-anim
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("in");
    });
  }, { threshold: 0.18 });

  document.querySelectorAll("[data-anim]").forEach(el => observer.observe(el));

  // contact form
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const waQuick = document.getElementById("waQuick");

  function showStatus(msg, ok=true){
    if(!status) return;
    status.textContent = msg;
    status.style.color = ok ? "#b7f2c6" : "#ffb4b4";
  }

  async function forward(payload){
    if(!WEBHOOK_URL) return { ok: false, msg: "no webhook" };
    try {
      const r = await fetch(WEBHOOK_URL, { method: "POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
      const text = await r.text();
      return { ok: r.ok, msg: text };
    } catch(err) {
      return { ok:false, msg: err.message };
    }
  }

  if(form){
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      showStatus("Sending…", true);
      const payload = {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email ? form.email.value.trim() : "",
        business: form.business ? form.business.value.trim() : "",
        message: form.message.value.trim(),
        ts: new Date().toISOString()
      };
      // forward if webhook configured (hidden to user)
      const res = await forward(payload);
      if(WEBHOOK_URL && res.ok){
        showStatus("Thanks — we received your request. We'll contact you soon.", true);
      } else if(WEBHOOK_URL && !res.ok){
        showStatus("Request received. We could not forward automatically, but we'll contact you. Thank you.", false);
      } else {
        showStatus("Thanks — we received your request. We'll contact you soon.", true);
      }
      form.reset();
    });
  }

  // WhatsApp quick button: prefill message
  if(waQuick){
    waQuick.addEventListener("click", () => {
      const name = document.getElementById("name")?.value || "";
      const phone = document.getElementById("phone")?.value || "";
      const msg = encodeURIComponent(`Hi Mora, I'm ${name || 'interested'} (${phone || 'no phone provided'}). I need automation help.`);
      window.open(`https://wa.me/918525000808?text=${msg}`, "_blank");
    });
  }

  // floating WhatsApp small animation
  const fab = document.getElementById("whatsAppFab");
  if(fab){
    fab.addEventListener("mouseenter", ()=> fab.style.transform = "translateY(-6px)");
    fab.addEventListener("mouseleave", ()=> fab.style.transform = "");
  }
});
