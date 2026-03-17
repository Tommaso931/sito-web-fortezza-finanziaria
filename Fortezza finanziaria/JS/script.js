/**
 * FORTEZZA FINANZIARIA — script.js
 * Fase 1: Navbar scroll + Mobile menu
 * ============================================================
 */

'use strict';

/* ============================================================
   1. UTILITY
   ============================================================ */

/**
 * Debounce — limita la frequenza di chiamata di una funzione.
 * Usato per l'evento resize.
 */
function debounce(fn, delay = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}


/* ============================================================
   2. NAVBAR — SCROLL BEHAVIOUR
   Aggiunge la classe `.is-scrolled` alla navbar quando
   l'utente scorre oltre 20px dall'alto.
   ============================================================ */

(function initScrollBehaviour() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 20;

  function updateNavbarState() {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    navbar.classList.toggle('is-scrolled', scrolled);
  }

  // Esecuzione immediata (in caso di refresh con pagina già scrollata)
  updateNavbarState();

  // Listener passivo per le performance
  window.addEventListener('scroll', updateNavbarState, { passive: true });
})();


/* ============================================================
   3. ACTIVE LINK — Aggiorna il link attivo in base alla sezione
   visibile usando IntersectionObserver.
   ============================================================ */

(function initActiveLinks() {
  const navLinks = document.querySelectorAll('.navbar__link');
  if (!navLinks.length) return;

  // Mappa href → elemento link
  const linkMap = new Map();
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href?.startsWith('#')) {
      linkMap.set(href.slice(1), link);
    }
  });

  const sections = document.querySelectorAll('main [id]');
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Rimuove active da tutti
          linkMap.forEach(link => link.classList.remove('is-active'));
          // Aggiunge active al link corrispondente
          const active = linkMap.get(entry.target.id);
          if (active) active.classList.add('is-active');
        }
      });
    },
    {
      rootMargin: '-30% 0px -60% 0px', // si attiva quando la sezione è circa al centro
      threshold: 0,
    }
  );

  sections.forEach(section => observer.observe(section));
})();


/* ============================================================
   4. MOBILE MENU — Toggle apertura/chiusura drawer
   ============================================================ */

(function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  /** Apre il menu mobile */
  function openMenu() {
    isOpen = true;
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.removeAttribute('hidden');
    document.body.style.overflow = 'hidden'; // blocca scroll sottostante
  }

  /** Chiude il menu mobile */
  function closeMenu() {
    isOpen = false;
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  /** Toggle */
  function toggleMenu() {
    isOpen ? closeMenu() : openMenu();
  }

  // Click hamburger
  hamburger.addEventListener('click', toggleMenu);

  // Click su link nel drawer (attributo data-close)
  mobileMenu.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', closeMenu);
  });

  // Tasto Escape chiude il menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
      hamburger.focus(); // riporta il focus all'hamburger per l'accessibilità
    }
  });

  // Chiude il menu al resize se si torna su viewport desktop
  const onResize = debounce(() => {
    if (window.innerWidth > 768 && isOpen) {
      closeMenu();
    }
  }, 200);

  window.addEventListener('resize', onResize);
})();


/* ============================================================
   5. SMOOTH SCROLL — Intercetta i link ancora (#)
   e scrolla fluido tenendo conto dell'altezza navbar.
   ============================================================ */

(function initSmoothScroll() {
  const NAV_HEIGHT = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '72',
    10
  );

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const targetTop = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT - 8;

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth',
      });
    });
  });
})();


/* ============================================================
   6. LOG di avvio (solo development)
   ============================================================ */
console.log(
  '%c🛡 Fortezza Finanziaria%c — sistema avviato',
  'color:#d4a843;font-weight:700;font-size:14px;',
  'color:#9a9080;font-size:12px;'
);
/* ============================================================
   FASE 2 — HERO SECTION
   ============================================================ */

/* ============================================================
   7. REVEAL ANIMATION — IntersectionObserver per [data-reveal]
   Aggiunge la classe `.is-visible` quando l'elemento entra
   nel viewport, triggherando la transizione CSS.
   ============================================================ */

(function initRevealObserver() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // one-shot
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach(el => observer.observe(el));
})();


/* ============================================================
   8. ANIMATED COUNTER — hero__proof-num
   Conta da 0 al valore target con easing.
   Modifica il valore target per riflettere i tuoi lettori reali.
   ============================================================ */

(function initReaderCounter() {
  const el = document.getElementById('readerCount');
  if (!el) return;

  const TARGET  = 1247;   // ← cambia con il numero reale di lettori
  const DURATION = 2000;  // ms
  let startTime = null;
  let started   = false;

  // Easing: easeOutExpo
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function formatNum(n) {
    return n.toLocaleString('it-IT');
  }

  function tick(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed  = timestamp - startTime;
    const progress = Math.min(elapsed / DURATION, 1);
    const eased    = easeOutExpo(progress);
    const current  = Math.round(eased * TARGET);

    el.textContent = formatNum(current);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = formatNum(TARGET);
    }
  }

  // Avvia solo quando l'elemento diventa visibile
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started) {
          started = true;
          // Piccolo delay dopo che il testo hero è rivelato
          setTimeout(() => requestAnimationFrame(tick), 800);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(el);
})();


/* ============================================================
   9. BOOK PARALLAX — Il libro segue leggermente il mouse
   per dare tridimensionalità alla scena.
   ============================================================ */

(function initBookParallax() {
  const book = document.querySelector('.hero__book');
  if (!book) return;

  // Disabilita su touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const BASE_ROTATE_Y = -28;
  const BASE_ROTATE_X = 4;
  const INTENSITY_X   = 12; // gradi di variazione orizzontale
  const INTENSITY_Y   = 6;  // gradi di variazione verticale

  let raf = null;
  let targetRY = BASE_ROTATE_Y;
  let targetRX = BASE_ROTATE_X;
  let currentRY = BASE_ROTATE_Y;
  let currentRX = BASE_ROTATE_X;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animate() {
    currentRY = lerp(currentRY, targetRY, 0.08);
    currentRX = lerp(currentRX, targetRX, 0.08);
    book.style.transform =
      `perspective(900px) rotateY(${currentRY}deg) rotateX(${currentRX}deg)`;
    raf = requestAnimationFrame(animate);
  }

  function onMouseMove(e) {
    const { innerWidth: W, innerHeight: H } = window;
    // Normalizza da -1 a +1
    const nx = (e.clientX / W) * 2 - 1;
    const ny = (e.clientY / H) * 2 - 1;

    targetRY = BASE_ROTATE_Y + nx * INTENSITY_X;
    targetRX = BASE_ROTATE_X - ny * INTENSITY_Y;
  }

  function onMouseLeave() {
    // Reset alla posizione base
    targetRY = BASE_ROTATE_Y;
    targetRX = BASE_ROTATE_X;
  }

  // Avvia il loop di animazione
  animate();

  document.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave);
})();
/* ============================================================
   FASE 3 — MODULO DI ATTIVAZIONE
   ============================================================ */

(function initActivationForm() {

  /* ──────────────────────────────────────────────
     CONFIGURAZIONE
     ──────────────────────────────────────────────
     Aggiungi qui tutti i codici validi.
     In produzione considera di validare server-side.
     Il formato atteso è: FF-XXXX-XXXX (maiuscolo)
  ────────────────────────────────────────────── */
  const VALID_CODES = new Set([
    'FF-2024-VOL1',   // Codice principale Vol. 1
    'FF-DEMO-TEST',   // Codice demo per test
    'FF-KU01-READ',   // Codice Kindle Unlimited batch 1
    'FF-KU02-READ',   // Codice Kindle Unlimited batch 2
    'FF-GIFT-2024',   // Codice copia omaggio
  ]);

  /* Pattern formato codice: FF-XXXX-XXXX */
  const CODE_PATTERN = /^FF-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

  /* Simulated network delay (ms) — rimuovi in produzione */
  const FAKE_DELAY = 1400;


  /* ──────────────────────────────────────────────
     DOM REFS
  ────────────────────────────────────────────── */
  const stepRegister = document.getElementById('stepRegister');
  const stepSuccess  = document.getElementById('stepSuccess');
  const btnActivate  = document.getElementById('btnActivate');
  const btnReset     = document.getElementById('btnReset');
  const successName  = document.getElementById('successName');

  const fieldName    = document.getElementById('fieldName');
  const fieldEmail   = document.getElementById('fieldEmail');
  const fieldCode    = document.getElementById('fieldCode');
  const fieldPrivacy = document.getElementById('fieldPrivacy');

  const errorName    = document.getElementById('errorName');
  const errorEmail   = document.getElementById('errorEmail');
  const errorCode    = document.getElementById('errorCode');
  const errorPrivacy = document.getElementById('errorPrivacy');
  const codeStatus   = document.getElementById('codeStatus');

  const lockSvg      = document.querySelector('.activate__lock-svg');
  const lockIcon     = document.querySelector('.activate__icon');

  if (!btnActivate) return; // Guard: la sezione non è presente


  /* ──────────────────────────────────────────────
     UTILITÀ
  ────────────────────────────────────────────── */

  /** Normalizza il codice: rimuove spazi, mette in maiuscolo */
  function normalizeCode(raw) {
    return raw.trim().toUpperCase().replace(/\s+/g, '');
  }

  /** Verifica sintassi email con regex base */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  }

  /** Imposta stato visivo su un campo */
  function setFieldState(input, errorEl, state, message = '') {
    input.classList.remove('is-valid', 'is-error');
    if (state === 'valid')   input.classList.add('is-valid');
    if (state === 'error')   input.classList.add('is-error');
    errorEl.textContent = message;
  }

  /** Mostra il pulsante submit in stato loading */
  function setLoading(on) {
    btnActivate.classList.toggle('is-loading', on);
    btnActivate.disabled = on;
  }


  /* ──────────────────────────────────────────────
     AUTO-FORMATTAZIONE CODICE
     Aggiunge i trattini automaticamente mentre l'utente digita
  ────────────────────────────────────────────── */
  fieldCode.addEventListener('input', () => {
    let raw = fieldCode.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    // Inserisce i trattini nelle posizioni corrette: FF-XXXX-XXXX
    let formatted = '';
    if (raw.length > 0) formatted  = raw.substring(0, Math.min(2, raw.length));
    if (raw.length > 2) formatted += '-' + raw.substring(2, Math.min(6, raw.length));
    if (raw.length > 6) formatted += '-' + raw.substring(6, Math.min(10, raw.length));

    fieldCode.value = formatted;

    // Feedback visivo sul formato
    const normalized = normalizeCode(formatted);
    if (normalized.length === 0) {
      codeStatus.textContent = '';
      setFieldState(fieldCode, errorCode, null);
    } else if (CODE_PATTERN.test(normalized)) {
      codeStatus.textContent = '✓';
      codeStatus.style.color = 'var(--emerald)';
      setFieldState(fieldCode, errorCode, 'valid');
    } else {
      codeStatus.textContent = '';
      codeStatus.style.color = '';
      setFieldState(fieldCode, errorCode, null);
    }
  });

  /* Normalizza al blur (nel caso l'utente incolli un codice) */
  fieldCode.addEventListener('blur', () => {
    if (fieldCode.value) {
      const normalized = normalizeCode(fieldCode.value);
      fieldCode.value = normalized;
    }
  });


  /* ──────────────────────────────────────────────
     VALIDAZIONE — singoli campi al blur
  ────────────────────────────────────────────── */

  fieldName.addEventListener('blur', () => {
    const val = fieldName.value.trim();
    if (!val) {
      setFieldState(fieldName, errorName, 'error', 'Inserisci il tuo nome');
    } else if (val.length < 2) {
      setFieldState(fieldName, errorName, 'error', 'Il nome è troppo corto');
    } else {
      setFieldState(fieldName, errorName, 'valid');
    }
  });

  fieldEmail.addEventListener('blur', () => {
    const val = fieldEmail.value.trim();
    if (!val) {
      setFieldState(fieldEmail, errorEmail, 'error', 'Inserisci la tua email');
    } else if (!isValidEmail(val)) {
      setFieldState(fieldEmail, errorEmail, 'error', 'Email non valida');
    } else {
      setFieldState(fieldEmail, errorEmail, 'valid');
    }
  });


  /* ──────────────────────────────────────────────
     VALIDAZIONE COMPLETA — al click submit
  ────────────────────────────────────────────── */

  function validateAll() {
    let isValid = true;

    // Nome
    const name = fieldName.value.trim();
    if (!name || name.length < 2) {
      setFieldState(fieldName, errorName, 'error',
        name ? 'Il nome è troppo corto' : 'Inserisci il tuo nome');
      isValid = false;
    } else {
      setFieldState(fieldName, errorName, 'valid');
    }

    // Email
    const email = fieldEmail.value.trim();
    if (!email) {
      setFieldState(fieldEmail, errorEmail, 'error', 'Inserisci la tua email');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setFieldState(fieldEmail, errorEmail, 'error', 'Email non valida');
      isValid = false;
    } else {
      setFieldState(fieldEmail, errorEmail, 'valid');
    }

    // Codice
    const code = normalizeCode(fieldCode.value);
    if (!code) {
      setFieldState(fieldCode, errorCode, 'error', 'Inserisci il codice di attivazione');
      isValid = false;
    } else if (!CODE_PATTERN.test(code)) {
      setFieldState(fieldCode, errorCode, 'error', 'Formato non valido — usa FF-XXXX-XXXX');
      isValid = false;
    }
    // Nota: la validità del codice viene verificata server-side (o nel Set) dopo il delay

    // Privacy
    if (!fieldPrivacy.checked) {
      errorPrivacy.textContent = 'Devi accettare la Privacy Policy per continuare';
      isValid = false;
    } else {
      errorPrivacy.textContent = '';
    }

    return isValid;
  }


  /* ──────────────────────────────────────────────
     SUBMIT HANDLER
  ────────────────────────────────────────────── */

  btnActivate.addEventListener('click', async () => {

    if (!validateAll()) {
      // Scrolla al primo errore
      const firstError = document.querySelector('.activate__input.is-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    const code  = normalizeCode(fieldCode.value);
    const name  = fieldName.value.trim();

    // Avvia loading
    setLoading(true);

    // Simula una chiamata di rete (sostituisci con fetch reale in produzione)
    await new Promise(resolve => setTimeout(resolve, FAKE_DELAY));

    // Verifica il codice
    if (!VALID_CODES.has(code)) {
      setLoading(false);
      setFieldState(fieldCode, errorCode, 'error',
        'Codice non riconosciuto. Controlla l\'ultima pagina del libro.');
      fieldCode.focus();
      return;
    }

    // ── SUCCESSO ──
    setLoading(false);
    showSuccess(name, code);
  });


  /* ──────────────────────────────────────────────
     MOSTRA SCHERMATA SUCCESSO
  ────────────────────────────────────────────── */

  function showSuccess(name, code) {
    // Imposta nome nella schermata successo
    if (successName) successName.textContent = name.split(' ')[0]; // solo first name

    // Animazione lucchetto → aperto + verde
    if (lockIcon) lockIcon.classList.add('is-unlocked');

    // Salva in sessionStorage (non localStorage — per privacy)
    try {
      sessionStorage.setItem('ff_activated', JSON.stringify({
        name,
        code,
        ts: Date.now()
      }));
    } catch (_) { /* storage non disponibile, non bloccante */ }

    // Nasconde il form, mostra il successo
    stepRegister.style.animation = 'successFadeIn 0.3s ease reverse both';
    setTimeout(() => {
      stepRegister.setAttribute('hidden', '');
      stepSuccess.removeAttribute('hidden');
      stepSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 280);
  }


  /* ──────────────────────────────────────────────
     RESET — torna al form
  ────────────────────────────────────────────── */

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      // Reset campi
      fieldName.value    = '';
      fieldEmail.value   = '';
      fieldCode.value    = '';
      fieldPrivacy.checked = false;
      codeStatus.textContent = '';

      // Reset stati
      [fieldName, fieldEmail, fieldCode].forEach(el => {
        el.classList.remove('is-valid', 'is-error');
      });
      [errorName, errorEmail, errorCode, errorPrivacy].forEach(el => {
        el.textContent = '';
      });

      // Reset lucchetto
      if (lockIcon) lockIcon.classList.remove('is-unlocked');

      // Mostra form, nasconde successo
      stepSuccess.setAttribute('hidden', '');
      stepRegister.removeAttribute('hidden');
      stepRegister.style.animation = '';

      // Scroll al form
      stepRegister.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }


  /* ──────────────────────────────────────────────
     AUTO-RIPRISTINO — se sessione già attivata
     (utente torna alla pagina nello stesso tab)
  ────────────────────────────────────────────── */

  try {
    const saved = sessionStorage.getItem('ff_activated');
    if (saved) {
      const data = JSON.parse(saved);
      // Valida che la sessione non abbia più di 8 ore
      if (Date.now() - data.ts < 8 * 60 * 60 * 1000) {
        showSuccess(data.name, data.code);
      } else {
        sessionStorage.removeItem('ff_activated');
      }
    }
  } catch (_) { /* silently ignore */ }

})(); // fine initActivationForm
/* ============================================================
   FASE 4 — CAROUSEL LIBRI
   ============================================================ */

(function initBooksCarousel() {

  const track      = document.getElementById('booksTrack');
  const prevBtn    = document.getElementById('booksPrev');
  const nextBtn    = document.getElementById('booksNext');
  const dotsWrap   = document.getElementById('booksDots');
  const counterEl  = document.getElementById('booksCurrentNum');
  const toast      = document.getElementById('booksToast');
  const toastMsg   = document.getElementById('booksToastMsg');

  if (!track) return;

  const cards      = Array.from(track.querySelectorAll('.books__card'));
  const dots       = Array.from(dotsWrap?.querySelectorAll('.books__dot') || []);
  const TOTAL      = cards.length;
  let   current    = 0;
  let   toastTimer = null;

  /* ── NAVIGAZIONE ── */

  function goTo(index) {
    current = Math.max(0, Math.min(index, TOTAL - 1));

    // Trasla il track
    const cardWidth = track.parentElement.offsetWidth;
    track.style.transform = `translateX(-${current * (cardWidth + 24)}px)`;

    // Aggiorna dots
    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle('books__dot--active', active);
      dot.setAttribute('aria-selected', String(active));
    });

    // Aggiorna frecce
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === TOTAL - 1;

    // Aggiorna contatore
    if (counterEl) counterEl.textContent = String(current + 1).padStart(2, '0');
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  dots.forEach(dot => {
    dot.addEventListener('click', () => goTo(Number(dot.dataset.index)));
  });

  // Inizializzazione
  goTo(0);

  /* ── DRAG / SWIPE ── */

  let startX = 0;
  let isDragging = false;
  let dragDelta  = 0;

  function dragStart(x) {
    startX = x;
    isDragging = true;
    dragDelta = 0;
    track.classList.add('is-dragging');
  }

  function dragMove(x) {
    if (!isDragging) return;
    dragDelta = x - startX;
  }

  function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('is-dragging');
    const THRESHOLD = 60;
    if (dragDelta < -THRESHOLD && current < TOTAL - 1) goTo(current + 1);
    else if (dragDelta > THRESHOLD && current > 0) goTo(current - 1);
    else goTo(current); // snap back
  }

  // Mouse
  track.addEventListener('mousedown',  e => dragStart(e.clientX));
  window.addEventListener('mousemove', e => dragMove(e.clientX));
  window.addEventListener('mouseup',   dragEnd);

  // Touch
  track.addEventListener('touchstart', e => dragStart(e.touches[0].clientX), { passive: true });
  track.addEventListener('touchmove',  e => dragMove(e.touches[0].clientX),  { passive: true });
  track.addEventListener('touchend',   dragEnd);

  // Ricalcola posizione al resize
  const onResize = debounce(() => goTo(current), 200);
  window.addEventListener('resize', onResize);

  /* ── TASTI FRECCIA TASTIERA ── */
  document.addEventListener('keydown', e => {
    if (!document.getElementById('libri')?.contains(document.activeElement)) return;
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft')  goTo(current - 1);
  });

  /* ── PULSANTI "NOTIFICAMI" ── */

  function showToast(msg) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.removeAttribute('hidden');
    // Forza reflow per animazione
    void toast.offsetWidth;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => toast.setAttribute('hidden', ''), 350);
    }, 3500);
  }

  document.querySelectorAll('.books__cta-notify').forEach(btn => {
    btn.addEventListener('click', function () {
      if (this.classList.contains('is-subscribed')) return;

      const vol = this.dataset.vol;
      this.classList.add('is-subscribed');
      this.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 7L9 18L4 13" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Iscritto!
      `;

      // Salva preferenza
      try {
        const subs = JSON.parse(sessionStorage.getItem('ff_notify') || '[]');
        if (!subs.includes(vol)) {
          subs.push(vol);
          sessionStorage.setItem('ff_notify', JSON.stringify(subs));
        }
      } catch (_) {}

      showToast(`Ti avviseremo all'uscita del Volume ${vol} 🛡`);
    });
  });

  // Ripristina iscrizioni dalla sessione
  try {
    const subs = JSON.parse(sessionStorage.getItem('ff_notify') || '[]');
    subs.forEach(vol => {
      const btn = document.querySelector(`.books__cta-notify[data-vol="${vol}"]`);
      if (btn) {
        btn.classList.add('is-subscribed');
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 7L9 18L4 13" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Iscritto!
        `;
      }
    });
  } catch (_) {}

})();
/* ============================================================
   FASE 5 — CAROUSEL RECENSIONI
   ============================================================ */

(function initReviewsCarousel() {

  const track    = document.getElementById('reviewsTrack');
  const prevBtn  = document.getElementById('reviewsPrev');
  const nextBtn  = document.getElementById('reviewsNext');
  const dotsWrap = document.getElementById('reviewsDots');

  if (!track) return;

  const cards  = Array.from(track.querySelectorAll('.reviews__card'));
  const dots   = Array.from(dotsWrap?.querySelectorAll('.reviews__dot') || []);
  const TOTAL  = cards.length;
  let current  = 0;

  /* ── Auto-play ogni 6s ── */
  let autoTimer = setInterval(() => goTo((current + 1) % TOTAL), 6000);

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo((current + 1) % TOTAL), 6000);
  }

  function goTo(index) {
    current = (index + TOTAL) % TOTAL;

    const cardWidth = track.parentElement.offsetWidth;
    track.style.transform = `translateX(-${current * (cardWidth + 20)}px)`;

    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle('reviews__dot--active', active);
      dot.setAttribute('aria-selected', String(active));
    });

    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === TOTAL - 1;
  }

  prevBtn?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
  dots.forEach(dot => dot.addEventListener('click', () => { goTo(Number(dot.dataset.index)); resetAuto(); }));

  goTo(0);

  /* ── Drag / swipe ── */
  let startX = 0, isDragging = false, dragDelta = 0;

  track.addEventListener('mousedown',  e => { startX = e.clientX; isDragging = true; dragDelta = 0; track.classList.add('is-dragging'); });
  window.addEventListener('mousemove', e => { if (isDragging) dragDelta = e.clientX - startX; });
  window.addEventListener('mouseup',   () => {
    if (!isDragging) return;
    isDragging = false; track.classList.remove('is-dragging');
    if (dragDelta < -60) { goTo(current + 1); resetAuto(); }
    else if (dragDelta > 60) { goTo(current - 1); resetAuto(); }
    else goTo(current);
  });

  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isDragging = true; dragDelta = 0; }, { passive: true });
  track.addEventListener('touchmove',  e => { if (isDragging) dragDelta = e.touches[0].clientX - startX; }, { passive: true });
  track.addEventListener('touchend',   () => {
    if (!isDragging) return;
    isDragging = false;
    if (dragDelta < -60) { goTo(current + 1); resetAuto(); }
    else if (dragDelta > 60) { goTo(current - 1); resetAuto(); }
    else goTo(current);
  });

  /* ── Pausa auto-play al hover ── */
  track.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.addEventListener('mouseleave', () => resetAuto());

  /* ── Resize ── */
  window.addEventListener('resize', debounce(() => goTo(current), 200));

})();

/* ============================================================
   FASE 5 — CONTATORI ANIMATI (score + recensioni)
   ============================================================ */

(function initReviewsCounters() {

  const scoreEl = document.getElementById('reviewsScore');
  const countEl = document.getElementById('reviewsCount');
  if (!scoreEl && !countEl) return;

  const SCORE_TARGET = 4.8;
  const COUNT_TARGET = 312;
  const DURATION     = 1800;
  let started        = false;

  function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

  function animateCounters(timestamp, startTime) {
    const elapsed  = timestamp - startTime;
    const progress = Math.min(elapsed / DURATION, 1);
    const eased    = easeOutExpo(progress);

    if (scoreEl) scoreEl.textContent = (eased * SCORE_TARGET).toFixed(1);
    if (countEl) countEl.textContent = Math.round(eased * COUNT_TARGET).toLocaleString('it-IT');

    if (progress < 1) requestAnimationFrame(ts => animateCounters(ts, startTime));
    else {
      if (scoreEl) scoreEl.textContent = SCORE_TARGET.toFixed(1);
      if (countEl) countEl.textContent = COUNT_TARGET.toLocaleString('it-IT');
    }
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        requestAnimationFrame(ts => animateCounters(ts, ts));
        observer.disconnect();
      }
    });
  }, { threshold: 0.4 });

  const target = document.querySelector('.reviews__aggregate') || scoreEl;
  if (target) observer.observe(target);

})();
