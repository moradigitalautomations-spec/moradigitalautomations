// script.js
const WEBHOOK_URL = "https://n8n-nypw.onrender.com/webhook/mora lead"; // <-- your webhook

// Mobile menu
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.main-nav');
  menuBtn && menuBtn.addEventListener('click', () => {
    if (!nav) return;
    nav.style.display = (nav.style.display === 'flex') ? 'none' : 'flex';
  });

  // mark active nav item based on pathname
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(path)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // contact form submit (if present)
  const form = document.getElementById('leadForm');
  if (form){
    const statusEl = document.getElementById('status');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!WEBHOOK_URL || WEBHOOK_URL.includes('paste')) {
        statusEl.textContent = 'Webhook not configured — open script.js and set your webhook URL.';
        statusEl.style.color = '#e76b6b';
        return;
      }

      statusEl.textContent = 'Sending...';
      statusEl.style.color = '#d4a73d';

      const payload = {
        timestamp: new Date().toISOString(),
        name: document.getElementById('name')?.value || '',
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        service: document.getElementById('service')?.value || '',
        message: document.getElementById('message')?.value || '',
        source: 'Mora Website'
      };

      try {
        const res = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Network response not ok');

        statusEl.textContent = 'Message sent successfully! We will contact you shortly.';
        statusEl.style.color = '#7ee1a5';
        form.reset();
      } catch (err) {
        console.error(err);
        statusEl.textContent = "Couldn't reach server. Check webhook or console for errors.";
        statusEl.style.color = '#ff6b6b';
      }
    });
  }
});
