/* Neon Portfolio - main.js */

(function () {
  // Year in footer
  document.getElementById("year").textContent = new Date().getFullYear();

  // AOS init
  if (window.AOS) {
    AOS.init({ duration: 850, once: true, offset: 80 });
  }

  // Cursor glow follow
  const glow = document.querySelector(".cursor-glow");
  window.addEventListener("mousemove", (e) => {
    if (!glow) return;
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });

  // Particles background
  if (window.particlesJS) {
    particlesJS("particles-js", {
      particles: {
        number: { value: 55, density: { enable: true, value_area: 900 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: 0.18, random: true },
        size: { value: 2.3, random: true },
        line_linked: { enable: true, distance: 140, opacity: 0.12, width: 1 },
        move: { enable: true, speed: 1.2 }
      },
      interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } },
        modes: { repulse: { distance: 90 }, push: { particles_nb: 2 } }
      },
      retina_detect: true
    });
  }

  // Animate counters + progress when visible
  const counters = document.querySelectorAll(".counter");
  const bars = document.querySelectorAll(".progress-bar[data-progress]");

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      // Counters
      counters.forEach((el) => {
        if (el.dataset.done === "1") return;
        el.dataset.done = "1";
        const target = parseInt(el.dataset.target || "0", 10);
        animateCount(el, target, 1200);
      });

      // Progress bars
      bars.forEach((bar) => {
        if (bar.dataset.done === "1") return;
        bar.dataset.done = "1";
        const p = parseInt(bar.dataset.progress || "0", 10);
        bar.style.width = Math.max(0, Math.min(100, p)) + "%";
      });

      io.disconnect();
    });
  }, { threshold: 0.25 });

  // Observe skills section
  const skillsSection = document.querySelector("#skills");
  if (skillsSection) io.observe(skillsSection);

  function animateCount(el, target, duration) {
    const start = 0;
    const startTime = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const value = Math.floor(start + (target - start) * easeOutCubic(t));
      el.textContent = value.toString();
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toString();
    }
    requestAnimationFrame(tick);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // Contact form (functional: validation + optional EmailJS + mailto fallback)
  const form = document.getElementById("contactForm");
  const alertBox = document.getElementById("formAlert");
  const btn = form?.querySelector('button[type="submit"]');
  const btnLabel = form?.querySelector(".btn-label");
  const btnLoading = form?.querySelector(".btn-loading");

  // OPTIONAL: Enable EmailJS (real sending)
  // 1) Uncomment EmailJS script in index.html
  // 2) Create EmailJS account + email service + template
  // 3) Fill these:
  const EMAILJS_ENABLED = false;
  const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
  const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
  const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Bootstrap style validation
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      showSending(true);

      try {
        if (EMAILJS_ENABLED && window.emailjs) {
          // emailjs.init(EMAILJS_PUBLIC_KEY);
          // await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, data);
          // NOTE: Keep init() call once in production.
          throw new Error("EmailJS is enabled flag but not initialized. Configure keys.");
        } else {
          // Fallback: open mailto with prefilled content
          openMailTo(data);
        }

        showSuccess();
        form.reset();
        form.classList.remove("was-validated");
      } catch (err) {
        console.error(err);
        // Still offer mailto fallback
        openMailTo(data);
        showSuccess();
      } finally {
        showSending(false);
      }
    });
  }

  function showSending(isSending) {
    if (!btn || !btnLabel || !btnLoading) return;
    btn.disabled = isSending;
    btnLabel.classList.toggle("d-none", isSending);
    btnLoading.classList.toggle("d-none", !isSending);
  }

  function showSuccess() {
    if (!alertBox) return;
    alertBox.classList.remove("d-none");
    setTimeout(() => alertBox.classList.add("d-none"), 5000);
  }

  // Global for button
  window.openMailTo = function (prefill) {
    const name = prefill?.name || "";
    const email = prefill?.email || "";
    const subject = prefill?.subject || "Portfolio Inquiry";
    const message = prefill?.message || "";

    const body =
      `Name: ${name}\n` +
      `Email: ${email}\n\n` +
      `${message}\n\n` +
      `— Sent from Syed Ali Mujtaba Shah portfolio`;

    const mailto = `mailto:syedallimujtaba@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  // Resume download placeholder
  window.downloadResume = function (e) {
    e.preventDefault();
    // Put your resume file in /assets/resume/Syed-Ali-Resume.pdf and update this link:
    const url = "assets/resume/Syed-Ali-Resume.pdf";
    window.open(url, "_blank");
  };
})();
