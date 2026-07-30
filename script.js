document.getElementById('year').textContent = new Date().getFullYear();

// Süti-hozzájárulás + Google Analytics 4 — a mérés csak elfogadás után indul el
const GA_MEASUREMENT_ID = 'G-BDTPJ7N1BB';
const CONSENT_KEY = 'esafety_cookie_consent'; // 'accepted' | 'declined'

function loadGoogleAnalytics() {
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
}

const cookieBanner = document.getElementById('cookieBanner');
const cookieAccept = document.getElementById('cookieAccept');
const cookieDecline = document.getElementById('cookieDecline');
const storedConsent = localStorage.getItem(CONSENT_KEY);

if (storedConsent === 'accepted') {
  loadGoogleAnalytics();
} else if (storedConsent !== 'declined') {
  cookieBanner.hidden = false;
}

cookieAccept.addEventListener('click', () => {
  localStorage.setItem(CONSENT_KEY, 'accepted');
  cookieBanner.hidden = true;
  loadGoogleAnalytics();
});

cookieDecline.addEventListener('click', () => {
  localStorage.setItem(CONSENT_KEY, 'declined');
  cookieBanner.hidden = true;
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Client showcase: auto-rotating crossfade between client slides, pausable on hover, manually navigable via dots/arrows
const clientShowcase = document.getElementById('clientShowcase');
if (clientShowcase) {
  const slides = clientShowcase.querySelectorAll('.client-slide');
  const dots = clientShowcase.querySelectorAll('.client-dot');
  const prevBtn = clientShowcase.querySelector('.client-nav-prev');
  const nextBtn = clientShowcase.querySelector('.client-nav-next');
  let activeIndex = 0;
  let showcaseTimer = null;

  function goToSlide(index) {
    slides[activeIndex].classList.remove('is-active');
    dots[activeIndex].classList.remove('is-active');
    activeIndex = index;
    slides[activeIndex].classList.add('is-active');
    dots[activeIndex].classList.add('is-active');
  }

  function startShowcaseTimer() {
    showcaseTimer = setInterval(() => {
      goToSlide((activeIndex + 1) % slides.length);
    }, 3000);
  }

  function stopShowcaseTimer() {
    clearInterval(showcaseTimer);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });

  prevBtn.addEventListener('click', () => {
    goToSlide((activeIndex - 1 + slides.length) % slides.length);
  });

  nextBtn.addEventListener('click', () => {
    goToSlide((activeIndex + 1) % slides.length);
  });

  clientShowcase.addEventListener('mouseenter', stopShowcaseTimer);
  clientShowcase.addEventListener('mouseleave', startShowcaseTimer);

  startShowcaseTimer();
}

// Module picker: live count + carries selection into the contact form
const modulePicker = document.getElementById('modulePicker');
const moduleCheckboxes = modulePicker.querySelectorAll('input[name="modules"]');
const moduleCount = document.getElementById('moduleCount');
const moduleCta = document.getElementById('moduleCta');
const selectedModules = document.getElementById('selectedModules');
const selectedModulesChips = document.getElementById('selectedModulesChips');
const selectedModulesField = document.getElementById('selectedModulesField');
const messageField = document.getElementById('message');

function getSelectedModules() {
  return Array.from(moduleCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
}

function updateModuleSelection() {
  const selected = getSelectedModules();

  moduleCount.textContent = selected.length === 0
    ? '0 extra modul kiválasztva'
    : `${selected.length} extra modul kiválasztva`;

  moduleCta.textContent = selected.length === 0
    ? 'Ajánlatot kérek'
    : 'Ajánlatot kérek a kiválasztottakra';

  if (selected.length > 0) {
    selectedModules.hidden = false;
    selectedModulesChips.innerHTML = selected.map(name => `<span class="module-chip">${name}</span>`).join('');
    selectedModulesField.value = selected.join(', ');
  } else {
    selectedModules.hidden = true;
    selectedModulesChips.innerHTML = '';
    selectedModulesField.value = '';
  }
}

moduleCheckboxes.forEach(cb => cb.addEventListener('change', updateModuleSelection));
updateModuleSelection();

moduleCta.addEventListener('click', () => {
  const selected = getSelectedModules();
  if (selected.length > 0 && !messageField.value.trim()) {
    messageField.value = `Az alapcsomag mellett érdeklődöm az alábbi extra modulokra: ${selected.join(', ')}.`;
  }
});

// Contact form submission (Formspree-compatible AJAX submit)
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = contactForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  formNote.textContent = 'Küldés...';
  formNote.className = 'form-note';

  try {
    const response = await fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      formNote.textContent = 'Köszönjük! Hamarosan felvesszük Önnel a kapcsolatot.';
      formNote.className = 'form-note success';
      contactForm.reset();
    } else {
      throw new Error('Submit failed');
    }
  } catch (err) {
    formNote.textContent = 'Hiba történt a küldés során. Kérjük, próbálja újra, vagy írjon emailt közvetlenül.';
    formNote.className = 'form-note error';
  } finally {
    submitButton.disabled = false;
  }
});
