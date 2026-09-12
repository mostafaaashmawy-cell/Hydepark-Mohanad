/**
 * HYDE PARK DEVELOPMENTS — LUXURY RESIDENCES (BY PROPERTIES-A)
 * Interactive Controller & Web3Forms AJAX Integration
 */

document.addEventListener('DOMContentLoaded', () => {
  // Configuration
  const CONFIG = {
    WHATSAPP_PHONE: '201003565002',
    WEB3FORMS_ACCESS_KEY: '9f6d054c-a955-4ed1-b85d-91c7f8b0a16a',
    DEFAULT_INQUIRY_MSG: 'Hello, I am interested in One Hyde Park New Launch exclusive offer.'
  };

  // 1. Project Filter Tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  const projectCards = document.querySelectorAll('.project-card');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          card.style.animation = 'fadeInUp 0.5s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 2. Modal Dialog Controls
  const modalOverlay = document.getElementById('inquiry-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalHiddenProject = document.getElementById('modal-project-name');
  const modalTitle = document.getElementById('modal-title');
  const openModalButtons = document.querySelectorAll('.js-open-brochure-modal');

  function openModal(projectName = 'One Hyde Park — New Launch') {
    if (!modalOverlay) return;
    if (modalHiddenProject) {
      modalHiddenProject.value = projectName;
    }
    if (modalTitle && projectName) {
      modalTitle.textContent = `Request Dossier: ${projectName}`;
    }
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  openModalButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const proj = btn.getAttribute('data-project') || 'One Hyde Park — New Launch';
      openModal(proj);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay?.classList.contains('active')) {
      closeModal();
    }
  });

  // 3. Toast Notification Utility
  function showToast(message, isError = false) {
    let toast = document.getElementById('site-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'site-toast';
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.borderColor = isError ? '#e74c3c' : 'var(--color-gold)';
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  // 4. Form Submissions via Web3Forms (AJAX) — Supports Any Country Code
  const forms = [
    document.getElementById('hero-lead-form'),
    document.getElementById('section-lead-form'),
    document.getElementById('modal-lead-form')
  ].filter(Boolean);

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';

      const nameInput = form.querySelector('input[name="name"]');
      const phoneInput = form.querySelector('input[name="phone"]');
      const projectInput = form.querySelector('input[name="project"]');
      const accessKeyInput = form.querySelector('input[name="access_key"]');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const project = (projectInput && projectInput.value.trim()) || 'One Hyde Park - New Launch';
      const accessKey = (accessKeyInput && accessKeyInput.value.trim()) || CONFIG.WEB3FORMS_ACCESS_KEY;

      if (!name) {
        showToast('Please enter your full name.', true);
        nameInput?.focus();
        return;
      }

      // Allow any country code: simply ensure it has at least 7 digits
      const digitsOnly = phone.replace(/\D/g, '');
      if (digitsOnly.length < 7) {
        showToast('Please enter a valid phone number with country code (e.g. +20, +971, +966, +1).', true);
        phoneInput?.focus();
        return;
      }

      // Indicate loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg style="animation: spin 1s linear infinite; width:16px; height:16px; margin-right:8px; display:inline-block;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="4" stroke="rgba(255,255,255,0.2)"></circle>
            <path stroke-linecap="round" stroke-width="4" stroke="currentColor" d="M12 2a10 10 0 0 1 10 10"></path>
          </svg>
          Submitting...
        `;
      }

      try {
        const payload = {
          access_key: accessKey,
          name: name,
          phone: phone,
          project: project,
          campaign: 'One Hyde Park New Launch Exclusive Offer',
          source: 'Hydepark Mohanad Landing Page (Properties-a)',
          page_url: window.location.href,
          timestamp: new Date().toISOString()
        };

        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.status === 200 || result.success) {
          form.reset();
          showToast('Thank you! Your inquiry has been received. Our senior advisor will contact you promptly.');
          if (modalOverlay?.classList.contains('active')) {
            setTimeout(closeModal, 1500);
          }
        } else {
          showToast(result.message || 'Submission completed. We will reach out shortly.');
        }
      } catch (err) {
        console.error('Web3Forms Error:', err);
        showToast('Thank you! Your request was received. Connecting you to WhatsApp...', false);
        setTimeout(() => {
          window.open(`https://wa.me/${CONFIG.WHATSAPP_PHONE}?text=${encodeURIComponent(`Hello, my name is ${name}. I am interested in ${project}. Phone: ${phone}`)}`, '_blank');
        }, 1200);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  });

  // 5. Dynamic WhatsApp pre-fill links
  const whatsappButtons = document.querySelectorAll('a[data-wa-project]');
  whatsappButtons.forEach(btn => {
    const project = btn.getAttribute('data-wa-project');
    let message = CONFIG.DEFAULT_INQUIRY_MSG;
    if (project === 'one-hyde-park') {
      message = 'I am interested in One Hyde Park New Launch exclusive offer, New Cairo.';
    } else if (project === 'sea-shore') {
      message = 'I am interested in Sea Shore, North Coast KM 207.';
    } else if (project === 'hyde-park-central') {
      message = 'I am interested in Hyde Park Central, New Cairo.';
    }
    btn.setAttribute('href', `https://wa.me/${CONFIG.WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`);
    btn.setAttribute('target', '_blank');
    btn.setAttribute('rel', 'noopener noreferrer');
  });

  // Inject spin keyframe animation for loader
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin { 100% { transform: rotate(360deg); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `;
  document.head.appendChild(style);
});
