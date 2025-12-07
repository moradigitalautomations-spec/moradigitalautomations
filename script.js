/* --------------- CONFIG --------------- */
/* Replace with your n8n webhook URL (production). Put your URL here only once. */
const WEBHOOK_URL = "YOUR_WEBHOOK_URL_HERE";

/* --------------- DOM --------------- */
const leadForm = document.getElementById('leadForm');
const statusEl = document.getElementById('status');

const mobileBtn = document.getElementById('mobileBtn');
const mobileMenu = document.getElementById('mobileMenu');

mobileBtn && mobileBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
function closeMobile(){ mobileMenu && mobileMenu.classList.remove('open'); }

/* --------------- Helpers --------------- */
function showStatus(text, color = '#374151') {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.style.color = color;
}

/* Basic validation */
function validateForm(values) {
  if (!values.name || !values.email) {
    return 'Please provide name and email.';
  }
  // simple phone number check: digits length (not strict)
  if (values.phone && values.phone.replace(/\D/g,'').length < 7) {
    return 'Please provide a valid phone number.';
  }
  return '';
}

/* --------------- Form Submission --------------- */
if (leadForm) {
  leadForm.addEventListener('submit', async (evt) => {
    evt.preventDefault();

    showStatus('Preparing...', '#6b7280');

    const payload = {
      timestamp: new Date().toISOString(),
      name: (document.getElementById('name')?.value || '').trim(),
      phone: (document.getElementById('phone')?.value || '').trim(),
      email: (document.getElementById('email')?.value || '').trim(),
      service: (document.getElementById('service')?.value || '').trim(),
      message: (document.getElementById('message')?.value || '').trim(),
      source: 'Mora Website'
    };

    const validationError = validateForm(payload);
    if (validationError) {
      showStatus(validationError, '#dc2626');
      return;
    }

    // Save fallback locally in case of failure
    try {
      const backups = JSON.parse(localStorage.getItem('mora_leads') || '[]');
      backups.unshift(payload);
      localStorage.setItem('mora_leads', JSON.stringify(backups.slice(0,50)));
    } catch(e){ /* ignore localStorage errors */ }

    // If WEBHOOK_URL not configured, show helpful message
    if (!WEBHOOK_URL || WEBHOOK_URL === 'YOUR_WEBHOOK_URL_HERE') {
      showStatus('Webhook not configured — please paste your webhook URL into script.js', '#b45309');
      return;
    }

    showStatus('Sending to server...', '#2563eb');

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // keep same-origin credentials off to avoid preflight issues with some hosts
      });

      if (!res.ok) {
        // Non-2xx
        const txt = await res.text().catch(()=>res.statusText);
        throw new Error(`Server responded ${res.status} ${txt}`);
      }

      // success
      showStatus('Message sent successfully — we will reach out shortly!', '#059669');
      leadForm.reset();
    } catch (err) {
      console.error('Send error:', err);
      showStatus('Couldn\'t reach server. Saved locally. Check webhook configuration.', '#b91c1c');
    }
  });
}

/* --------------- Mobile close helper for anchor clicks --------------- */
document.querySelectorAll('#mobileMenu a').forEach(a=>{
  a.addEventListener('click', ()=> mobileMenu.classList.remove('open'));
});

/* --------------- Small UX: remove no-js class --------------- */
document.documentElement.classList.remove('no-js');
