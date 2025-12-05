// small helpers for interaction
document.getElementById('year').textContent = new Date().getFullYear();

// mobile menu toggle
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');
menuBtn && menuBtn.addEventListener('click', () => {
  const links = Array.from(nav.querySelectorAll('a'));
  links.forEach(a => a.style.display = (a.style.display === 'block') ? '' : 'block');
});

// simple form handling (uses mailto fallback)
function submitForm(e){
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const message = document.getElementById('message').value.trim();
  const status = document.getElementById('formStatus');

  // very light validation
  if(!name || !email || !message){ status.textContent = 'Please fill required fields.'; return false; }

  // Option A — mailto fallback (instant)
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`);
  window.location.href = `mailto:moradigitalautomations@gmail.com?subject=Website%20Contact%20from%20${encodeURIComponent(name)}&body=${body}`;

  status.textContent = 'Opening your mail app to send message...';
  return false;
}
