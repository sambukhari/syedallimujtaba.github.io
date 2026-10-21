/* Progressive enhancement: essential content and links also work without JS. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const menu = $('.menu-toggle');
  const nav = $('#site-nav');
  if (menu && nav) {
    const close = (restoreFocus = false) => {
      nav.classList.remove('is-open');
      menu.setAttribute('aria-expanded', 'false');
      if (restoreFocus) menu.focus();
    };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      nav.classList.toggle('is-open', open);
      menu.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;
      close();
      if (window.matchMedia('(max-width: 900px)').matches && link.hash && link.getAttribute('href').startsWith('#')) {
        const section = document.getElementById(link.hash.slice(1));
        if (section) {
          section.setAttribute('tabindex', '-1');
          section.focus({ preventScroll: true });
          section.addEventListener('blur', () => section.removeAttribute('tabindex'), { once: true });
        }
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) close(true);
    });
    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target) && !menu.contains(event.target) && nav.classList.contains('is-open')) close(nav.contains(document.activeElement));
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', () => close());
    document.documentElement.classList.add('js');
  }
  const filters = $('#project-filters');
  const cards = $$('.project-card');
  if (filters && cards.length) {
    $$('[data-count]', filters).forEach((node) => {
      node.textContent = String(cards.filter((c) => node.dataset.count === 'all' || c.dataset.category === node.dataset.count).length);
    });
    filters.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-filter]');
      if (!button || !filters.contains(button)) return;
      const category = button.dataset.filter;
      $$('button', filters).forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      let visible = 0;
      cards.forEach((card) => {
        card.hidden = category !== 'all' && card.dataset.category !== category;
        if (!card.hidden) visible += 1;
      });
      const status = $('#filter-status');
      if (status) status.textContent = `${visible} project${visible === 1 ? '' : 's'} shown.`;
    });
    filters.hidden = false;
  }
  const sculpture = $('#sculpture');
  const viewport = $('#scene-viewport');
  const layers = $('#layer-controls');
  const motionButton = $('#motion-toggle');
  if (sculpture && viewport && layers && motionButton) {
    const captions = {
      interface: 'Considered interfaces. Web and mobile, connected.',
      systems: 'Laravel, APIs and the architecture beneath the surface.',
      delivery: 'Code reviews, release discipline and team ownership.'
    };
    let enabled = !reduced.matches;
    let pointerFrame = 0;
    let pointer = { x: 0, y: 0 };
    const resetTilt = () => {
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      sculpture.style.removeProperty('--rx');
      sculpture.style.removeProperty('--rz');
    };
    const syncMotion = () => {
      if (reduced.matches) enabled = false;
      document.documentElement.classList.toggle('motion-off', !enabled);
      motionButton.disabled = reduced.matches;
      motionButton.setAttribute('aria-pressed', String(enabled));
      motionButton.textContent = reduced.matches ? 'Reduced motion' : enabled ? 'Motion on \u25cb' : 'Motion off \u2014';
      motionButton.setAttribute('aria-label', reduced.matches ? 'Reduced motion enabled in your system settings' : enabled ? 'Turn off pointer motion' : 'Turn on pointer motion');
      if (!enabled) resetTilt();
    };
    layers.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-layer]');
      if (!button || !Object.hasOwn(captions, button.dataset.layer)) return;
      sculpture.dataset.layer = button.dataset.layer;
      $$('button', layers).forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      const caption = $('#layer-caption');
      if (caption) caption.textContent = captions[button.dataset.layer];
    });
    viewport.addEventListener('pointermove', (event) => {
      if (!enabled || reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
      const box = viewport.getBoundingClientRect();
      pointer = { x: (event.clientX - box.left) / box.width - .5, y: (event.clientY - box.top) / box.height - .5 };
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        sculpture.style.setProperty('--rx', `${56 - pointer.y * 10}deg`);
        sculpture.style.setProperty('--rz', `${-33 + pointer.x * 15}deg`);
        pointerFrame = 0;
      });
    }, { passive: true });
    viewport.addEventListener('pointerleave', resetTilt);
    motionButton.addEventListener('click', () => { enabled = !enabled; syncMotion(); });
    reduced.addEventListener('change', syncMotion);
    finePointer.addEventListener('change', resetTilt);
    document.addEventListener('visibilitychange', () => { if (document.hidden) resetTilt(); });
    layers.hidden = false;
    motionButton.hidden = false;
    syncMotion();
  }
  const copy = $('#copy-email');
  const email = $('#email-link');
  const copyStatus = $('#copy-status');
  if (copy && email && copyStatus) {
    copy.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(email.textContent.trim());
        copyStatus.textContent = 'Email address copied.';
      } catch {
        copyStatus.textContent = 'Copy is unavailable here. Select the email address above, or use the email link.';
      }
    });
    copy.hidden = false;
  }
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
  if ('IntersectionObserver' in window) {
    const links = $$('.site-nav a[href^="#"]');
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (!visible) return;
      links.forEach((link) => {
        if (link.hash === `#${visible.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -65% 0px' });
    links.forEach((link) => { const section = document.getElementById(link.hash.slice(1)); if (section) observer.observe(section); });
  }
})();
