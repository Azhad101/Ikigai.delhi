/**
 * IKIGAI — MOTION ENGINE (Foundation)
 * ============================================================================
 * The shared motion layer the rest of the "travel, not scroll" experience
 * builds on. This module owns:
 *
 *   1. Smooth scrolling      — Lenis, tied into one shared GSAP ticker.
 *   2. Scroll progress       — one master ScrollTrigger broadcasts to any
 *                              number of subscribers instead of every
 *                              component attaching its own scroll listener.
 *   3. Animation utilities   — reveal / parallaxLayer / pin /
 *                              environmentalTransition: small, reusable,
 *                              GPU-friendly (transform + opacity only)
 *                              building blocks. Nothing in this file
 *                              renders a specific section's design —
 *                              it only provides the machinery.
 *   4. Reduced motion        — every utility below checks `motion.reducedMotion`
 *                              and settles instantly to the "arrived" state
 *                              instead of animating.
 *
 * Deliberately NOT in this file: pinned "chapter" scenes, environmental art,
 * or anything section-specific. This is the engine, not the scenery — those
 * get built on top of it in the next phase.
 *
 * Degrades gracefully: if GSAP/ScrollTrigger/Lenis fail to load (CDN
 * blocked, offline, etc.), the site falls back to plain native scroll with
 * no scroll-linked animation rather than throwing errors.
 * ============================================================================
 */

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

export const motion = {
  reducedMotion: reducedMotionQuery.matches,
  ready: false,
  lenis: null,
};

// Keep the flag live if the OS-level preference changes mid-session.
if (reducedMotionQuery.addEventListener) {
  reducedMotionQuery.addEventListener("change", (e) => {
    motion.reducedMotion = e.matches;
  });
}

/* ==========================================================================
   SCROLL PROGRESS BROADCASTER
   Components subscribe via onScrollProgress(cb) instead of adding their
   own `scroll` listener. One ScrollTrigger computes progress once per
   frame; every subscriber just reads the result.
   ========================================================================== */
const subscribers = new Set();

export function onScrollProgress(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback); // unsubscribe
}

function broadcast(data) {
  subscribers.forEach((cb) => {
    try {
      cb(data);
    } catch (err) {
      console.error("[Ikigai Motion] scroll-progress subscriber threw:", err);
    }
  });
}

/* ==========================================================================
   ENGINE INITIALIZATION
   Call once, before any component wires up scroll-linked behavior.
   ========================================================================== */
export function initMotionEngine() {
  const gsapLib = window.gsap;
  const ScrollTriggerLib = window.ScrollTrigger;
  const LenisLib = window.Lenis;

  if (!gsapLib || !ScrollTriggerLib) {
    // Graceful degradation: no GSAP means no scroll-linked animation, but
    // the site must still work — fall back to a plain native-scroll
    // progress broadcast so any subscribers still get *something*.
    console.warn("[Ikigai Motion] GSAP/ScrollTrigger did not load — continuing with native scroll only.");
    window.addEventListener(
      "scroll",
      () => {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        broadcast({ scrollY: window.scrollY, progress: docH > 0 ? window.scrollY / docH : 0 });
      },
      { passive: true }
    );
    motion.ready = true;
    return motion;
  }

  gsapLib.registerPlugin(ScrollTriggerLib);

  // Smooth scrolling — skipped entirely under reduced motion, so scrolling
  // stays instant/native for anyone who has asked the OS for that.
  if (!motion.reducedMotion && LenisLib) {
    try {
      const lenis = new LenisLib({
        duration: 1.05, // fluid, not sluggish — a light lift, not a delay
        easing: (t) => 1 - Math.pow(1 - t, 3), // ease-out cubic: quick to respond, soft to settle
        smoothWheel: true,
        anchors: true, // keep nav/footer "#section" links working mid-scroll
        autoRaf: false, // driven by gsap.ticker below — one shared clock, not two rAF loops
      });

      lenis.on("scroll", ScrollTriggerLib.update);
      gsapLib.ticker.add((time) => lenis.raf(time * 1000));
      gsapLib.ticker.lagSmoothing(0);

      motion.lenis = lenis;
    } catch (err) {
      console.warn("[Ikigai Motion] Lenis failed to initialize — continuing with native scroll.", err);
    }
  }

  // One master ScrollTrigger spans the whole document and broadcasts
  // progress. However many components subscribe, this is the only
  // full-document scroll computation running per frame.
  ScrollTriggerLib.create({
    start: 0,
    end: () => document.documentElement.scrollHeight - window.innerHeight,
    onUpdate: (self) => {
      broadcast({ scrollY: window.scrollY, progress: self.progress });
    },
  });

  motion.ready = true;
  return motion;
}

/* ==========================================================================
   ANIMATION UTILITIES
   GPU-friendly (transform + opacity only). Every utility resolves
   instantly to its end state under reduced motion instead of animating.
   ========================================================================== */

/**
 * reveal — fade + rise an element (or set of elements) into place the
 * first time it enters the viewport. Batches cleanly: pass a selector,
 * NodeList, or array and every match gets its own trigger.
 */
export function reveal(targets, options = {}) {
  const gsapLib = window.gsap;
  const ScrollTriggerLib = window.ScrollTrigger;
  if (!gsapLib || !ScrollTriggerLib) return;

  const els = gsapLib.utils.toArray(targets);
  if (!els.length) return;

  const { y = 28, duration = 0.9, ease = "power3.out", stagger = 0, start = "top 88%" } = options;

  if (motion.reducedMotion) {
    gsapLib.set(els, { opacity: 1, y: 0 });
    return;
  }

  gsapLib.set(els, { opacity: 0, y });
  els.forEach((el, i) => {
    gsapLib.to(el, {
      opacity: 1,
      y: 0,
      duration,
      ease,
      delay: stagger ? i * stagger : 0,
      scrollTrigger: {
        trigger: el,
        start,
        once: true,
      },
    });
  });
}

/**
 * parallaxLayer — scroll-scrubbed translateY for one depth plane.
 * `rate` controls how far the element drifts relative to the scroll
 * distance across its trigger: small rate = distant/background,
 * larger rate = closer/foreground. Purely transform-driven.
 */
export function parallaxLayer(target, options = {}) {
  const gsapLib = window.gsap;
  const ScrollTriggerLib = window.ScrollTrigger;
  if (!gsapLib || !ScrollTriggerLib || motion.reducedMotion) return null;

  const { rate = 0.3, trigger = null, scrub = true, start = "top bottom", end = "bottom top" } = options;

  return gsapLib.to(target, {
    y: () => (trigger || target).offsetHeight * rate * -1,
    ease: "none",
    scrollTrigger: {
      trigger: trigger || target,
      start,
      end,
      scrub,
      invalidateOnRefresh: true,
    },
  });
}

/**
 * pin — hold a section in the viewport while its internal timeline plays
 * out, then release into normal scroll. Reserved for pinned "chapter"
 * moments; see pinnedSequence below for the version with an attached
 * scrubbed timeline (what the hero → philosophy handoff uses).
 */
export function pin(target, options = {}) {
  const ScrollTriggerLib = window.ScrollTrigger;
  if (!ScrollTriggerLib || motion.reducedMotion) return null;

  const { start = "top top", end = "+=100%", pinSpacing = true, scrub = false } = options;

  return ScrollTriggerLib.create({
    trigger: target,
    start,
    end,
    pin: true,
    pinSpacing,
    scrub,
    anticipatePin: 1,
  });
}

/**
 * pinnedSequence — pin `target` for a fixed scroll distance and scrub a
 * GSAP timeline across it. `build(tl)` receives the (empty) timeline to
 * populate with tweens; positions are plain fractions (0 = the moment
 * the pin engages, 1 = the moment it releases), so callers can lay out
 * overlapping beats without reasoning about real seconds. Reduced
 * motion skips the pin entirely — callers should make sure the target's
 * resting CSS state is already the "arrived" one, same convention as
 * every other utility in this file.
 */
export function pinnedSequence(target, build, options = {}) {
  const gsapLib = window.gsap;
  const ScrollTriggerLib = window.ScrollTrigger;
  if (!gsapLib || !ScrollTriggerLib || motion.reducedMotion) return null;

  const { start = "top top", end = "+=100%", scrub = 1, pinSpacing = true } = options;

  const tl = gsapLib.timeline({
    scrollTrigger: {
      trigger: target,
      start,
      end,
      scrub,
      pin: true,
      pinSpacing,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  build(tl);
  return tl;
}

/**
 * environmentalTransition — scrub a small set of GPU-friendly properties
 * (opacity, y, scale) on an ambient/atmosphere layer across a scroll
 * range, for cross-section light or mood handoffs. Deliberately does not
 * accept arbitrary CSS (no background/gradient recomputation) — that's
 * the difference between an "environmental transition" and a paint cost.
 */
export function environmentalTransition(target, vars = {}, options = {}) {
  const gsapLib = window.gsap;
  const ScrollTriggerLib = window.ScrollTrigger;
  if (!gsapLib || !ScrollTriggerLib) return null;

  if (motion.reducedMotion) {
    gsapLib.set(target, vars);
    return null;
  }

  const { trigger = null, start = "top top", end = "bottom top", scrub = true } = options;

  return gsapLib.to(target, {
    ...vars,
    ease: "none",
    scrollTrigger: {
      trigger: trigger || target,
      start,
      end,
      scrub,
    },
  });
}
