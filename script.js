/**
 * Tastes of Africa - Interactive Dynamic Script
 * DOM Manipulation, LocalStorage Favorites, Recipe Filtering, Servings Scaler & Form Validation
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNav();
  initRecipeFiltering();
  initFavoritesSystem();
  initServingsScaler();
  initContactFormValidation();
  initNewsletterForm();
});

/* --- Clean SVG Icons (Zero Emojis) --- */
const ICONS = {
  sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
  moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
  heartOutline: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  heartFilled: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#DC2626" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`
};

/* ==========================================================================
   1. Theme Toggle (Dark / Light Mode) with LocalStorage
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (!themeToggleBtn) return;

  const savedTheme = localStorage.getItem('toa_theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  applyTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('toa_theme', newTheme);
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    themeToggleBtn.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
  }
}

/* ==========================================================================
   2. Responsive Mobile Navigation Toggle
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navMenu');
  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
    toggleBtn.innerHTML = isOpen ? '✕' : '☰';
  });

  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target) && navMenu.classList.contains('is-open')) {
      navMenu.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.innerHTML = '☰';
    }
  });
}

/* ==========================================================================
   3. Interactive Recipe Filter (DOM manipulation & data-region)
   ========================================================================== */
function initRecipeFiltering() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const recipeCards = document.querySelectorAll('.recipe-card[data-region]');
  const countIndicator = document.getElementById('visibleRecipeCount');

  if (filterBtns.length === 0 || recipeCards.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedRegion = btn.getAttribute('data-filter');
      let visibleCount = 0;

      recipeCards.forEach(card => {
        const cardRegion = card.getAttribute('data-region');
        const matches = selectedRegion === 'all' || cardRegion === selectedRegion;

        if (matches) {
          card.style.display = 'flex';
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.style.display = 'none';
          card.classList.add('hidden');
        }
      });

      if (countIndicator) {
        countIndicator.textContent = `Showing ${visibleCount} signature dish${visibleCount === 1 ? '' : 'es'}`;
      }
    });
  });
}

/* ==========================================================================
   4. Favorites Feature with LocalStorage Persistence
   ========================================================================== */
function initFavoritesSystem() {
  const STORAGE_KEY = 'toa_saved_favorites';
  const favoriteButtons = document.querySelectorAll('.btn-favorite');
  const navBadge = document.getElementById('favoritesCountBadge');

  let favorites = [];
  try {
    favorites = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (_) {
    favorites = [];
  }

  updateFavoritesCounter();
  restoreFavoriteButtons();

  favoriteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const recipeId = btn.getAttribute('data-id');
      if (!recipeId) return;

      const hasText = btn.classList.contains('btn-with-text');
      const index = favorites.indexOf(recipeId);

      if (index === -1) {
        favorites.push(recipeId);
        btn.classList.add('is-favorite');
        btn.innerHTML = hasText ? `${ICONS.heartFilled} Saved to Favorites` : ICONS.heartFilled;
        btn.setAttribute('aria-label', 'Remove from favorites');
        showToast('Saved to your favorites!');
      } else {
        favorites.splice(index, 1);
        btn.classList.remove('is-favorite');
        btn.innerHTML = hasText ? `${ICONS.heartOutline} Save to Favorites` : ICONS.heartOutline;
        btn.setAttribute('aria-label', 'Save to favorites');
        showToast('Removed from favorites.');
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      updateFavoritesCounter();
    });
  });

  function restoreFavoriteButtons() {
    favoriteButtons.forEach(btn => {
      const recipeId = btn.getAttribute('data-id');
      const hasText = btn.classList.contains('btn-with-text');

      if (favorites.includes(recipeId)) {
        btn.classList.add('is-favorite');
        btn.innerHTML = hasText ? `${ICONS.heartFilled} Saved to Favorites` : ICONS.heartFilled;
        btn.setAttribute('aria-label', 'Remove from favorites');
      } else {
        btn.classList.remove('is-favorite');
        btn.innerHTML = hasText ? `${ICONS.heartOutline} Save to Favorites` : ICONS.heartOutline;
        btn.setAttribute('aria-label', 'Save to favorites');
      }
    });
  }

  function updateFavoritesCounter() {
    if (navBadge) {
      navBadge.textContent = favorites.length;
      navBadge.style.display = favorites.length > 0 ? 'inline-block' : 'none';
    }
  }
}

/* ==========================================================================
   5. Interactive Ingredient Servings Scaler
   ========================================================================== */
function initServingsScaler() {
  const scalerContainer = document.getElementById('servingsScaler');
  if (!scalerContainer) return;

  const countDisplay = document.getElementById('servingsCount');
  const decreaseBtn = document.getElementById('decreaseServings');
  const increaseBtn = document.getElementById('increaseServings');
  const qtyElements = document.querySelectorAll('.ingredient-qty[data-base]');

  if (!countDisplay || qtyElements.length === 0) return;

  const baseServings = parseInt(countDisplay.getAttribute('data-base-servings') || '4', 10);
  let currentServings = baseServings;

  if (decreaseBtn) {
    decreaseBtn.addEventListener('click', () => {
      if (currentServings > 2) {
        currentServings -= 2;
        updateQuantities();
      }
    });
  }

  if (increaseBtn) {
    increaseBtn.addEventListener('click', () => {
      if (currentServings < 16) {
        currentServings += 2;
        updateQuantities();
      }
    });
  }

  function updateQuantities() {
    countDisplay.textContent = `${currentServings} Servings`;
    const factor = currentServings / baseServings;

    qtyElements.forEach(el => {
      const baseQty = parseFloat(el.getAttribute('data-base'));
      if (isNaN(baseQty)) return;

      const scaledQty = baseQty * factor;
      el.textContent = formatQuantity(scaledQty);
    });
  }

  function formatQuantity(num) {
    if (num % 1 === 0) return num.toString();
    if (Math.abs(num - 0.5) < 0.05) return '½';
    if (Math.abs(num - 0.25) < 0.05) return '¼';
    if (Math.abs(num - 0.75) < 0.05) return '¾';
    return num.toFixed(1).replace(/\.0$/, '');
  }
}

/* ==========================================================================
   6. Contact Form Interception, Validation & Dynamic Feedback
   ========================================================================== */
function initContactFormValidation() {
  const contactForm = document.getElementById('contactForm');
  const confirmationCard = document.getElementById('confirmationCard');
  const dynamicGreeting = document.getElementById('dynamicGreeting');
  const messageInput = document.getElementById('message');
  const messageError = document.getElementById('messageError');
  const nameInput = document.getElementById('name');
  const charCounter = document.getElementById('charCounter');

  if (!contactForm) return;

  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      const length = messageInput.value.trim().length;
      charCounter.textContent = `${length} / 20 minimum characters`;
      if (length >= 20) {
        charCounter.style.color = 'var(--moringa-green)';
        if (messageError) messageError.style.display = 'none';
      } else {
        charCounter.style.color = 'var(--text-muted)';
      }
    });
  }

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const nameValue = nameInput ? nameInput.value.trim() : 'Friend';
    const messageValue = messageInput ? messageInput.value.trim() : '';

    if (messageValue.length <= 20) {
      if (messageError) {
        messageError.textContent = 'Please provide a more detailed message (minimum 21 characters).';
        messageError.style.display = 'block';
      }
      if (messageInput) {
        messageInput.focus();
        messageInput.style.borderColor = 'var(--paprika-red)';
      }
      return;
    }

    contactForm.style.display = 'none';
    if (confirmationCard && dynamicGreeting) {
      dynamicGreeting.textContent = `Thank you, ${nameValue}! We've received your message.`;
      confirmationCard.style.display = 'block';
      confirmationCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

/* ==========================================================================
   7. Newsletter Subscription Feedback
   ========================================================================== */
function initNewsletterForm() {
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value.trim()) {
        showToast(`Thank you! ${emailInput.value.trim()} has been subscribed to Tastes of Africa.`);
        emailInput.value = '';
      }
    });
  });
}

/* ==========================================================================
   Helper: Minimalist Toast Notification
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.backgroundColor = 'var(--primary-terracotta)';
    toast.style.color = '#FFFFFF';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '9999px';
    toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
    toast.style.zIndex = '9999';
    toast.style.fontWeight = '600';
    toast.style.fontSize = '0.9rem';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
  }, 2800);
}
