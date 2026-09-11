/**
 * IKIGAI — VISUAL DEPTH SYSTEM
 * ============================================================================
 * Drives the scroll-linked motion for the fixed .depth-field backdrop
 * (see the "VISUAL DEPTH SYSTEM" block in style.css and the markup at
 * the top of index.html for the five layers this animates).
 *
 * Design intent: depth reads from CONTRAST in how much each plane
 * moves — not from how many things are on screen. So this file moves
 * very few elements, and moves them by deliberately different amounts:
 *
 *   Layer 2 (distant ridge)     — barely drifts   (far)
 *   Layer 3 (midground lines)   — drifts a little more
 *   Layer 4 (Ikigai mark)       — drifts the most of the "layers"
 *   Layer 5 (foreground motes)  — each mote has its own rate, so they
 *                                  visibly separate from one another
 *                                  as well as from everything behind them
 *
 * Layer 1 (the void + its glow) and layer 5's vignette are intentionally
 * left out of this file entirely — they never receive a scroll-driven
 * transform. That stillness is as much a part of the depth effect as
 * the motion is.
 *
 * Every scroll-linked write here is a single `translate3d`, applied
 * directly (no CSS transition on the same property — see the note on
 * .sunrise-ambient-layer in style.css for why that would fight the
 * per-frame scrub). Independent, non-scroll motion (the glow's breathing,
 * the mark's slow rotation, each mote's float) is pure CSS animation and
 * needs nothing from this file to keep running smoothly.
 * ============================================================================
 */

import { motion, onScrollProgress } from "./motion.js";

// Full-page drift range (in px) for each layer, far → near. Small,
// deliberately non-uniform numbers — this is a backdrop seen across the
// entire scroll journey, not a per-section effect, so a little goes a
// long way.
const LAYER_RANGES = {
  depthL2: 14,
  depthL3: 44,
  depthL4: 72,
};

// Foreground motes each carry their own data-rate (0–1); this is the
// px range a rate of 1.0 would represent, so individual motes end up
// spread across roughly 30–80px — visibly more responsive than any of
// the layers behind them.
const MOTE_BASE_RANGE = 230;

// How much stronger each plane's drift gets at the peak of the hero
// handoff boost (see bindHeroBoost) — kept differential on purpose so
// the "foreground moves faster than background" read holds even in
// this one intensified moment: the four-circle stage's own scale/blur
// already carries the closest plane, so the field's job here is the
// midground and far layers plus the motes racing past behind it.
const LAYER_BOOST_SCALE = 3.2;
const MOTE_BOOST_SCALE = 5.5;

// Temporary multiplier applied only across the hero's pinned scroll
// handoff (see bindHeroBoost / initHeroWorldTransition in script.js).
// Traces a hump — 0 at the start of the handoff, peaks mid-way, back
// to 0 by the time it releases — so every later section still sees
// the field's normal, barely-there baseline drift.
let heroBoost = 0;

/**
 * bindHeroBoost — ties `heroBoost` to the same scroll range the hero's
 * own pinned timeline runs across, so the whole backdrop visibly
 * accelerates through that one handoff instead of drifting at its
 * usual whole-page rate. Purely a value producer: initDepthField's
 * existing per-frame loop is what actually reads it and writes the
 * transforms, so there's still only one write per element per frame.
 */
export function bindHeroBoost(triggerEl, options = {}) {
  const gsapLib = window.gsap;
  const ScrollTriggerLib = window.ScrollTrigger;
  if (!gsapLib || !ScrollTriggerLib || motion.reducedMotion || !triggerEl) return;

  const { start = "top top", end = "+=100%" } = options;

  ScrollTriggerLib.create({
    trigger: triggerEl,
    start,
    end,
    scrub: true,
    onUpdate: (self) => {
      heroBoost = Math.sin(Math.min(Math.max(self.progress, 0), 1) * Math.PI);
    },
    onLeaveBack: () => { heroBoost = 0; },
  });
}

/**
 * initDepthThread — draws the single connecting path (see .depth-thread
 * in style.css / #depthThread in index.html) in as the user scrolls,
 * via stroke-dashoffset, and gives its wrapper a slow rotate + drift so
 * it never sits still as a static decoration. This is the "recurring
 * line/path" visual thread called for alongside the light source
 * (layer 1's glow), the recurring geometric form (layer 4's mark) and
 * the atmospheric particles (layer 5's motes) — all four persist,
 * unbroken, across every section.
 */
export function initDepthThread() {
  const wrap = document.getElementById("depthThread");
  const path = document.getElementById("depthThreadPath");
  if (!wrap || !path) return;

  if (motion.reducedMotion) {
    // Fully drawn and still — reads as ambient geometry, not motion.
    path.style.strokeDasharray = "none";
    return;
  }

  let length = 0;
  try {
    length = path.getTotalLength();
  } catch (err) {
    return; // getTotalLength unsupported/failed — leave the path undrawn rather than throw.
  }
  if (!length) return;

  path.style.strokeDasharray = `${length}`;
  path.style.strokeDashoffset = `${length}`;

  onScrollProgress(({ progress }) => {
    const p = Math.min(Math.max(progress, 0), 1);
    // Draws in across the first ~85% of the page, then holds fully
    // drawn — the thread has "arrived" a little before the very end,
    // rather than finishing exactly on the last pixel of scroll.
    const drawP = Math.min(p / 0.85, 1);
    path.style.strokeDashoffset = `${length * (1 - drawP)}`;
    // A slow, small rotate + vertical drift — just enough that the
    // thread reads as something the camera is moving past, not a
    // fixed watermark.
    wrap.style.transform = `translate3d(0, ${(-p * 60).toFixed(2)}px, 0) rotate(${(p * 3.2).toFixed(2)}deg)`;
  });
}

export function initDepthField() {
  const field = document.getElementById("depthField");
  if (!field) return;

  // Under reduced motion the field holds still by design — it still
  // reads as an atmospheric backdrop, it just never moves.
  if (motion.reducedMotion) return;

  const targets = [];

  Object.keys(LAYER_RANGES).forEach((id) => {
    const el = document.getElementById(id);
    if (el) targets.push({ el, range: LAYER_RANGES[id], boostScale: LAYER_BOOST_SCALE });
  });

  document.querySelectorAll(".depth-mote-wrap").forEach((wrap) => {
    const moteEl = wrap.querySelector(".depth-mote");
    const rate = moteEl ? parseFloat(moteEl.dataset.rate) : NaN;
    targets.push({
      el: wrap,
      range: (Number.isFinite(rate) ? rate : 0.2) * MOTE_BASE_RANGE,
      boostScale: MOTE_BOOST_SCALE,
    });
  });

  if (!targets.length) return;

  onScrollProgress(({ progress }) => {
    const p = Math.min(Math.max(progress, 0), 1);
    for (let i = 0; i < targets.length; i++) {
      const { el, range, boostScale } = targets[i];
      const effectiveRange = range * (1 + heroBoost * boostScale);
      el.style.transform = `translate3d(0, ${(-p * effectiveRange).toFixed(2)}px, 0)`;
    }
  });
}
