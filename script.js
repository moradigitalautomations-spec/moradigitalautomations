/* -------------------------------
  Mora Digital Automations - Frontend script
  - edit WEBHOOK_URL to your n8n webhook endpoint
  - posts form JSON to the webhook
  - stores fallback leads locally
---------------------------------*/

// === Edit this: put your n8n webhook URL here (production URL) ===
const WEBHOOK_URL = "https://REPLACE_WITH_YOUR_N8N_WEBHOOK_URL";
// ===================================================================

const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');

// Mobile menu toggle
const menuBtn = document.getElementById('menuBtn');
const navList = document.getElementById('navList');
menuBtn && menuBtn.addEventListener('click', () => {
  navList.style.display = (navList.style.display === 'flex') ? 'none' : 'flex';
});

// Set year
document.getElementById('year').textContent = new Date().getFullYear();

// Helper to show status
function showStatus(message, color = '#D4A21C') {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.style.color = color;
}

// Validate URL constant
if (!WEBHOOK_URL || !WEBHOOK_URL.startsWith('http')) {
  showStatus('⚠️ Webhook not configured. Edit script.js and set WEBHOOK_URL.', 'crimson');
}

// Submit handler
if (form) {
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    showStatus('Sending…');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const service = document.getElementById('service').value;
    const message = document.getElementById('message').value.trim();

    if (!name || !email) {
      showStatus('Please provide name and email.', 'crimson');
      return;
    }

    const payload = {
      name,
      email,
      phone,
      service,
      message,
      source: 'Mora Website',
      ts: new Date().toISOString()
    };

    // Send to webhook (n8n)
    try {
      if (!WEBHOOK_URL || WEBHOOK_URL.includes('REPLACE_WITH')) {
        throw new Error('Webhook URL not configured.');
      }

      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // fallback local store (so you never lose leads)
      const leads = JSON.parse(localStorage.getItem('mora_leads') || '[]');
      leads.push({ id: Date.now(), ...payload });
      localStorage.setItem('mora_leads', JSON.stringify(leads));

      if (!res.ok) {
        showStatus('Saved locally — server could not be reached. Will retry later.', 'crimson');
        console.warn('Webhook response not OK', res.status);
        return;
      }

      // success
      showStatus('Thanks! Your message was sent. We will contact you soon.', '#9EE493');
      form.reset();

    } catch (err) {
      console.error(err);
      // store locally on error
      const leads = JSON.parse(localStorage.getItem('mora_leads') || '[]');
      leads.push({ id: Date.now(), name, email, phone, service, message, source: 'Mora Website', ts: new Date().toISOString() });
      localStorage.setItem('mora_leads', JSON.stringify(leads));
      showStatus('Saved locally — couldn\'t reach server. Check webhook configuration.', 'crimson');
    }
  });
}
