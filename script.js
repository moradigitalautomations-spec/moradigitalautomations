// script.js — mobile menu, contact form POST to n8n, offline fallback, custom select
const WEBHOOK_URL = "https://n8n-nypw.onrender.com/webhook/mora-lead";

/* --- mobile drawer toggle --- */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('mobileToggle');
  const drawer = document.getElementById('mobileDrawer');
  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      drawer.classList.toggle('open');
      drawer.style.display = drawer.classList.contains('open') ? 'block' : 'none';
    });
    // close when any link clicked
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      drawer.classList.remove('open');
      drawer.style.display = 'none';
    }));
  }

  /* --- custom select for service (prevents native white popup) --- */
  const customSelects = document.querySelectorAll('.custom-select');
  customSelects.forEach(cs => {
    const selected = cs.querySelector('.selected');
    const options = cs.querySelector('.options');
    selected.addEventListener('click', () => {
      const isOpen = options.style.display === 'block';
      document.querySelectorAll('.custom-select .options').forEach(o => o.style.display = 'none');
      options.style.display = isOpen ? 'none' : 'block';
    });
    options.querySelectorAll('.option').forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.getAttribute('data-value') || opt.textContent.trim();
        selected.querySelector('.value').textContent = opt.textContent.trim();
        // store as hidden input for form submission
        const hidden = cs.querySelector('input[type="hidden"]');
        if (hidden) hidden.value = val;
        options.style.display = 'none';
      });
    });
    // close if click outside
    document.addEventListener('click', (ev) => {
      if (!cs.contains(ev.target)) options.style.display = 'none';
    });
  });

  /* --- contact form handling --- */
  const form = document.getElementById('site-contact-form');
  const statusEl = document.getElementById('form-status');

  function setStatus(text, cls) {
    statusEl.textContent = text || '';
    statusEl.className = 'form-status ' + (cls || '');
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('Sending…');

    // collect values
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    // service uses hidden input inside custom-select
    const service = (form.querySelector('input[name="service"]') || { value: '' }).value.trim();
    const message = form.message.value.trim();

    // basic validation
    if (!name || !email) {
      setStatus('Please provide name and email.');
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      name, phone, email, service, message,
      source: 'Mora Website'
    };

    // save fallback copy locally
    try {
      const existing = JSON.parse(localStorage.getItem('mora_offline') || '[]');
      existing.unshift(payload);
      localStorage.setItem('mora_offline', JSON.stringify(existing.slice(0, 100)));
    } catch (err) {
      // ignore storage errors
    }

    // POST with timeout
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || `Status ${res.status}`);
      }
      setStatus('Message sent successfully! We will contact you shortly.', 'success');
      form.reset();
      // reset custom select label to default
      document.querySelectorAll('.custom-select .selected .value').forEach(v => v.textContent = 'WhatsApp Automation');
    } catch (err) {
      console.error('Send error', err);
      setStatus("Couldn't reach server — saved locally. We'll retry when online.", 'error');
    }
  });

  // retry saved leads when online
  window.addEventListener('online', async () => {
    const saved = JSON.parse(localStorage.getItem('mora_offline') || '[]');
    if (!saved.length) return;
    setStatus('Retrying saved leads…');
    for (let i = saved.length - 1; i >= 0; i--) {
      const item = saved[i];
      try {
        const r = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        if (r.ok) {
          const list = JSON.parse(localStorage.getItem('mora_offline') || '[]');
          const idx = list.findIndex(x => x.timestamp === item.timestamp && x.email === item.email);
          if (idx > -1) { list.splice(idx,1); localStorage.setItem('mora_offline', JSON.stringify(list)); }
        }
      } catch (e) {
        console.warn('Retry failed', e);
        break;
      }
    }
    setTimeout(()=> setStatus(''), 1500);
  });

}); // DOMContentLoaded
