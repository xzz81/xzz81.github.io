document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const mobileNavQuery = window.matchMedia("(max-width: 760px)");

function closeNav(restoreFocus = false) {
  const wasOpen = nav.classList.contains("is-open");
  document.body.classList.remove("nav-open");
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation");
  if (restoreFocus && wasOpen) navToggle.focus({ preventScroll: true });
}

navToggle.addEventListener("click", () => {
  const willOpen = !nav.classList.contains("is-open");
  document.body.classList.toggle("nav-open", willOpen);
  nav.classList.toggle("is-open", willOpen);
  navToggle.setAttribute("aria-expanded", String(willOpen));
  navToggle.setAttribute("aria-label", willOpen ? "Close navigation" : "Open navigation");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => closeNav());
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNav(true);
});

mobileNavQuery.addEventListener("change", () => {
  if (!mobileNavQuery.matches) closeNav();
});

window.addEventListener(
  "scroll",
  () => header.classList.toggle("is-scrolled", window.scrollY > 8),
  { passive: true },
);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-active", isCurrent);
          if (isCurrent) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-28% 0px -62%", threshold: 0 },
  );

  document.querySelectorAll("main section[id]:not(#top)").forEach((section) => {
    sectionObserver.observe(section);
  });
}

const figureDialog = document.querySelector("#figure-dialog");
const figureTitle = document.querySelector("#figure-dialog-title");
const figureImage = document.querySelector("[data-figure-large]");
let figureTrigger = null;

document.querySelectorAll("[data-figure-open]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const thumbnail = trigger.querySelector("img");
    figureTrigger = trigger;
    figureTitle.textContent = trigger.closest("article").querySelector("h3").textContent;
    figureImage.src = thumbnail.currentSrc || thumbnail.src;
    figureImage.alt = thumbnail.alt;
    figureDialog.showModal();
    document.body.classList.add("figure-open");
  });
});

figureDialog.addEventListener("click", (event) => {
  if (event.target !== figureDialog) return;
  const bounds = figureDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) {
    figureDialog.close();
  }
});

figureDialog.addEventListener("close", () => {
  document.body.classList.remove("figure-open");
  figureImage.removeAttribute("src");
  figureTrigger?.focus({ preventScroll: true });
  figureTrigger = null;
});

// Photo placeholders switch automatically when the matching files are added.
document.querySelectorAll("[data-photo-slot]").forEach((slot) => {
  const image = slot.querySelector("[data-photo-image]");
  const placeholder = slot.querySelector("[data-photo-placeholder]");
  const source = image?.dataset.src;
  if (!image || !placeholder || !source) return;

  const probe = new Image();
  probe.onload = () => {
    image.src = source;
    image.hidden = false;
    placeholder.hidden = true;
    slot.classList.add("has-photo");
  };
  probe.src = source;
});

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();

const teachersDayGreeting = document.querySelector("[data-teachers-day]");
// One-off 2026 greeting: September 10 ends at midnight in UTC-12 (AoE).
const teachersDayDeadline = Date.parse("2026-09-11T00:00:00-12:00");

if (teachersDayGreeting && Date.now() < teachersDayDeadline) {
  let hideTimer;
  let previousFocus;
  const dismissGreeting = () => {
    const restoreFocus = teachersDayGreeting.contains(document.activeElement);
    teachersDayGreeting.hidden = true;
    window.clearTimeout(showTimer);
    window.clearTimeout(hideTimer);
    if (restoreFocus) previousFocus?.focus({ preventScroll: true });
  };

  const showTimer = window.setTimeout(() => {
    const remaining = teachersDayDeadline - Date.now();
    if (remaining <= 0) return;
    previousFocus = document.activeElement;
    teachersDayGreeting.hidden = false;
    hideTimer = window.setTimeout(dismissGreeting, Math.min(15000, remaining));
  }, 600);

  document.querySelector("[data-teachers-day-close]").addEventListener("click", dismissGreeting);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") dismissGreeting();
  });

  // Re-check when a suspended tab or back/forward-cached page becomes visible.
  const checkGreetingExpiry = () => {
    if (Date.now() >= teachersDayDeadline) dismissGreeting();
  };
  window.addEventListener("pageshow", checkGreetingExpiry);
  document.addEventListener("visibilitychange", checkGreetingExpiry);
}
