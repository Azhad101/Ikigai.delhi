/**
 * IKIGAI — Core Editorial Experience Logic
 * Vanilla ES6, Zero-bloat, High-performance
 * "Find what drives you. Build what matters."
 */

import { eventConfig } from "./data/eventConfig.js";
import { challenges, challengeCategories } from "./data/challenges.js";
import { operatingSequence } from "./data/schedule.js";
import { sponsorSystem, communityAlliance } from "./data/sponsors.js";
import { faqIndex } from "./data/faq.js";
import { initMotionEngine, onScrollProgress, parallaxLayer, environmentalTransition, motion, pinnedSequence } from "./motion.js";
import { initDepthField, bindHeroBoost } from "./depth.js";
import { initIkigaiJourney } from "./journey.js";
import { initHackathonJourney } from "./hackathon-journey.js";

document.addEventListener("DOMContentLoaded", () => {
  initMotionEngine(); // Smooth scroll + scroll-progress broadcaster — set up first so everything below can subscribe to it.
  initDepthField(); // Fixed environmental parallax backdrop — subscribes to the same broadcaster.
  initHeroConvergenceAnimation();
  initHeroWorldTransition();
  initIkigaiJourney();
  initHackathonJourney();
  initNavSystem();
  initEventLogistics();
  initDossiers();
  initSponsorsAndAlliance();
  initFaqAccordion();
  initScrollProgressAndSunrise();
  initKonamiEasterEgg();
  initTextFadeInAnimation();
  initCustomCursor();
  initNumberInterpolation();
  initLineDrawing();
  initScrollLinkedParallax();
  initSectionNumberMorphing();
  initThresholdBoot();
  logEditorialConsoleBanner();
});

/* ==========================================================================
   0. BOOT SEQUENCE — THE THRESHOLD
   A gate, not a loading screen. Runs once per browser session (not
   once per visit — revisiting a page you're already inside shouldn't
   re-open the gate every time). Everything else on the page has
   already initialized beneath it; the gate simply holds it back
   until the sequence completes, then irises open.
   ========================================================================== */
function initThresholdBoot() {
  const gate = document.getElementById("thresholdGate");
  if (!gate) {
    document.body.classList.remove("is-booting");
    return;
  }

  const SEEN_KEY = "ikigai_threshold_seen";
  const alreadySeen = (() => {
    try { return sessionStorage.getItem(SEEN_KEY) === "1"; }
    catch (err) { return false; }
  })();

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const skipBtn = document.getElementById("thresholdSkip");
  const linesWrap = document.getElementById("thresholdLines");
  const flash = document.getElementById("thresholdFlash");

  // Quiet, unhurried phrases — found rather than loaded. Kept short
  // and in the site's own philosophical voice, never "Loading…" or
  // percentage-style copy.
  const lines = [
    "you are not early. you are not late.",
    "the four circles are already yours.",
    "beginning is the only requirement."
  ];

  let finished = false;

  function finishBoot(instant) {
    if (finished) return;
    finished = true;
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch (err) { /* private mode, ignore */ }

    document.body.classList.remove("is-booting");
    gate.classList.add("gate-open");

    const cleanupDelay = instant ? 0 : 950;
    setTimeout(() => {
      gate.setAttribute("aria-hidden", "true");
      gate.style.display = "none";
    }, cleanupDelay);
  }

  // Returning within the same session: don't replay the whole gate,
  // just clear it immediately so navigation feels instant.
  if (alreadySeen) {
    finishBoot(true);
    return;
  }

  if (skipBtn) {
    skipBtn.addEventListener("click", () => finishBoot(false));
  }

  if (prefersReduced) {
    // Minimal, respectful version: mark, brief pause, cross-fade out.
    gate.classList.add("gate-breathing");
    const mark = document.getElementById("thresholdMark");
    if (mark) { mark.style.opacity = "1"; mark.style.transform = "scale(1)"; }
    setTimeout(() => finishBoot(false), 900);
    return;
  }

  // Render the line sequence container (built here rather than in
  // markup so it degrades to nothing if JS fails to run).
  const lineEls = lines.map((text) => {
    const el = document.createElement("span");
    el.className = "threshold-line";
    el.textContent = text;
    linesWrap.appendChild(el);
    return el;
  });

  const TIMELINE = {
    breatheStart: 120,
    lineStep: 1050,
    lineHold: 900,
    convergeStart: 3600,   // pillars gather, mark begins blooming
    markedAt: 4150,        // sun dot dissolves once mark has bloomed
    flashStart: 4950,      // sunrise wash floods in
    flashHoldMs: 500,      // held at peak brightness — this is the beat that should register
    irisStart: 5450,       // gate visibly irises open, in full flash-light
    irisDurationMs: 1300,  // matches .gate-iris clip-path transition in CSS
    flashFadeStart: 6050,  // flash recedes as the page becomes visible through the iris
    boot_done: 6900        // overall opacity cleanup, safely after the iris has finished
  };

  // 1. Darkness settles, sun + four circles begin breathing.
  setTimeout(() => {
    gate.classList.add("gate-breathing");
  }, TIMELINE.breatheStart);

  // 2. One quiet line at a time, each dissolving before the next.
  lineEls.forEach((el, i) => {
    const showAt = TIMELINE.breatheStart + 400 + i * TIMELINE.lineStep;
    const hideAt = showAt + TIMELINE.lineHold;
    setTimeout(() => el.classList.add("line-visible"), showAt);
    setTimeout(() => el.classList.remove("line-visible"), hideAt);
  });

  // 3. The four pillars gravitate inward and converge; the mark blooms.
  setTimeout(() => {
    gate.classList.add("gate-converging");
  }, TIMELINE.convergeStart);

  // 3b. The sun dot has done its job (drawing the eye to center) —
  //     dissolve it so it doesn't sit mid-glyph under the mark.
  setTimeout(() => {
    gate.classList.add("gate-marked");
  }, TIMELINE.markedAt);

  // 4. Sunrise flash floods the gate in vermilion/gold, held briefly
  //    at peak brightness so the beat actually registers.
  setTimeout(() => {
    gate.classList.add("gate-flash");
  }, TIMELINE.flashStart);

  // 5. The gate irises open from its center — the same convergence
  //    point the four circles just gathered at — while still lit by
  //    the flash, so the page arrives bathed in warm light rather
  //    than a hard cut back to the forest canvas.
  setTimeout(() => {
    gate.classList.add("gate-iris");
  }, TIMELINE.irisStart);

  // 6. Only once the iris has had time to fully open does the flash
  //    recede — letting the page's own sunrise-ambient-layer pick up
  //    the glow rather than the two fighting for the same beat.
  setTimeout(() => {
    if (flash) flash.classList.add("flash-fading");
  }, TIMELINE.flashFadeStart);

  setTimeout(() => finishBoot(false), TIMELINE.boot_done);
}

/* ==========================================================================
   1. HERO: SIGNATURE 4-CIRCLE CONVERGENCE EXPERIENCE
   ========================================================================== */
function initHeroConvergenceAnimation() {
  const stage = document.getElementById("heroConvergenceStage");
  const content = document.getElementById("heroContentBlock");
  const maskTitle = document.querySelector(".mask-reveal-title");
  const maskTagline = document.querySelector(".mask-reveal-tagline");
  if (!stage) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    stage.classList.add("converged");
    if (content) content.style.opacity = "1";
    if (maskTitle) maskTitle.classList.add("revealed");
    if (maskTagline) maskTagline.classList.add("revealed");
    return;
  }

  // Meditative pacing:
  // 0ms: Stage begins with central vermilion sun & 4 outer circles
  // 500ms: Circles smoothly gravitate inward & converge
  // 1000ms: Mask reveal for monumental Ikigai.delhi title
  // 1250ms: Mask reveal for staggered tagline
  // 1400ms: Hero text content reveals softly
  setTimeout(() => {
    stage.classList.add("converged");
  }, 500);

  setTimeout(() => {
    if (maskTitle) maskTitle.classList.add("revealed");
  }, 900);

  setTimeout(() => {
    if (maskTagline) maskTagline.classList.add("revealed");
  }, 1150);

  if (content) {
    content.style.opacity = "0";
    content.style.transform = "translateY(16px)";
    content.style.transition = "opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)";
    
    setTimeout(() => {
      content.style.opacity = "1";
      content.style.transform = "translateY(0)";
    }, 1300);

    // Once the entrance settles, drop the inline `transition` — otherwise
    // it lingers on this element forever, and the scroll-scrubbed writes
    // in initHeroWorldTransition would fight it every frame instead of
    // landing instantly (same reasoning as the .sunrise-ambient-layer
    // note in style.css).
    setTimeout(() => {
      content.style.transition = "";
    }, 2350);
  }
}

/* ==========================================================================
   1b. HERO → PHILOSOPHY: THE WORLD-TRAVEL HANDOFF
   Turns the hero/next-section boundary into one continuous move instead
   of a hard cut. On wide viewports the hero pins for one extra
   viewport-height of scroll while its own timeline runs: the four-circle
   stage pushes forward and past camera, the monumental title recedes and
   softens, and the shared depth field (depth.js) gets a temporary,
   symmetrical boost so the whole backdrop visibly accelerates through
   the same window before settling back to its normal drift. "Why
   Ikigai?" starts its own gentle arrival the moment its top reaches the
   bottom of the viewport — right as the pin releases — so there's no gap
   between "hero fading" and "next chapter arriving."
   Narrower viewports (where the hero's two columns stack and the
   section can already run taller than one screen) skip the pin — a
   pinned section taller than the viewport clips — and get a lighter,
   non-pinned version of the same recession instead.
   ========================================================================== */
function initHeroWorldTransition() {
  const heroSection = document.getElementById("hero");
  const stage = document.getElementById("heroConvergenceStage");
  const content = document.getElementById("heroContentBlock");
  const marker = heroSection ? heroSection.querySelector(".hero-top-marker") : null;
  const groundingBar = heroSection ? heroSection.querySelector(".hero-grounding-bar") : null;
  const nextSection = document.getElementById("why-ikigai");
  if (!heroSection || !stage || !content || !nextSection) return;
  if (motion.reducedMotion) return;

  const gsapLib = window.gsap;
  const ScrollTriggerLib = window.ScrollTrigger;
  if (!gsapLib || !ScrollTriggerLib) return;

  // The marker pill and grounding bar carry the site-wide `.fade-in-on-scroll`
  // class, which owns its own CSS transition for their entrance. Once
  // that entrance has had time to finish, drop the inline transition so
  // the scrub below can write to them every frame without the browser
  // trying to CSS-transition each write.
  [marker, groundingBar].forEach((el) => {
    if (!el) return;
    setTimeout(() => { el.style.transition = "none"; }, 1800);
  });

  const HANDOFF_DISTANCE = "+=100%"; // one extra viewport-height of scroll spent on the handoff
  const isWide = window.matchMedia("(min-width: 1024px)").matches;

  if (isWide) {
    pinnedSequence(heroSection, (tl) => {
      // The stage: travels forward and past, the way a landmark does
      // when you move through it rather than merely away from it. Scale
      // stays modest — never a "zoom" — the blur is what sells the
      // motion in the final stretch.
      tl.to(stage, { scale: 1.26, y: 42, ease: "none", duration: 0.72 }, 0.04)
        .to(stage, { opacity: 0, filter: "blur(7px)", ease: "none", duration: 0.32 }, 0.46)
        // The title block: a much smaller move — it settles back and
        // softens, the way something does once your attention has
        // already moved past it.
        .to(content, { scale: 0.93, y: -32, filter: "blur(2.5px)", ease: "none", duration: 0.58 }, 0)
        .to(content, { opacity: 0, ease: "none", duration: 0.24 }, 0.3);

      if (marker) tl.to(marker, { opacity: 0, y: -10, ease: "none", duration: 0.2 }, 0);
      if (groundingBar) tl.to(groundingBar, { opacity: 0, y: 14, ease: "none", duration: 0.3 }, 0.08);
    }, { end: HANDOFF_DISTANCE });

    // Same window, same easing curve, driving the shared depth field
    // instead of the hero's own elements — the backdrop accelerates
    // through the handoff, then returns to its normal whole-page drift.
    bindHeroBoost(heroSection, { end: HANDOFF_DISTANCE });
  } else {
    // Lighter, non-pinned equivalent: the same recession, scrubbed
    // across the hero's own natural scroll-out instead of a pin.
    gsapLib.to(stage, {
      scale: 1.1, y: 24, opacity: 0.12, filter: "blur(3px)", ease: "none",
      scrollTrigger: { trigger: heroSection, start: "top top", end: "bottom top", scrub: true },
    });
    gsapLib.to(content, {
      scale: 0.97, y: -18, opacity: 0.25, filter: "blur(1.5px)", ease: "none",
      scrollTrigger: { trigger: heroSection, start: "top top", end: "bottom top", scrub: true },
    });
  }

  // The next chapter arriving — scrubbed to its own entrance into the
  // viewport on every screen size, so the "gradually emerge" read holds
  // even where the pin above is skipped.
  gsapLib.fromTo(
    nextSection,
    { scale: 0.95, opacity: 0.55, y: 44, filter: "blur(5px)" },
    {
      scale: 1, opacity: 1, y: 0, filter: "blur(0px)", ease: "none",
      scrollTrigger: { trigger: nextSection, start: "top bottom", end: "top 45%", scrub: true },
    }
  );
}

/* ==========================================================================
   2. EDITORIAL NAVIGATION & SCROLL SPY
   ========================================================================== */
function initNavSystem() {
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const navItems = document.querySelectorAll(".nav-link");

  // Subtle border & background blur on scroll — reads from the shared
  // scroll-progress broadcaster instead of attaching its own listener.
  let navIsScrolled = false;
  onScrollProgress(({ scrollY }) => {
    const shouldBeScrolled = scrollY > 24;
    if (shouldBeScrolled === navIsScrolled) return; // no-op unless the state actually flips
    navIsScrolled = shouldBeScrolled;
    if (navIsScrolled) {
      navbar.style.borderBottomColor = "var(--c-hairline-strong)";
      navbar.style.background = "rgba(26, 40, 33, 0.98)";
      navbar.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.25)";
    } else {
      navbar.style.borderBottomColor = "var(--c-hairline)";
      navbar.style.background = "rgba(26, 40, 33, 0.95)";
      navbar.style.boxShadow = "none";
    }
  });

  // Mobile menu drawer
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navItems.forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Scroll Spy
  const sections = document.querySelectorAll("section[id]");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navItems.forEach(link => {
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }, { threshold: 0.25 });

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   3. EVENT DATA BINDING
   ========================================================================== */
function initEventLogistics() {
  const heroDate = document.getElementById("heroDateVal");
  const heroVenue = document.getElementById("heroVenueVal");
  const specDate = document.getElementById("specDate");
  const specVenue = document.getElementById("specVenue");
  const specTeam = document.getElementById("specTeam");

  const dateText = eventConfig.dateDisplay ? eventConfig.dateDisplay.toUpperCase() : "TO BE ANNOUNCED (2026)";
  const venueText = eventConfig.venue ? eventConfig.venue.toUpperCase() : "DELHI NCR";
  const teamText = eventConfig.teamSize ? eventConfig.teamSize.toUpperCase() : "2 – 4 BUILDERS";

  if (heroDate) heroDate.textContent = dateText;
  if (heroVenue) heroVenue.textContent = venueText;
  if (specDate) specDate.textContent = dateText;
  if (specVenue) specVenue.textContent = venueText;
  if (specTeam) specTeam.textContent = teamText;
}

/* ==========================================================================
   4. THE HACKATHON JOURNEY (DISCOVER -> IMPACT)
   Handled by initHackathonJourney() in hackathon-journey.js — a single
   continuously-transforming scene rather than a card-by-card tracker.
   ========================================================================== */

/* ==========================================================================
   5. EXPLORATION VECTORS (CHALLENGES / DOSSIERS SYSTEM)
   ========================================================================== */
function initDossiers() {
  const filterNav = document.getElementById("challengeFilterNav");
  const stack = document.getElementById("challengesGrid");
  const modal = document.getElementById("dossierModal");
  const modalClose = document.getElementById("modalCloseBtn");

  if (!stack) return;

  // Render Category Tabs
  if (filterNav && challengeCategories) {
    filterNav.innerHTML = challengeCategories.map((cat, idx) => `
      <button type="button" class="dossier-filter-tab ${idx === 0 ? 'active' : ''}" data-cat="${cat.id}">
        ${cat.label}
      </button>
    `).join("");

    filterNav.addEventListener("click", (e) => {
      const btn = e.target.closest(".dossier-filter-tab");
      if (!btn) return;

      filterNav.querySelectorAll(".dossier-filter-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderCards(btn.dataset.cat);
    });
  }

  function renderCards(catId = "all") {
    const list = catId === "all" ? challenges : challenges.filter(c => c.category === catId);
    
    stack.innerHTML = list.map(c => `
      <div class="dossier-card" data-id="${c.id}">
        <div>
          <div class="dossier-card-header">
            <span class="dossier-card-id">${c.id}</span>
            <span class="dossier-card-badge">${c.difficulty || "OPEN SPEC"}</span>
          </div>
          <h3 class="dossier-card-title">${c.title}</h3>
          <p class="dossier-card-desc">${c.shortDesc}</p>
        </div>
        <div class="dossier-card-footer">
          <span>EXPLORE VECTOR</span>
          <span>→</span>
        </div>
      </div>
    `).join("");

    // Attach click triggers for details modal
    stack.querySelectorAll(".dossier-card").forEach(card => {
      card.addEventListener("click", () => {
        const item = challenges.find(c => c.id === card.dataset.id);
        if (item) openModal(item);
      });
    });
  }

  function openModal(item) {
    if (!modal) return;
    document.getElementById("modalDossierCode").textContent = item.id;
    document.getElementById("modalDossierTitle").textContent = item.title;
    document.getElementById("modalDossierDesc").textContent = item.fullDesc;
    document.getElementById("modalDossierCategory").textContent = item.category.toUpperCase();
    document.getElementById("modalDossierDifficulty").textContent = item.difficulty || "OPEN BENCHMARK";

    const reqList = document.getElementById("modalRequirementsList");
    if (reqList && item.requirements) {
      reqList.innerHTML = item.requirements.map(r => `<li>${r}</li>`).join("");
    }

    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("open")) {
      closeModal();
    }
  });

  // Initial render
  renderCards("all");
}

/* ==========================================================================
   6. SPONSORS & ALLIANCE DATA BINDING
   ========================================================================== */
function initSponsorsAndAlliance() {
  const container = document.getElementById("sponsorSystemContainer");
  const allianceGrid = document.getElementById("communityAllianceGrid");

  // Render Controlled Sponsor Tiers
  if (container && sponsorSystem) {
    container.innerHTML = sponsorSystem.map(tier => `
      <div class="sponsor-tier-card">
        <div class="sponsor-tier-header">
          <span class="tier-label-mono">${tier.tierLabel}</span>
          <span class="tier-note-text">${tier.tierNote}</span>
        </div>
        <div class="sponsor-slots-grid">
          ${tier.slots.map(slot => `
            <div class="sponsor-slot">
              <span>${slot.name}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");
  }

  // Render Community Alliance (German Crab)
  if (allianceGrid && communityAlliance) {
    allianceGrid.innerHTML = communityAlliance.map(partner => `
      <div class="alliance-card">
        <div class="alliance-partner-name">${partner.name}</div>
        <div class="alliance-partner-role">${partner.role || "COMMUNITY PARTNER"}</div>
      </div>
    `).join("");
  }
}

/* ==========================================================================
   7. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const stack = document.getElementById("faqIndexStack");
  if (!stack || !faqIndex) return;

  stack.innerHTML = faqIndex.map((faq, idx) => `
    <div class="faq-accordion-item ${idx === 0 ? 'open' : ''}">
      <button type="button" class="faq-trigger" aria-expanded="${idx === 0 ? 'true' : 'false'}">
        <span>${faq.q}</span>
        <span class="faq-icon" aria-hidden="true">+</span>
      </button>
      <div class="faq-panel">
        <p>${faq.a}</p>
      </div>
    </div>
  `).join("");

  stack.addEventListener("click", (e) => {
    const trigger = e.target.closest(".faq-trigger");
    if (!trigger) return;

    const item = trigger.closest(".faq-accordion-item");
    const isOpen = item.classList.contains("open");

    // Close others for clean accordion experience
    stack.querySelectorAll(".faq-accordion-item").forEach(el => {
      el.classList.remove("open");
      el.querySelector(".faq-trigger").setAttribute("aria-expanded", "false");
    });

    if (!isOpen) {
      item.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
    }
  });
}

/* ==========================================================================
   8. SCROLL PROGRESS & SUNRISE LIGHT PROGRESSION
   ========================================================================== */
function initScrollProgressAndSunrise() {
  const progressLine = document.getElementById("scrollProgressLine");
  const gsapLib = window.gsap;
  const ScrollTriggerLib = window.ScrollTrigger;

  if (progressLine && gsapLib && ScrollTriggerLib) {
    // Full-document read line — transform-driven (scaleY), scrubbed once
    // by GSAP instead of recomputed in a scroll listener.
    gsapLib.set(progressLine, { scaleY: 0, transformOrigin: "top" });
    gsapLib.to(progressLine, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        start: 0,
        end: () => document.documentElement.scrollHeight - window.innerHeight,
        scrub: true,
      },
    });
  } else if (progressLine) {
    // Graceful fallback if GSAP failed to load.
    window.addEventListener("scroll", () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (docH > 0) progressLine.style.height = `${Math.min((window.scrollY / docH) * 100, 100)}%`;
    }, { passive: true });
  }

  // Sunrise ambient glow: the same "warming as you scroll" beat as
  // before, now scrubbed via opacity/transform (see initScrollLinkedParallax)
  // instead of recomputing a background-gradient string every scroll tick.
}

/* ==========================================================================
   9. KONAMI EASTER EGG (PHILOSOPHICAL TERMINAL)
   ========================================================================== */
function initKonamiEasterEgg() {
  const overlay = document.getElementById("terminalOverlay");
  const closeBtn = document.getElementById("retroTerminalClose");
  const input = document.getElementById("retroTerminalInput");
  const logs = document.getElementById("retroTerminalLogs");

  const konamiSequence = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a"
  ];
  let position = 0;

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === konamiSequence[position].toLowerCase()) {
      position++;
      if (position === konamiSequence.length) {
        position = 0;
        if (overlay) {
          overlay.classList.add("open");
          if (input) {
            input.value = "";
            input.focus();
          }
        }
      }
    } else {
      position = 0;
    }
  });

  function closeTerminal() {
    if (overlay) overlay.classList.remove("open");
  }

  if (closeBtn) closeBtn.addEventListener("click", closeTerminal);
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeTerminal();
    });
  }

  if (input && logs) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const cmd = input.value.trim().toLowerCase();
        input.value = "";
        runCommand(cmd);
      }
    });

    function runCommand(cmd) {
      append(`seeker@ikigai:~$ ${cmd}`);

      switch (cmd) {
        case "help":
          append("Active routines: <strong>ikigai</strong>, <strong>why</strong>, <strong>journey</strong>, <strong>partners</strong>, <strong>clear</strong>, <strong>exit</strong>");
          break;
        case "ikigai":
          append("IKIGAI (生き甲斐): The intersection of passion, ability, mission, and endurance. What drives you meets what matters.");
          break;
        case "why":
          append("We believe the best things aren't built simply because they can be built. They're built because someone cares enough to make them exist.");
          break;
        case "journey":
          append("01 DISCOVER -> 02 CONNECT -> 03 CREATE -> 04 CHALLENGE -> 05 SHARE -> 06 REFLECT -> 07 CONTINUE.");
          break;
        case "partners":
          append("Partnership at Ikigai is an investment in human capability. Inquiries: contact@ikigai.delhi");
          break;
        case "clear":
          logs.innerHTML = "";
          break;
        case "exit":
          closeTerminal();
          break;
        default:
          append(`Unknown command '${cmd}'. Type 'help' for routine index.`);
      }
    }

    function append(html) {
      const line = document.createElement("div");
      line.style.marginBottom = "6px";
      line.innerHTML = html;
      logs.appendChild(line);
      logs.scrollTop = logs.scrollHeight;
    }
  }
}

/* ==========================================================================
   10. CINEMATIC TEXT FADE-IN OBSERVER
   ========================================================================== */
function initTextFadeInAnimation() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Auto-detect and tag editorial headings, paragraphs, and cards if not already tagged
  const textSelectors = [
    ".section-tag-pill",
    ".section-heading-serif",
    ".section-sub-editorial",
    ".lead-quote",
    ".philosophy-narrative",
    ".philosophy-core-axiom",
    ".forest-tag",
    ".forest-title",
    ".forest-lead",
    ".forest-highlight",
    ".forest-text",
    ".identity-card",
    ".dossier-card",
    ".logistics-item",
    ".dimension-card",
    ".sponsor-tier-card",
    ".alliance-card",
    ".partner-cta-banner",
    ".faq-accordion-item",
    ".climax-heading",
    ".climax-supporting",
    ".climax-actions-row",
    ".footer-brand-col",
    ".footer-links-col"
  ];

  const candidateElements = document.querySelectorAll(textSelectors.join(", "));

  candidateElements.forEach((el, index) => {
    // Add base fade-in animation class if not already present
    if (!el.classList.contains("fade-in-on-scroll")) {
      el.classList.add("fade-in-on-scroll");
    }

    // Add staggered rhythm delay for adjacent sibling elements in grids
    const parent = el.parentElement;
    if (parent && (parent.classList.contains("identities-grid") ||
                   parent.classList.contains("partner-dimensions-grid") ||
                   parent.classList.contains("logistics-grid") ||
                   parent.classList.contains("dossier-stack"))) {
      const childIndex = Array.from(parent.children).indexOf(el);
      const delayClass = `fade-delay-${(childIndex % 4) + 1}`;
      el.classList.add(delayClass);
    }
  });

  const targets = document.querySelectorAll(".fade-in-on-scroll");

  if (prefersReduced) {
    targets.forEach(el => el.classList.add("is-visible"));
    return;
  }

  // IntersectionObserver to smoothly reveal text as user scrolls through the sanctuary
  const textObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target); // Animate once cleanly
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
  });

  targets.forEach(el => {
    // If element is already in initial viewport, show immediately with a gentle stagger
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setTimeout(() => {
        el.classList.add("is-visible");
      }, 150);
    } else {
      textObserver.observe(el);
    }
  });
}

/* ==========================================================================
   11. CUSTOM INTERACTIVE CURSOR & MAGNETIC BUTTON SYSTEM
   ========================================================================== */
function initCustomCursor() {
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (!dot || !ring) return;

  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  if (isTouch) return;

  // Suppress the native OS cursor now that the custom one is taking over.
  document.documentElement.classList.add("has-custom-cursor");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let isMoving = false;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isMoving) {
      isMoving = true;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    }
    // Direct dot tracking
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  }, { passive: true });

  // Bind to the document, not window: "mouseleave" on window barely ever
  // fires (the pointer has to leave the whole browser chrome). Using
  // mouseout with a relatedTarget check on documentElement correctly
  // detects the cursor leaving the actual page content.
  document.addEventListener("mouseout", (e) => {
    if (!e.relatedTarget) {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    }
  });
  document.addEventListener("mouseover", () => {
    dot.style.opacity = "1";
    ring.style.opacity = "1";
  });

  // Smooth lerp (interpolation) for trailing ring
  function renderCursorRing() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(renderCursorRing);
  }
  requestAnimationFrame(renderCursorRing);

  // Magnetic attraction and hover state on interactive elements.
  // Delegated on document so elements added later (FAQ list, dossier
  // cards, etc. rendered by other init functions) are still picked up
  // without needing to re-run this setup.
  const HOVER_SELECTOR = "a, button, .dossier-card, .identity-card, .faq-trigger, .hero-convergence-stage";
  const MAGNETIC_SELECTOR = ".interactive-magnetic-btn, .btn-primary-vermilion, .btn-nav-vermilion";

  document.addEventListener("mouseover", (e) => {
    const el = e.target.closest(HOVER_SELECTOR);
    if (el) document.body.classList.add("cursor-hover");
  });

  document.addEventListener("mouseout", (e) => {
    const el = e.target.closest(HOVER_SELECTOR);
    if (!el) return;
    // Only clear once the pointer has actually left this element
    // (not just moved between its children).
    if (el.contains(e.relatedTarget)) return;
    document.body.classList.remove("cursor-hover");
    if (el.matches(MAGNETIC_SELECTOR)) el.style.transform = "";
  });

  document.addEventListener("mousemove", (e) => {
    const el = e.target.closest(MAGNETIC_SELECTOR);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate3d(${relX * 0.22}px, ${relY * 0.22}px, 0)`;
  }, { passive: true });
}

/* ==========================================================================
   12. NUMBER INTERPOLATION (COUNT-UP ANIMATION)
   ========================================================================== */
function initNumberInterpolation() {
  const elements = document.querySelectorAll(".interpolate-number");
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateNumber(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  elements.forEach((el) => observer.observe(el));

  function animateNumber(el) {
    const target = parseFloat(el.getAttribute("data-count") || "0");
    const duration = 1400; // ms
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Quintic ease out for editorial precision
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentVal = Math.round(target * easeOut);
      el.textContent = currentVal;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }
}

/* ==========================================================================
   13. LINE DRAWING ANIMATION FOR SVG MOTIFS
   ========================================================================== */
function initLineDrawing() {
  // Apply line drawing classes to signature circles in section 1 and climax
  const sigCircles = document.querySelectorAll(".sig-circle, .climax-circle");
  sigCircles.forEach((circle, i) => {
    circle.classList.add("line-draw-active");
    circle.style.transitionDelay = `${i * 0.15}s`;
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const lines = entry.target.querySelectorAll(".line-draw-active");
        lines.forEach(l => l.classList.add("drawn"));
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  const badges = document.querySelectorAll(".four-circles-signature-badge, .climax-circles-wrap");
  badges.forEach(b => observer.observe(b));
}

/* ==========================================================================
   14. SCROLL-LINKED MOVEMENT & TRANSFORM INTERPOLATION
   ========================================================================== */
function initScrollLinkedParallax() {
  const sunriseLayer = document.getElementById("sunriseLayer");

  // Hero depth used to get a simple two-plane parallax here; that's
  // been replaced by the fuller pinned handoff in initHeroWorldTransition,
  // which drives the same two elements (plus the depth field) as part
  // of one coordinated timeline instead of an independent scrub.

  // Sunrise ambient glow: a soft opacity + drift lift across the first
  // stretch of scroll — the "warming into daylight" beat, now expressed
  // as transform/opacity (GPU-friendly) instead of a recomputed
  // background-gradient string on every scroll tick.
  if (sunriseLayer) {
    environmentalTransition(
      sunriseLayer,
      { opacity: 1, y: 40, scale: 1.08 },
      { trigger: document.body, start: "top top", end: "+=1800", scrub: true }
    );
  }
}

/* ==========================================================================
   15. SECTION NUMBER MORPHING ANIMATION (Scale + Blur + Position Interpolation)
   ========================================================================== */
function initSectionNumberMorphing() {
  const tracker = document.getElementById("sectionSystemTracker");
  const morphNum = document.getElementById("trackerMorphNum");
  const secName = document.getElementById("trackerSecName");
  if (!tracker || !morphNum || !secName) return;

  // System section index map
  const systemSections = [
    { id: "hero", num: "00", name: "ORIGIN // GATEWAY" },
    { id: "why-ikigai", num: "01", name: "PHILOSOPHY" },
    { id: "contrast", num: "02", name: "THE CONTRAST" },
    { id: "identities", num: "03", name: "ECOSYSTEM" },
    { id: "journey", num: "04", name: "THE JOURNEY" },
    { id: "vectors", num: "05", name: "VECTORS" },
    { id: "details", num: "06", name: "SPECIFICATIONS" },
    { id: "partners", num: "07", name: "PARTNERS" },
    { id: "faq", num: "08", name: "DIRECTORY" },
    { id: "climax", num: "09", name: "CONVERGENCE" }
  ];

  let currentSecIndex = 0;
  let isMorphing = false;

  // Wrap numbers in in-section tag pills for coordinated in-place morphing
  const tagPills = document.querySelectorAll(".section-tag-pill, .forest-tag");
  tagPills.forEach((pill) => {
    const text = pill.textContent.trim();
    const match = text.match(/^(\d{2})(\s*\/\/\s*)(.*)$/);
    if (match) {
      pill.innerHTML = `<span class="pill-morph-num">${match[1]}</span>${match[2]}${match[3]}`;
    }
  });

  // Observe active sections for number transitions
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        const foundIndex = systemSections.findIndex(s => s.id === id);
        if (foundIndex !== -1 && foundIndex !== currentSecIndex) {
          const isForward = foundIndex > currentSecIndex;
          morphSectionNumber(systemSections[foundIndex], isForward);
          currentSecIndex = foundIndex;

          // Also pulse in-section pill number if present
          const currentPillNum = entry.target.querySelector(".pill-morph-num");
          if (currentPillNum) {
            currentPillNum.classList.remove("pill-morph-active");
            void currentPillNum.offsetWidth; // Force reflow
            currentPillNum.classList.add("pill-morph-active");
          }
        }
      }
    });
  }, {
    threshold: 0.28,
    rootMargin: "-10% 0px -40% 0px"
  });

  systemSections.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) sectionObserver.observe(el);
  });

  // Show tracker HUD when scrolled past initial hero peak — reads from
  // the shared scroll-progress broadcaster instead of its own listener.
  let trackerIsActive = false;
  onScrollProgress(({ scrollY }) => {
    const shouldBeActive = scrollY > 160;
    if (shouldBeActive === trackerIsActive) return;
    trackerIsActive = shouldBeActive;
    tracker.classList.toggle("is-active", trackerIsActive);
  });

  // Core Morphing Algorithm: Scale + Blur + Position Interpolation
  function morphSectionNumber(targetSec, isForward) {
    if (isMorphing) return;
    isMorphing = true;

    // Step 1: Animate current number OUT with scale down, blur, and vertical displacement
    const outClass = isForward ? "morph-out-up" : "morph-out-down";
    const inClass = isForward ? "morph-in-down" : "morph-in-up";

    morphNum.classList.add(outClass);
    secName.style.opacity = "0";

    setTimeout(() => {
      // Step 2: Swap number text at apex of blur
      morphNum.textContent = targetSec.num;
      secName.textContent = targetSec.name;

      // Position new number ready to morph in from opposite side with expansion
      morphNum.classList.remove(outClass);
      morphNum.classList.add(inClass);

      // Force render cycle
      void morphNum.offsetWidth;

      // Step 3: Interpolate IN to scale(1), zero blur, crisp position
      morphNum.classList.remove(inClass);
      secName.style.opacity = "1";

      setTimeout(() => {
        isMorphing = false;
      }, 550);
    }, 240);
  }
}

/* ==========================================================================
   16. EDITORIAL CONSOLE GREETING
   ========================================================================== */
function logEditorialConsoleBanner() {
  console.log(
    "%c[ IKIGAI.DELHI // FIND WHAT DRIVES YOU. BUILD WHAT MATTERS. ]",
    "font-family: serif; font-size: 14px; font-weight: bold; color: #B6533C;"
  );
  console.log(
    "%cA space where passion meets ability, purpose meets action, and ideas become meaningful.\nInspecting the source? Pure ES6. Zero bloat. Built with care.",
    "font-family: sans-serif; font-size: 11px; color: #8A9E93;"
  );
  console.log(
    "%cInquiries: contact@ikigai.delhi",
    "font-family: sans-serif; font-size: 11px; color: #F0EDE6;"
  );
}