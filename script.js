/* script.js - front-end behavior for Mora site
   - mobile overlay menu
   - reveal animations
   - contact form localStorage + admin CSV export
   - floating WhatsApp microinteraction
*/

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

document.addEventListener('DOMContentLoaded', () => {
  // set year
  const yEls = document.querySelectorAll('#year');
  yEls.forEach(el => el.textContent = new Date().getFullYear());

  // reveal animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        observer.unobserve(en.target);
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll('[data-anim]').forEach(el => observer.observe(el));

  // MOBILE OVERLAY MENU
  const openBtn = $('#openMenu');
  const closeBtn = $('#closeMenu');
  const overlay = $('#mobileOverlay');

  function openOverlay(){
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeOverlay(){
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openBtn?.addEventListener('click', openOverlay);
  closeBtn?.addEventListener('click', closeOverlay);
  // close when clicking outside inner
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
  });

  // Smooth internal links
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (ev) => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        ev.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
        closeOverlay();
      }
    });
  });

  // Contact form (save leads locally)
  const leadForm = $('#leadForm');
  const status = $('#formStatus');

  if (leadForm){
    leadForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const name = $('#name').value.trim();
      const email = $('#email').value.trim();
      const phone = $('#phone').value.trim();
      const message = $('#message').value.trim();

      if (!name || !email) {
        status.textContent = 'Please enter name and email.';
        status.style.color = 'crimson';
        return;
      }

      const lead = { id: Date.now(), name, email, phone, message, page: location.pathname, ts: new Date().toISOString() };
      const leads = JSON.parse(localStorage.getItem('mora_leads') || '[]');
      leads.push(lead);
      localStorage.setItem('mora_leads', JSON.stringify(leads));

      status.textContent = 'Thanks — we received your request. We will contact you soon.';
      status.style.color = 'green';
      leadForm.reset();
      setTimeout(()=> status.textContent = '', 6000);
    });
  }

  // Admin tools when ?admin=1
  const params = new URLSearchParams(window.location.search);
  if (params.get('admin') === '1'){
    const panel = $('#adminPanel');
    if (panel) panel.style.display = 'flex';
    $('#downloadLeads')?.addEventListener('click', () => {
      const leads = JSON.parse(localStorage.getItem('mora_leads') || '[]');
      if (!leads.length) return alert('No leads to download.');
      const csv = toCSV(leads);
      downloadFile(csv, 'mora-leads.csv', 'text/csv');
    });
    $('#clearLeads')?.addEventListener('click', () => {
      if (!confirm('Clear stored leads?')) return;
      localStorage.removeItem('mora_leads');
      alert('Leads cleared.');
    });
  }

  // FAB micro interaction
  const fab = document.querySelector('.whatsapp-fab');
  if (fab) {
    fab.addEventListener('mouseenter', () => fab.style.transform = 'translateY(-6px)');
    fab.addEventListener('mouseleave', () => fab.style.transform = '');
  }

  // helpers
  function toCSV(arr){
    const keys = ['id','name','email','phone','message','page','ts'];
    const lines = [keys.join(',')];
    arr.forEach(o => {
      const row = keys.map(k => `"${String(o[k] || '').replace(/"/g,'""')}"`).join(',');
      lines.push(row);
    });
    return lines.join('\n');
  }
  function downloadFile(content, filename, type){
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], {type}));
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=> URL.revokeObjectURL(a.href), 5000);
  }
});
