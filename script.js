// small helpers
const q = (s) => document.querySelector(s);
const qa = (s) => Array.from(document.querySelectorAll(s));

// show year
document.addEventListener('DOMContentLoaded', () => {
  const y = new Date().getFullYear(); q('#year').textContent = y;

  // Intersection reveal animations
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, {threshold: 0.12});

  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

  // Menu toggle for mobile (overlay)
  const menuToggle = q('#menuToggle');
  let menuOpen = false;
  menuToggle.addEventListener('click', () => {
    menuOpen = !menuOpen;
    if (menuOpen) openMobileMenu();
    else closeMobileMenu();
  });

  function openMobileMenu(){
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu';
    overlay.id = 'mobileMenuOverlay';
    overlay.innerHTML = `
      <div class="mobile-menu-inner">
        <a href="#home" onclick="closeMobileMenu()">Home</a>
        <a href="#services" onclick="closeMobileMenu()">Services</a>
        <a href="#how" onclick="closeMobileMenu()">How We Work</a>
        <a href="#pricing" onclick="closeMobileMenu()">Pricing</a>
        <a href="#about" onclick="closeMobileMenu()">Founder</a>
        <a class="cta" href="#contact" onclick="closeMobileMenu()">Book Consultation</a>
      </div>`;
    document.body.appendChild(overlay);
  }

  window.closeMobileMenu = function(){
    menuOpen = false;
    const el = q('#mobileMenuOverlay');
    if (el) el.remove();
  };

  // contact form handling - save to localStorage
  const form = q('#leadForm');
  const status = q('#formStatus');

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const name = q('#name').value.trim();
    const email = q('#email').value.trim();
    const phone = q('#phone').value.trim();
    const message = q('#message').value.trim();

    if (!name || !email) {
      status.textContent = 'Please add name and email.';
      status.style.color = 'crimson';
      return;
    }

    const lead = {
      id: Date.now(),
      name, email, phone, message, source: window.location.href, date: new Date().toISOString()
    };

    // Save locally
    const leads = JSON.parse(localStorage.getItem('mora_leads') || '[]');
    leads.push(lead);
    localStorage.setItem('mora_leads', JSON.stringify(leads));

    // show success
    status.textContent = 'Thanks — we received your request. We will contact you within one business day.';
    status.style.color = 'green';
    form.reset();

    // optional: show small toast
    setTimeout(()=> status.textContent = '', 6500);
  });

  // Admin panel visibility if ?admin=1
  const params = new URLSearchParams(window.location.search);
  if (params.get('admin') === '1') {
    q('#adminPanel').style.display = 'flex';
  }

  // admin buttons
  q('#downloadLeads')?.addEventListener('click', () => {
    const leads = JSON.parse(localStorage.getItem('mora_leads') || '[]');
    if (!leads.length) return alert('No leads to download.');
    const csv = toCSV(leads);
    downloadFile(csv, 'mora-leads.csv', 'text/csv');
  });

  q('#clearLeads')?.addEventListener('click', () => {
    if (!confirm('Clear all locally stored leads?')) return;
    localStorage.removeItem('mora_leads');
    alert('Leads cleared.');
  });

  // small helpers
  function toCSV(arr) {
    const keys = ['id','name','email','phone','message','source','date'];
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

  // ensure nav links smooth scroll
  qa('.nav-link, .cta').forEach(a => {
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

}); // DOMContentLoaded
