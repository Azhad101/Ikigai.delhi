/**
 * IKIGAI — THE HACKATHON JOURNEY (one continuous scene, six states)
 * ============================================================================
 * Replaces a six/seven-card checklist with a single environment that keeps
 * transforming as the visitor scrolls. Same particle field throughout —
 * only its arrangement, motion, and connective structure change:
 *
 *   0. DISCOVER    — the environment opens. A wide, loose, drifting
 *                     scatter of light with no order imposed on it yet.
 *   1. DEFINE      — the scatter narrows. Points pull inward and settle
 *                     around a single focal axis — attention sharpening.
 *   2. BUILD       — geometry appears. The focused points snap onto a
 *                     precise grid, wired with straight structural lines —
 *                     the first technical scaffolding.
 *   3. COLLABORATE — the grid's isolated points start reaching across to
 *                     each other — clusters form and draw connecting arcs,
 *                     a visible collaboration graph.
 *   4. PRESENT     — the network opens back up: wider, taller, brighter —
 *                     a confident, outward composition instead of a
 *                     huddle.
 *   5. IMPACT       — every point converges toward one bright, still
 *                     source at center — the arc's destination.
 *
 * Copy for each stage is read from data/schedule.js (operatingSequence) —
 * the same factual descriptions used elsewhere on the site — so nothing
 * about dates, prizes, rules, sponsors, or judges is introduced here.
 *
 * Pinned via CSS `position: sticky` (see .hack-journey in style.css), not
 * a GSAP pin/spacer — progress is read directly from layout
 * (getBoundingClientRect) inside one rAF loop, matching journey.js's
 * approach so it stays smooth under Lenis or plain native scroll alike.
 * ============================================================================
 */

import { motion } from "./motion.js";
import { operatingSequence } from "./data/schedule.js";

const STAGE_COUNT = 6; // discover, define, build, collaborate, present, impact
const MAX_P = STAGE_COUNT - 1;

// One color per stage — lerped continuously as progress moves between
// them. Cooler/looser early, warming and brightening toward the finale.
const STAGE_COLORS = [
  { r: 138, g: 158, b: 147 }, // discover    — muted forest-grey (open, undefined)
  { r: 200, g: 169, b: 107 }, // define      — gold (focus sharpening)
  { r: 226, g: 219, b: 208 }, // build       — cool ivory (structure, precision)
  { r: 200, g: 169, b: 107 }, // collaborate — gold (warm connective energy)
  { r: 223, g: 202, b: 152 }, // present     — bright gold (confident, open)
  { r: 182, g: 83, b: 60 },   // impact      — vermilion (arrival)
];
const GLOW_RADIUS_RATIO = [0.56, 0.34, 0.3, 0.34, 0.42, 0.3];
const GLOW_ALPHA = [0.1, 0.08, 0.06, 0.09, 0.14, 0.24];

const GOLDEN_ANGLE = 2.399963229728653;
const COLLAB_CLUSTERS = 6;

function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function triangleWeight(p, center, width) { return Math.max(0, 1 - Math.abs(p - center) / width); }
function lerpColorString(a, b, t, alpha) {
  const r = Math.round(lerp(a.r, b.r, t));
  const g = Math.round(lerp(a.g, b.g, t));
  const b2 = Math.round(lerp(a.b, b.b, t));
  return `rgba(${r}, ${g}, ${b2}, ${alpha})`;
}

/* ---- per-stage layout generators — each returns {x, y} in canvas
   space centered on (0, 0); the renderer adds the canvas midpoint. ---- */

// DISCOVER — wide, loose, organic scatter. Nothing is ordered yet; the
// environment simply "opens" and points drift with soft independence.
function discoverLayout(i, n, scale, seed) {
  const angle = i * GOLDEN_ANGLE + seed * 0.6;
  let r = scale * 0.46 * Math.sqrt((i + 0.5) / n);
  r *= 1 + 0.22 * Math.sin(angle * 2.4 + seed * Math.PI * 2);
  return { x: r * Math.cos(angle), y: r * Math.sin(angle) * 0.82 };
}

// DEFINE — the same scatter pulled inward toward a single focal axis.
// Still organic, but the spread has visibly narrowed: attention
// sharpening rather than structure appearing yet.
function defineLayout(i, n, scale, seed) {
  const angle = i * GOLDEN_ANGLE + seed * 0.6;
  let r = scale * 0.2 * Math.sqrt((i + 0.5) / n);
  r *= 1 + 0.12 * Math.sin(angle * 3 + seed * Math.PI * 2);
  return { x: r * Math.cos(angle), y: r * Math.sin(angle) * 0.9 };
}

// BUILD — precise grid. The first genuinely geometric/technical layout:
// points snap to rows and columns, structure replacing the organic drift.
function buildLayout(i, n, scale) {
  const cols = Math.ceil(Math.sqrt(n * 1.5));
  const rows = Math.ceil(n / cols);
  const spacing = (scale * 0.62) / Math.max(cols, rows);
  const col = i % cols;
  const row = Math.floor(i / cols);
  return { x: (col - (cols - 1) / 2) * spacing, y: (row - (rows - 1) / 2) * spacing };
}

// COLLABORATE — the grid's points regroup into clusters that reach
// toward one another; the renderer draws arcs between cluster centers,
// so isolated structure becomes a visible connective network.
function collabClusterCenters(scale) {
  const centers = [];
  for (let h = 0; h < COLLAB_CLUSTERS; h++) {
    const angle = (h / COLLAB_CLUSTERS) * Math.PI * 2 + 0.35;
    const radius = scale * (h % 2 === 0 ? 0.28 : 0.17);
    centers.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) * 0.8 });
  }
  return centers;
}
function collabLayout(i, n, scale, seed, clusters) {
  const clusterIndex = i % COLLAB_CLUSTERS;
  const cluster = clusters[clusterIndex];
  const localIndex = Math.floor(i / COLLAB_CLUSTERS);
  const localCount = Math.max(1, Math.ceil(n / COLLAB_CLUSTERS));
  const angle = localIndex * GOLDEN_ANGLE + seed * Math.PI * 2;
  const r = scale * 0.05 * Math.sqrt((localIndex + 0.5) / localCount);
  return { x: cluster.x + r * Math.cos(angle), y: cluster.y + r * Math.sin(angle) };
}

// PRESENT — the composition opens back up: wide, tall, symmetrical, and
// brighter — a confident, outward-facing arrangement rather than a huddle.
function presentLayout(i, n, scale, seed) {
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const col = i % cols;
  const row = Math.floor(i / cols);
  const rowT = row / Math.max(1, rows - 1);
  const fan = (col - (cols - 1) / 2) / cols;
  const x = fan * scale * (0.5 + rowT * 0.66) + (seed - 0.5) * scale * 0.02;
  const y = scale * 0.36 - rowT * scale * 0.62;
  return { x, y };
}

// IMPACT — full convergence onto one still, bright point: the arc's
// destination. Every point resolves onto (or very near) the center.
function impactLayout(i, n, seed) {
  const angle = i * GOLDEN_ANGLE + seed * Math.PI * 2;
  const settleRadius = 0.012;
  return { x: settleRadius * Math.cos(angle), y: settleRadius * Math.sin(angle) };
}

/**
 * createScene — builds the persistent particle set and returns a small
 * controller: { render(progress, clock), resize() }. `progress` is a
 * float 0..STAGE_COUNT-1 (0 = fully "discover", 5 = fully "impact").
 */
function createScene(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  const count = isCoarse ? 140 : 240;
  const particles = Array.from({ length: count }, () => ({
    seed: Math.random(),
    jitter: Math.random() * Math.PI * 2,
    r: 1.2 + Math.random() * 1.5,
  }));

  let width = 0, height = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let clusters = collabClusterCenters(1);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    clusters = collabClusterCenters(Math.min(width, height));
  }
  resize();

  // stagePoint — the one place every stage's layout gets resolved to a
  // concrete {x, y} for a given particle, all in the same coordinate space.
  function stagePoint(stageIdx, i, scale) {
    const seed = particles[i].seed;
    switch (stageIdx) {
      case 0: return discoverLayout(i, count, scale, seed);
      case 1: return defineLayout(i, count, scale, seed);
      case 2: return buildLayout(i, count, scale);
      case 3: return collabLayout(i, count, scale, seed, clusters);
      case 4: return presentLayout(i, count, scale, seed);
      case 5: return impactLayout(i, seed);
      default: return { x: 0, y: 0 };
    }
  }

  function render(progress, clock) {
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);

    const p = Math.min(Math.max(progress, 0), MAX_P);
    const segment = Math.min(Math.floor(p), STAGE_COUNT - 2);
    const t = easeInOutCubic(p - segment);
    const scale = Math.min(width, height);
    const cx = width / 2, cy = height / 2;

    const pointAt = (i) => {
      const a = stagePoint(segment, i, scale);
      const b = stagePoint(segment + 1, i, scale);
      return { x: cx + lerp(a.x, b.x, t), y: cy + lerp(a.y, b.y, t) };
    };

    // Ambient glow wash — wide and faint for "discover", tight and
    // brilliant by "impact" — reinforces the mood shift without
    // repainting the site's own fixed depth-field behind it.
    const glowColor = lerpColorString(
      STAGE_COLORS[segment], STAGE_COLORS[segment + 1], t,
      lerp(GLOW_ALPHA[segment], GLOW_ALPHA[segment + 1], t)
    );
    const glowRadius = scale * lerp(GLOW_RADIUS_RATIO[segment], GLOW_RADIUS_RATIO[segment + 1], t);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, glowRadius));
    grad.addColorStop(0, glowColor);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const buildWeight = triangleWeight(p, 2, 1);
    const collabWeight = triangleWeight(p, 3, 1);
    const presentWeight = triangleWeight(p, 4, 1);
    const impactWeight = Math.max(0, Math.min(1, p - 4));

    // BUILD — structural grid lines (nearest horizontal/vertical
    // neighbours only), faded in and back out around stage 2.
    if (buildWeight > 0.02) {
      const cols = Math.ceil(Math.sqrt(count * 1.5));
      ctx.strokeStyle = `rgba(226, 219, 208, ${0.16 * buildWeight})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const a = pointAt(i);
        if ((i + 1) % cols !== 0 && i + 1 < count) {
          const b = pointAt(i + 1);
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        }
        if (i + cols < count) {
          const b = pointAt(i + cols);
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        }
      }
      ctx.stroke();
    }

    // COLLABORATE — cluster-to-cluster arcs, echoing a live
    // collaboration graph rather than a static grid.
    if (collabWeight > 0.02) {
      ctx.strokeStyle = `rgba(200, 169, 107, ${0.22 * collabWeight})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let h = 0; h < COLLAB_CLUSTERS; h++) {
        const cur = clusters[h];
        const next = clusters[(h + 1) % COLLAB_CLUSTERS];
        const curP = { x: cur.x + cx, y: cur.y + cy };
        const nextP = { x: next.x + cx, y: next.y + cy };
        const midX = (curP.x + nextP.x) / 2;
        const midY = (curP.y + nextP.y) / 2 - scale * 0.03;
        ctx.moveTo(curP.x, curP.y);
        ctx.quadraticCurveTo(midX, midY, nextP.x, nextP.y);
      }
      ctx.stroke();
    }

    // PRESENT — wide, faint horizon line beneath the open fan —
    // a stage, not a huddle.
    if (presentWeight > 0.02) {
      ctx.strokeStyle = `rgba(223, 202, 152, ${0.16 * presentWeight})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - scale * 0.4 * presentWeight, cy + scale * 0.34);
      ctx.lineTo(cx + scale * 0.4 * presentWeight, cy + scale * 0.34);
      ctx.stroke();
    }

    // IMPACT — a single expanding ring marking the point of arrival.
    if (impactWeight > 0.02) {
      const ringR = scale * (0.05 + impactWeight * 0.1);
      ctx.strokeStyle = `rgba(182, 83, 60, ${0.35 * impactWeight})`;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Particles. Idle drift shrinks to near-zero by "impact" — the
    // environment settling into stillness at the journey's destination.
    for (let i = 0; i < count; i++) {
      const pt = pointAt(i);
      const particle = particles[i];
      const idleAmp = scale * 0.007 * (1 - impactWeight * 0.85);
      const idleX = Math.sin(clock * 0.6 + particle.jitter) * idleAmp;
      const idleY = Math.cos(clock * 0.5 + particle.jitter * 1.3) * idleAmp;
      const color = lerpColorString(STAGE_COLORS[segment], STAGE_COLORS[segment + 1], t, 1);
      const glow = 3 + impactWeight * 9;
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = glow;
      ctx.arc(pt.x + idleX, pt.y + idleY, particle.r * (1 + impactWeight * 0.35), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  return { render, resize };
}

// STAGE_META — the eyebrow label + title styling for each of the six
// beats. `phase`/`action` text itself comes from operatingSequence
// (data/schedule.js) at render time, not hardcoded here, so the copy
// stays in sync with the single factual source used across the site.
const STAGE_META = [
  { code: "01 // THE FIELD OPENS" },
  { code: "02 // THE FIELD FOCUSES" },
  { code: "03 // THE FIELD BUILDS STRUCTURE" },
  { code: "04 // THE FIELD CONNECTS" },
  { code: "05 // THE FIELD OPENS OUTWARD" },
  { code: "THE ARRIVAL" },
];

function buildStageMarkup() {
  return operatingSequence.slice(0, STAGE_COUNT).map((stage, i) => {
    const meta = STAGE_META[i] || { code: `0${i + 1}` };
    const isLast = i === STAGE_COUNT - 1;
    return `
      <div class="hack-journey__stage" data-hj-stage="${i}">
        <span class="hack-journey__num">${meta.code}</span>
        <h3 class="hack-journey__title${isLast ? " hack-journey__title--impact" : ""}">${stage.phase}</h3>
        <p class="hack-journey__desc">${stage.action}</p>
      </div>
    `;
  }).join("");
}

function buildRailMarkup() {
  return Array.from({ length: STAGE_COUNT }, (_, i) =>
    `<span class="hack-journey__rail-dot${i === 0 ? " is-active" : ""}" data-hj-rail="${i}"></span>`
  ).join("");
}

/**
 * initHackathonJourney — wires the sticky frame markup (see index.html)
 * to the scene above. Progress comes from the wrapper's own scroll
 * position, not a global broadcaster, since this needs a fraction
 * *within* one tall element rather than across the whole page.
 */
export function initHackathonJourney() {
  const wrapper = document.getElementById("hackJourney");
  const canvas = document.getElementById("hackJourneyCanvas");
  const stagesHost = document.getElementById("hackJourneyStages");
  const railHost = document.getElementById("hackJourneyRail");
  if (!wrapper || !canvas || !stagesHost || !railHost) return;
  if (!operatingSequence || operatingSequence.length < STAGE_COUNT) return;

  stagesHost.innerHTML = buildStageMarkup();
  railHost.innerHTML = buildRailMarkup();

  const stages = Array.from(stagesHost.querySelectorAll("[data-hj-stage]"));
  const railDots = Array.from(railHost.querySelectorAll("[data-hj-rail]"));
  const cue = document.getElementById("hackJourneyCue");

  const scene = createScene(canvas);
  if (!scene) return;

  function paintStages(p) {
    stages.forEach((el, i) => {
      const dist = Math.abs(p - i);
      const opacity = Math.max(0, 1 - dist * 1.7);
      el.style.opacity = opacity.toFixed(3);
      el.style.transform = `translateY(calc(-50% + ${(14 - opacity * 14).toFixed(1)}px))`;
    });
    railDots.forEach((dot, i) => dot.classList.toggle("is-active", i === Math.round(p)));
    if (cue) cue.style.opacity = p < 0.08 ? "1" : "0";
  }

  // Reduced motion: skip the pinned scroll-scene entirely and lay out
  // all six stages as a plain static stack instead. Collapsing onto
  // just the final "impact" text (the pattern used by the philosophy
  // section's own reduced-motion path) would hide five of six stages
  // that each carry distinct process information the visitor still
  // needs — a scene simplification is fine here, content loss isn't.
  if (motion.reducedMotion) {
    wrapper.classList.add("hack-journey--static");
    scene.resize();
    scene.render(MAX_P, 0);
    stages.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    railDots.forEach((dot, i) => dot.classList.toggle("is-active", i === STAGE_COUNT - 1));
    if (cue) cue.style.display = "none";
    return;
  }

  function readProgress() {
    const rect = wrapper.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return 1;
    return Math.min(1, Math.max(0, -rect.top / total));
  }

  // Only run the rAF loop while the journey is anywhere near the
  // viewport — this is a long page, and nothing here needs to draw
  // while it's scrolled far out of view.
  let active = false;
  const observer = new IntersectionObserver(
    (entries) => { active = entries[0].isIntersecting; },
    { rootMargin: "25% 0px 25% 0px" }
  );
  observer.observe(wrapper);

  function frame(now) {
    if (active) {
      const p = readProgress() * MAX_P;
      scene.render(p, now / 1000);
      paintStages(p);
    }
    requestAnimationFrame(frame);
  }

  const initialP = readProgress() * MAX_P;
  scene.render(initialP, 0);
  paintStages(initialP);
  requestAnimationFrame(frame);

  window.addEventListener(
    "resize",
    () => {
      scene.resize();
      const p = readProgress() * MAX_P;
      scene.render(p, performance.now() / 1000);
      paintStages(p);
    },
    { passive: true }
  );
}
