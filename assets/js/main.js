/* Progressive enhancement. All career, project and contact content is static HTML. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const menu = $('.menu-button');
  const nav = $('#navigation');
  function closeMenu(returnFocus = false) {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    if (returnFocus) menu.focus();
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true);
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', (event) => {
    if (!nav.classList.contains('is-open')) return;
    const target = document.querySelector(link.getAttribute('href'));
    closeMenu();
    if (target) {
      event.preventDefault();
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth' });
      history.replaceState(null, '', link.getAttribute('href'));
    }
  }));
  matchMedia('(min-width: 601px)').addEventListener('change', (event) => {
    if (event.matches) closeMenu();
  });

  $$('.skill-filters button').forEach((button) => button.addEventListener('click', () => {
    const filter = button.dataset.skill;
    $$('.skill-filters button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    $$('.skill').forEach((skill) => {
      const visible = filter === 'all' || skill.dataset.category === filter;
      skill.hidden = !visible;
      if (visible) count++;
    });
    $('#skill-status').textContent = `${count} skills shown for ${button.textContent}.`;
  }));

  const scenarios = {
    leads: {
      input: 'New enquiry', reason: 'Classify & prepare', output: 'Route to the right team',
      ready: 'Ready. Run a sample enquiry through the workflow.',
      messages: ['Sample: a business needs a Laravel platform and an automation workflow.', 'Demo classification: product engineering. Preparing a team-routing suggestion.', 'Review: route this sample enquiry to the engineering team. Nothing has been sent.', 'Approved in this demo. Routing is simulated; no CRM record or message was created.']
    },
    support: {
      input: 'Support request', reason: 'Identify intent & draft', output: 'Prepare a reviewed reply',
      ready: 'Ready. Try a sample customer-support workflow.',
      messages: ['Sample: a customer asks how to reset their account password.', 'Demo classification: account access. Preparing a password-reset help response.', 'Review: suggest the standard reset instructions. No customer data is accessed.', 'Approved in this demo. The reply is marked ready; no email or message was sent.']
    },
    reports: {
      input: 'Reporting schedule', reason: 'Summarise sample data', output: 'Prepare a team digest',
      ready: 'Ready. Try a sample weekly-reporting workflow.',
      messages: ['Sample: three completed tasks and one blocked task in a fictional work log.', 'Demo summary: three tasks completed. One task needs an owner decision.', 'Review the sample digest before distribution. No external data was fetched.', 'Approved in this demo. The digest is marked ready; nothing was published.']
    }
  };
  let selected = 'leads';
  let timers = [];
  let awaitingApproval = false;
  const run = $('#run-demo'), approve = $('#approve-demo'), log = $('#demo-status');
  const steps = $$('.flow-node');
  function cancelTimers() { timers.forEach(clearTimeout); timers = []; }
  function stage(index) {
    steps.forEach((node, i) => {
      node.classList.toggle('active', i === index);
      node.classList.toggle('complete', i < index);
    });
    log.textContent = scenarios[selected].messages[index];
  }
  function reset() {
    cancelTimers(); awaitingApproval = false;
    steps.forEach((node) => node.classList.remove('active', 'complete'));
    run.disabled = false; run.hidden = false; approve.hidden = true;
    run.innerHTML = 'Run workflow <span aria-hidden="true">&#8599;</span>';
    log.textContent = scenarios[selected].ready;
  }
  $$('.lab-tabs button').forEach((button) => button.addEventListener('click', () => {
    selected = button.dataset.demo;
    $$('.lab-tabs button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    $('#flow-input').textContent = scenarios[selected].input;
    $('#flow-reason').textContent = scenarios[selected].reason;
    $('#flow-output').textContent = scenarios[selected].output;
    reset();
  }));
  run.addEventListener('click', () => {
    cancelTimers(); run.disabled = true; stage(0);
    const delay = reduced.matches ? 180 : 700;
    timers.push(setTimeout(() => stage(1), delay));
    timers.push(setTimeout(() => {
      stage(2); awaitingApproval = true; run.hidden = true; approve.hidden = false;
      approve.focus({ preventScroll: true });
    }, delay * 2));
  });
  approve.addEventListener('click', () => {
    if (!awaitingApproval) return;
    awaitingApproval = false; stage(3); steps[3].classList.add('complete');
    approve.hidden = true; run.hidden = false; run.disabled = false;
    run.innerHTML = 'Run again <span aria-hidden="true">&#8599;</span>';
    run.focus({ preventScroll: true });
  });
  $('#reset-demo').addEventListener('click', reset);
  window.addEventListener('pagehide', cancelTimers, { once: true });

  $('#copy-email').addEventListener('click', async () => {
    const address = $('.email-link').textContent.trim();
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(address);
      $('#copy-status').textContent = 'Email address copied.';
    } catch {
      $('#copy-status').textContent = 'Copy unavailable. Select the email address above, or click it to open your mail app.';
    }
  });
  $('#year').textContent = String(new Date().getFullYear());

  const scriptUrl = document.currentScript?.src || new URL('assets/js/main.js', document.baseURI).href;
  const controls = $('#scene-controls');
  import(new URL('scene.js', scriptUrl).href).then(({ mountScene }) => {
    controls.hidden = false;
    return mountScene($('#scene'), controls);
  }).then(() => {
    if (['native-webgl', 'software-3d'].includes($('#scene').dataset.engine)) $('#scene-hint').textContent = 'DRAG TO EXPLORE / LIVE 3D';
  }).catch(() => {
    controls.hidden = true;
    $('#scene').dataset.engine = 'static';
    $('#scene-hint').textContent = 'THREE DISCIPLINES. ONE SYSTEM.';
  });
})();
