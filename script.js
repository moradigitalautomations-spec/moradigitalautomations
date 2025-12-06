import { GoogleGenAI } from "@google/genai";

// Initialize Icons
lucide.createIcons();

/**
 * ------------------------------------------------------------------
 * CONFIGURATION
 * ------------------------------------------------------------------
 */
const WEBHOOK_URL = 'https://hook.eu1.n8n.cloud/webhook-test/mora-contact-form';

// NOTE: In a real production build, use process.env.API_KEY.
// For this environment, we assume the bundling/serving mechanism handles it, 
// or we fallback gracefully.
const API_KEY = process.env.API_KEY; 

/**
 * ------------------------------------------------------------------
 * UI INTERACTION LOGIC
 * ------------------------------------------------------------------
 */

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
  // Re-render icons inside the menu if needed
  lucide.createIcons();
});

// Close mobile menu when a link is clicked
document.querySelectorAll('#mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
  });
});

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('shadow-md', 'bg-white/95');
    navbar.classList.remove('bg-white/80');
  } else {
    navbar.classList.remove('shadow-md', 'bg-white/95');
    navbar.classList.add('bg-white/80');
  }
});

/**
 * ------------------------------------------------------------------
 * CONTACT FORM (WEBHOOK) LOGIC
 * ------------------------------------------------------------------
 */
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const formSuccess = document.getElementById('form-success');
const formError = document.getElementById('form-error');
const resetBtn = document.getElementById('reset-form-btn');

const originalBtnContent = submitBtn.innerHTML;

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get values
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const business = document.getElementById('business').value;
  const interest = document.getElementById('interest').value;

  // Set Loading State
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>
    <span>Sending...</span>
  `;
  lucide.createIcons();
  formError.classList.add('hidden');

  const payload = {
    name,
    phone,
    business,
    interest,
    source: 'Mora Website (Vanilla)',
    submittedAt: new Date().toISOString()
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Artifical delay for premium feel
    await new Promise(r => setTimeout(r, 800));

    if (response.ok || response.status === 200) {
      // Success
      contactForm.classList.add('hidden');
      formSuccess.classList.remove('hidden');
      // Reset form
      contactForm.reset();
    } else {
      throw new Error('Network response was not ok');
    }
  } catch (error) {
    console.error('Submission Error:', error);
    formError.classList.remove('hidden');
  } finally {
    // Reset Button State
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnContent;
    lucide.createIcons();
  }
});

resetBtn.addEventListener('click', () => {
  formSuccess.classList.add('hidden');
  contactForm.classList.remove('hidden');
});


/**
 * ------------------------------------------------------------------
 * AI DEMO (GEMINI) LOGIC
 * ------------------------------------------------------------------
 */
const aiForm = document.getElementById('ai-form');
const aiInput = document.getElementById('ai-input');
const aiPlaceholder = document.getElementById('ai-placeholder');
const aiLoader = document.getElementById('ai-loader');
const aiContent = document.getElementById('ai-content');

const SYSTEM_INSTRUCTION = `
You are the AI Business Consultant for "Mora Digital Automations", a company based in Puducherry led by Mohanarangan.
Your goal is to explain how digital automation helps local shops, restaurants, and small businesses save time and money.

Key Services:
- WhatsApp Automation: Auto-replies, menus, order confirmations.
- N8N Workflows: Connecting POS to Sheets, automating inventory updates.
- CRM Setup: Managing customer leads.
- Dropshipping Automation: Streamlining orders.

Tone: Professional, "Tech-Trust", encouraging, and simple to understand for non-technical business owners.
Always suggest they contact Mora Digital Automations for a consultation.
Keep answers concise (under 100 words).
`;

if (API_KEY) {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  aiForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = aiInput.value.trim();
    if (!query) return;

    // UI Updates
    aiPlaceholder.classList.add('hidden');
    aiContent.classList.add('hidden');
    aiLoader.classList.remove('hidden');
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        }
      });

      const text = response.text || "I'm currently updating my knowledge base. Please contact us on WhatsApp!";
      
      aiContent.innerText = text;
      aiContent.classList.remove('hidden');
    } catch (error) {
      console.error("AI Error:", error);
      aiContent.innerText = "I'm having trouble connecting right now. Please try again later or chat with us on WhatsApp.";
      aiContent.classList.remove('hidden');
    } finally {
      aiLoader.classList.add('hidden');
    }
  });
} else {
  console.warn("API_KEY not found. AI features disabled.");
  aiInput.disabled = true;
  aiInput.placeholder = "AI Service currently unavailable (Missing API Key)";
}
