// script.js - contact + mobile menu
const WEBHOOK_URL = "https://n8n-nypw.onrender.com/webhook/mora-lead";

/* Mobile drawer toggle */
document.addEventListener('DOMContentLoaded', () => {
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
      mobileDrawer.style.display = mobileDrawer.classList.contains('open') ? 'block' : 'none';
    });

    // close on link click
    mobileDrawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobileDrawer.classList.remove('open');
      mobileDrawer.style.display = 'none';
    }));
  }

  /* Contact form */
  const form = document.getElementById('site-contact-form');
  const statusEl = document.getElementById('form-status');

  function setStatus(text, cls) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = 'form-status ' + (cls || '');
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('Sending…', 'sending');

    const payload = {
      timestamp: new Date().toISOString(),
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      service: form.service.value.trim(),
      message: form.message.value.trim(),
      source: 'Mora Website'
    };

    // basic validation
    if (!payload.name || !payload.email) {
      setStatus('Please enter name and email.', 'error');
      return;
    }

    // save fallback
    try {
      const existing = JSON.parse(localStorage.getItem('mora_offline') || '[]');
      existing.unshift(payload);
      localStorage.setItem('mora_offline', JSON.stringify(existing.slice(0,50)));
    } catch (e) { /* ignore */ }

    // POST to webhook
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || `Status ${res.status}`);
      }

      setStatus('Message sent successfully! We will contact you shortly.', 'success');
      form.reset();
    } catch (err) {
      console.error('Send error:', err);
      setStatus("Couldn't reach server — saved locally. We'll retry when online.", 'error');
    }
  });

  // retry saved leads when online
  window.addEventListener('online', async () => {
    const saved = JSON.parse(localStorage.getItem('mora_offline') || '[]');
    if (!saved.length) return;
    setStatus('Retrying saved leads…', 'sending');

    for (let i = saved.length - 1; i >= 0; i--) {
      const item = saved[i];
      try {
        const r = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(item)
        });
        if (r.ok) {
          // remove item
          const list = JSON.parse(localStorage.getItem('mora_offline') || '[]');
          const idx = list.findIndex(x => x.timestamp === item.timestamp && x.email === item.email);
          if (idx > -1) {
            list.splice(idx,1);
            localStorage.setItem('mora_offline', JSON.stringify(list));
          }
        }
      } catch (e) {
        console.warn('Retry error', e);
        break;
      }
    }
    setTimeout(() => setStatus('', ''), 1500);
  });
});
