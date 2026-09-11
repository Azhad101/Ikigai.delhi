/**
 * IKIGAI — THE JOURNEY (one field, five states)
 * ============================================================================
 * Replaces a four-card grid with a single continuously-transforming
 * particle field. The same particles reshape as the visitor scrolls:
 *
 *   0. LOVE     — an organic, golden-angle bloom. Loose, warm, alive.
 *   1. SKILL    — the same points snap into a precise grid, wired with
 *                 straight structural lines.
 *   2. WORLD    — the grid reaches outward into a hub-and-spoke network —
 *                 clusters of points converging on shared centers.
 *   3. REWARD   — the network lifts into an ascending, widening fan —
 *                 expansion, upward motion, brightening glow.
 *   4. PURPOSE  — every particle resolves onto the site's own four-circle
 *                 Ikigai mark (see the hero SVG / .signature-svg — same
 *                 top / right / bottom / left layout), so the finale
 *                 reads as the same emblem, not a new shape. The moment
 *                 the four groups overlap is the moment they read as one.
 *
 * Pinned via CSS `position: sticky` (see .ikigai-journey in style.css),
 * not a GSAP pin/spacer — so progress is read directly from layout
 * (getBoundingClientRect) inside one rAF loop. That keeps it smooth
 * under Lenis or plain native scroll alike, and needs nothing from
 * motion.js to degrade gracefully if a CDN script fails to load.
 * ============================================================================
 */

import { motion } from "./motion.js";

const STAGE_COUNT = 5; // love, skill, world, reward, purpose
const MAX_P = STAGE_COUNT - 1;

// One color per stage — lerped continuously as progress moves between them.
const STAGE_COLORS = [
  { r: 182, g: 83, b: 60 },   // love    — vermilion
  { r: 200, g: 169, b: 107 }, // skill   — gold
  { r: 226, g: 219, b: 208 }, // world   — cool ivory
  { r: 223, g: 202, b: 152 }, // reward  — bright gold
  { r: 182, g: 83, b: 60 },   // purpose — vermilion (the mark)
];
const GLOW_RADIUS_RATIO = [0.5, 0.3, 0.36, 0.3, 0.34];
const GLOW_ALPHA = [0.16, 0.07, 0.1, 0.17, 0.22];

const GOLDEN_ANGLE = 2.399963229728653;
const WORLD_HUBS = 7;

// Top / right / bottom / left — identical arrangement to the hero's
// four-circle SVG, so the convergence reads as the *same* mark.
const PURPOSE_CENTERS = [
  { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 },
];

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

function loveLayout(i, n, scale, seed) {
  const angle = i * GOLDEN_ANGLE;
  let r = scale * 0.32 * Math.sqrt((i + 0.5) / n);
  r *= 1 + 0.14 * Math.sin(angle * 3 + seed * Math.PI * 2);
  return { x: r * Math.cos(angle), y: r * Math.sin(angle) * 0.84 };
}

function skillLayout(i, n, scale) {
  const cols = Math.ceil(Math.sqrt(n * 1.5));
  const rows = Math.ceil(n / cols);
  const spacing = (scale * 0.66) / Math.max(cols, rows);
  const col = i % cols;
  const row = Math.floor(i / cols);
  return { x: (col - (cols - 1) / 2) * spacing, y: (row - (rows - 1) / 2) * spacing };
}

function worldHubCenters(scale) {
  const centers = [];
  for (let h = 0; h < WORLD_HUBS; h++) {
    const angle = (h / WORLD_HUBS) * Math.PI * 2 + 0.3;
    const radius = scale * (h % 2 === 0 ? 0.3 : 0.19);
    centers.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) * 0.82 });
  }
  return centers;
}

function worldLayout(i, n, scale, seed, hubs) {
  const hubIndex = i % WORLD_HUBS;
  const hub = hubs[hubIndex];
  const localIndex = Math.floor(i / WORLD_HUBS);
  const localCount = Math.max(1, Math.ceil(n / WORLD_HUBS));
  const angle = localIndex * GOLDEN_ANGLE + seed * Math.PI * 2;
  const r = scale * 0.055 * Math.sqrt((localIndex + 0.5) / localCount);
  return { x: hub.x + r * Math.cos(angle), y: hub.y + r * Math.sin(angle) };
}

function rewardLayout(i, n, scale, seed) {
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const col = i % cols;
  const row = Math.floor(i / cols);
  const rowT = row / Math.max(1, rows - 1);
  const fan = (col - (cols - 1) / 2) / cols;
  const x = fan * scale * (0.42 + rowT * 0.7) + (seed - 0.5) * scale * 0.015;
  const y = scale * 0.32 - rowT * scale * 0.68;
  return { x, y };
}

function purposeLayout(i, n) {
  const groups = 4;
  const group = i % groups;
  const perGroup = Math.max(1, Math.ceil(n / groups));
  const idx = Math.floor(i / groups);
  const angle = (idx / perGroup) * Math.PI * 2 + group * 0.7;
  return { group, idx, perGroup, angle };
}

/**
 * createParticleField — builds the persistent particle set and returns
 * a small controller: { render(progress, clock), resize() }. `progress`
 * is a float 0..STAGE_COUNT-1 (0 = fully "love", 4 = fully "purpose").
 */
function createParticleField(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  const count = isCoarse ? 130 : 230;
  const particles = Array.from({ length: count }, () => ({
    seed: Math.random(),
    jitter: Math.random() * Math.PI * 2,
    r: 1.2 + Math.random() * 1.5,
  }));

  let width = 0, height = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let hubs = worldHubCenters(1);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    hubs = worldHubCenters(Math.min(width, height));
  }
  resize();

  // stagePoint — the one place every stage's layout gets resolved to a
  // concrete {x, y} for a given particle. Purpose (stage 4) needs the
  // resolved scale/offset centers, computed here rather than baked into
  // purposeLayout, so it stays in the same coordinate space as the rest.
  function stagePoint(stageIdx, i, scale) {
    const seed = particles[i].seed;
    switch (stageIdx) {
      case 0: return loveLayout(i, count, scale, seed);
      case 1: return skillLayout(i, count, scale);
      case 2: return worldLayout(i, count, scale, seed, hubs);
      case 3: return rewardLayout(i, count, scale, seed);
      case 4: {
        const { group, angle } = purposeLayout(i, count);
        const R = scale * 0.145;
        const D = R * 0.62;
        const c = PURPOSE_CENTERS[group];
        return { x: c.x * D + R * Math.cos(angle), y: c.y * D + R * Math.sin(angle) };
      }
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

    // Ambient glow wash — reinforces the mood shift (wide + warm for
    // "love", tight + bright for "reward"/"purpose") without repainting
    // the site's own fixed depth-field behind it.
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

    const skillWeight = triangleWeight(p, 1, 1);
    const worldWeight = triangleWeight(p, 2, 1);
    const purposeWeight = Math.max(0, Math.min(1, p - 3));

    // Structured grid lines (skill) — nearest horizontal/vertical
    // neighbours only, faded in and back out around stage 1.
    if (skillWeight > 0.02) {
      const cols = Math.ceil(Math.sqrt(count * 1.5));
      ctx.strokeStyle = `rgba(200, 169, 107, ${0.18 * skillWeight})`;
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

    // Network paths (world) — hub-to-hub, echoing a collaboration graph.
    if (worldWeight > 0.02) {
      ctx.strokeStyle = `rgba(240, 237, 230, ${0.16 * worldWeight})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let h = 0; h < WORLD_HUBS; h++) {
        const cur = hubs[h];
        const next = hubs[(h + 1) % WORLD_HUBS];
        const curP = { x: cur.x + cx, y: cur.y + cy };
        const nextP = { x: next.x + cx, y: next.y + cy };
        ctx.moveTo(curP.x, curP.y);
        ctx.lineTo(nextP.x, nextP.y);
      }
      ctx.stroke();
    }

    // Purpose mark — the four faint circle outlines the particles are
    // resolving onto, matching the hero's own SVG mark.
    if (purposeWeight > 0.02) {
      const R = scale * 0.145, D = R * 0.62;
      ctx.strokeStyle = `rgba(182, 83, 60, ${0.3 * purposeWeight})`;
      ctx.lineWidth = 1.25;
      PURPOSE_CENTERS.forEach((c) => {
        ctx.beginPath();
        ctx.arc(cx + c.x * D, cy + c.y * D, R, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

    // Particles.
    for (let i = 0; i < count; i++) {
      const pt = pointAt(i);
      const particle = particles[i];
      const idleAmp = scale * 0.006 * (1 - purposeWeight * 0.75);
      const idleX = Math.sin(clock * 0.6 + particle.jitter) * idleAmp;
      const idleY = Math.cos(clock * 0.5 + particle.jitter * 1.3) * idleAmp;
      const color = lerpColorString(STAGE_COLORS[segment], STAGE_COLORS[segment + 1], t, 1);
      const glow = 3.5 + purposeWeight * 8;
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = glow;
      ctx.arc(pt.x + idleX, pt.y + idleY, particle.r * (1 + purposeWeight * 0.3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  return { render, resize };
}

/**
 * initIkigaiJourney — wires the sticky frame markup (see index.html) to
 * the particle field above. Progress comes from the wrapper's own
 * scroll position, not a global broadcaster, since this needs a
 * fraction *within* one tall element rather than across the whole page.
 */
export function initIkigaiJourney() {
  const wrapper = document.getElementById("ikigaiJourney");
  const canvas = document.getElementById("ikigaiJourneyCanvas");
  const stages = wrapper ? Array.from(wrapper.querySelectorAll("[data-journey-stage]")) : [];
  const railDots = wrapper ? Array.from(wrapper.querySelectorAll("[data-rail]")) : [];
  if (!wrapper || !canvas || !stages.length) return;

  const field = createParticleField(canvas);
  if (!field) return;

  function paintStages(p) {
    stages.forEach((el, i) => {
      const dist = Math.abs(p - i);
      const opacity = Math.max(0, 1 - dist * 1.7);
      el.style.opacity = opacity.toFixed(3);
      el.style.transform = `translateY(calc(-50% + ${(14 - opacity * 14).toFixed(1)}px))`;
      el.style.pointerEvents = opacity > 0.6 ? "auto" : "none";
    });
    railDots.forEach((dot, i) => dot.classList.toggle("is-active", i === Math.round(p)));
  }

  // Reduced motion: settle instantly on the finished convergence — the
  // "arrived" state every other utility in motion.js resolves to.
  if (motion.reducedMotion) {
    field.resize();
    field.render(MAX_P, 0);
    paintStages(MAX_P);
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
      field.render(p, now / 1000);
      paintStages(p);
    }
    requestAnimationFrame(frame);
  }

  const initialP = readProgress() * MAX_P;
  field.render(initialP, 0);
  paintStages(initialP);
  requestAnimationFrame(frame);

  window.addEventListener(
    "resize",
    () => {
      field.resize();
      const p = readProgress() * MAX_P;
      field.render(p, performance.now() / 1000);
      paintStages(p);
    },
    { passive: true }
  );
}
