/* script.js - Premium behaviors for Mora site
   - mobile overlay menu
   - reveal animations
   - contact form (localStorage) + admin CSV export
   - floating Whatsapp interactions
*/

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // set year
  const yearEls = document.querySelectorAll('#year');
  yearEls.forEach(el => el.textContent = new Date().getFullYear());

  // reveal animations
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, {threshold: 0.18});
  document.querySelectorAll('[data-anim], .card, .section-title').forEach(el => obs.observe(el));

  // mobile overlay menu
  const menuBtn = $('#menuBtn');
  let overlay = null;
  function openMenu(){
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(6,10,18,0.92);z-index:200;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
      <nav style="text-align:center">
        <a href="#home" style="display:block;color:white;font-size:22px;margin:12px 0;text-decoration:none;">Home</a>
        <a href="#services" style="display:block;color:white;font-size:22px;margin:12px 0;text-decoration:none;">Services</a>
        <a href="#how" style="display:block;color:white;font-size:22px;margin:12px 0;text-decoration:none;">How we work</a>
        <a href="#pricing" style="display:block;color:white;font-size:22px;margin:12px 0;text-decoration:none;">Pricing</a>
        <a href="#about" style="display:block;color:white;font-size:22px;margin:12px 0;text-decoration:none;">Founder</a>
        <a href="#contact" style="display:inline-block;background: linear-gradient(90deg, #D4A21C, #ffd77a); color:#072133; padding:12px 18px;border-radius:10px;margin-top:18px;text-decoration:none;display:block;">Book Consultation</a>
      </nav>
    `;
    overlay.addEventListener('click', (ev) => { if (ev.target === overlay) closeMenu(); });
    document.body.appendChild(overlay);
  }
  function closeMenu(){
    if (!overlay) return;
    overlay.remove();
    overlay = null;
  }
  if (menuBtn) menuBtn.addEventListener('click', () => {
    if (overlay) closeMenu(); else openMenu();
  });

  // smooth internal links
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      if (href.startsWith('#')){
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
        closeMenu();
      }
    });
  });

  // contact form handling (localStorage)
  const leadForm = $('#leadForm');
  const formStatus = $('#formStatus');

  if (leadForm){
    leadForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const name = $('#name').value.trim();
      const email = $('#email').value.trim();
      const phone = $('#phone').value.trim();
      const message = $('#message').value.trim();

      if (!name || !email){
        formStatus.textContent = 'Please provide name and email.';
        formStatus.style.color = 'crimson';
        return;
      }

      const lead = { id: Date.now(), name, email, phone, message, page: location.pathname, ts: new Date().toISOString() };
      const existing = JSON.parse(localStorage.getItem('mora_leads') || '[]');
      existing.push(lead);
      localStorage.setItem('mora_leads', JSON.stringify(existing));

      formStatus.textContent = 'Thanks — we received your request. We will contact you within one business day.';
      formStatus.style.color = 'green';
      leadForm.reset();
      setTimeout(()=> { formStatus.textContent = ''; }, 6000);
    });
  }

  // admin panel (CSV download & clear) when ?admin=1
  const params = new URLSearchParams(window.location.search);
  if (params.get('admin') === '1') {
    const panel = $('#adminPanel');
    if (panel) panel.style.display = 'flex';

    $('#downloadLeads')?.addEventListener('click', () => {
      const leads = JSON.parse(localStorage.getItem('mora_leads') || '[]');
      if (!leads.length) return alert('No leads to download.');
      const csv = toCSV(leads);
      downloadFile(csv, 'mora-leads.csv', 'text/csv');
    });
    $('#clearLeads')?.addEventListener('click', () => {
      if (!confirm('Clear all locally stored leads?')) return;
      localStorage.removeItem('mora_leads');
      alert('Leads cleared');
    });
  }

  // helper: CSV + download
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
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=> URL.revokeObjectURL(a.href), 5000);
  }

  // floating WhatsApp tiny hover
  const fab = document.querySelector('.whatsapp-fab');
  if (fab){
    fab.addEventListener('mouseenter', ()=> fab.style.transform = 'translateY(-6px)');
    fab.addEventListener('mouseleave', ()=> fab.style.transform = '');
  }
});
