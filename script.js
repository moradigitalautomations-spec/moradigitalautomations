/* script.js
  - Replace WEBHOOK_URL with your n8n webhook URL
  - Handles mobile menu, animations, form POST to webhook, admin export
*/

const WEBHOOK_URL = "YOUR_N8N_WEBHOOK_URL_HERE"; // <-- paste your n8n webhook URL here (https://...)
const PHONE_WHATSAPP = "918525000808"; // if you want to use locally

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

document.addEventListener('DOMContentLoaded', () => {
  // year
  const y = new Date().getFullYear();
  document.querySelectorAll('#year').forEach(el => el.textContent = y);

  // reveal animation observer
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, {threshold: 0.12});
  document.querySelectorAll('[data-anim]').forEach(el => obs.observe(el));

  // mobile overlay menu
  const openBtn = $('#menuBtn');
  const overlay = $('#mobileOverlay');
  const closeBtn = $('#closeMenu');

  openBtn?.addEventListener('click', () => {
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
  closeBtn?.addEventListener('click', closeMobileMenu);
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeMobileMenu(); });

  function closeMobileMenu(){
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  window.closeMobileMenu = closeMobileMenu;

  // smooth scroll for internal links
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
        closeMobileMenu();
      }
    });
  });

  // form handling → send to n8n webhook
  const form = $('#leadForm');
  const status = $('#formStatus');

  if (form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = '';
      const name = $('#name').value.trim();
      const email = $('#email').value.trim();
      const phone = $('#phone').value.trim();
      const service = $('#service').value;
      const message = $('#message').value.trim();

      if (!name || !email) {
        status.textContent = 'Please provide name and email.';
        status.style.color = 'crimson';
        return;
      }

      const payload = { name, email, phone, service, message, source: 'Mora Website' };

      try {
        // send to webhook (n8n)
        if (!WEBHOOK_URL || WEBHOOK_URL.includes('https://n8n-nypw.onrender.com/webhook/mora-lead')) {
          throw new Error('Webhook URL not configured. Edit script.js and add your webhook URL.');
        }

        const res = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        // store locally as fallback (optional)
        const leads = JSON.parse(localStorage.getItem('mora_leads') || '[]');
        leads.push({ id: Date.now(), ...payload, ts: new Date().toISOString() });
        localStorage.setItem('mora_leads', JSON.stringify(leads));

        if (!res.ok) {
          status.textContent = 'Saved locally — couldn\'t reach server. I will retry later.';
          status.style.color = 'crimson';
        } else {
          status.textContent = 'Thanks — we received your request. We will contact you soon.';
          status.style.color = 'green';
        }
        form.reset();
        setTimeout(()=> status.textContent = '', 6000);
      } catch (err) {
        console.error(err);
        status.textContent = 'Error sending. Your lead is saved locally.';
        status.style.color = 'crimson';
      }
    });
  }

  // admin controls (visible when URL contains ?admin=1)
  const params = new URLSearchParams(window.location.search);
  if (params.get('admin') === '1') {
    const panel = $('#adminPanel'); if (panel) panel.style.display = 'flex';
    $('#downloadLeads')?.addEventListener('click', () => {
      const leads = JSON.parse(localStorage.getItem('mora_leads') || '[]');
      if (!leads.length) return alert('No leads');
      const csv = toCSV(leads);
      downloadFile(csv, 'mora-leads.csv', 'text/csv');
    });
    $('#clearLeads')?.addEventListener('click', () => {
      if (!confirm('Clear stored leads?')) return;
      localStorage.removeItem('mora_leads');
      alert('Cleared');
    });
  }

  // WhatsApp FAB micro-interaction
  const fab = document.querySelector('.whatsapp-fab');
  if (fab) {
    fab.addEventListener('mouseenter', ()=> fab.style.transform = 'translateY(-6px)');
    fab.addEventListener('mouseleave', ()=> fab.style.transform = '');
  }

  // small helpers
  function toCSV(arr){
    const keys = ['id','name','email','phone','service','message','ts'];
    const lines = [keys.join(',')];
    arr.forEach(o => {
      const row = keys.map(k => `"${String(o[k] || '').replace(/"/g,'""')}"`).join(',');
      lines.push(row);
    });
    return lines.join('\n');
  }
  function downloadFile(content, name, type){
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], {type}));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=> URL.revokeObjectURL(a.href), 5000);
  }
});
