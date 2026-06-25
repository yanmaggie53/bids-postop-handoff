import { timelinePhases } from "../data/placeholder.js";

// Tall, scroll-through workflow visualization.
//
// One continuous winding "snake" made of three connected phases, each in its
// own color. The path draws in as you scroll, and nodes pop in as the drawn
// length reaches them. The middle (handoff) phase contains a `proposed` step
// that expands into place once that phase enters view.

const svgNS = "http://www.w3.org/2000/svg";

const VIEW_W = 600;
// Vertical space allotted to each node along the snake.
const NODE_GAP = 230;
const TOP_PAD = 120;
const BOTTOM_PAD = 140;
// Horizontal extremes of the winding path.
const X_LEFT = 150;
const X_RIGHT = 450;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Build a smooth winding path through a list of {x, y} points using cubic
// segments with vertical control handles (gives the snake its rounded bends).
function buildPath(points) {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const cy = (p0.y + p1.y) / 2;
    d += ` C ${p0.x} ${cy}, ${p1.x} ${cy}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export function initTimeline() {
  const sticky = document.getElementById("timeline-sticky");
  const section = document.getElementById("timeline");
  if (!sticky || !section) return;

  // Flatten phases into an ordered list of nodes, alternating x to make the
  // snake wind left/right down the canvas.
  const nodes = [];
  timelinePhases.forEach((phase, phaseIndex) => {
    phase.steps.forEach((step) => {
      nodes.push({ ...step, phase, phaseIndex });
    });
  });

  // Assign positions. Each node gets a row; x alternates between left/right.
  // We compute two layouts: "current" (proposed steps collapsed onto their
  // predecessor and hidden) and "proposed" (proposed steps occupy their own
  // row, pushing everything below them down).
  function layout(includeProposed) {
    const placed = [];
    let row = 0;
    nodes.forEach((node) => {
      if (node.proposed && !includeProposed) {
        // Collapse onto the previous node's position (hidden).
        const prev = placed[placed.length - 1];
        placed.push({ node, x: prev.x, y: prev.y, row: prev.row, collapsed: true });
        return;
      }
      const x = row % 2 === 0 ? X_LEFT : X_RIGHT;
      const y = TOP_PAD + row * NODE_GAP;
      placed.push({ node, x, y, row, collapsed: false });
      row++;
    });
    const totalRows = row;
    const height = TOP_PAD + (totalRows - 1) * NODE_GAP + BOTTOM_PAD;
    return { placed, height };
  }

  const layoutCurrent = layout(false);
  const layoutProposed = layout(true);
  // The SVG must be tall enough for the larger (proposed) layout.
  const VIEW_H = layoutProposed.height;

  // SVG setup. It is tall; the section scrolls through it.
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEW_W} ${VIEW_H}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMin meet");
  svg.setAttribute("class", "tl-svg");

  // Two layers: paths/titles beneath, nodes on top.
  const layerPaths = document.createElementNS(svgNS, "g");
  const layerNodes = document.createElementNS(svgNS, "g");
  svg.append(layerPaths, layerNodes);

  // Build node DOM.
  const nodeEls = nodes.map((node) => {
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "tl-node" + (node.proposed ? " is-proposed" : ""));

    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("r", "16");
    circle.setAttribute("fill", node.phase.color);

    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("class", "tl-node__label");
    label.textContent = node.label;

    const detail = document.createElementNS(svgNS, "text");
    detail.setAttribute("class", "tl-node__detail");
    detail.textContent = node.detail;

    g.append(circle, label, detail);
    layerNodes.appendChild(g);
    return { g, circle, label, detail, node };
  });

  // Phase title labels (inline, near the first node of each phase).
  const phaseTitleEls = timelinePhases.map((phase) => {
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "tl-phase-title");

    const title = document.createElementNS(svgNS, "text");
    title.setAttribute("class", "tl-phase-title__name");
    title.setAttribute("fill", phase.color);
    title.textContent = phase.title;

    const where = document.createElementNS(svgNS, "text");
    where.setAttribute("class", "tl-phase-title__where");
    where.textContent = phase.where;

    g.append(title, where);
    layerPaths.appendChild(g);
    return { g, title, where, phase };
  });

  sticky.appendChild(svg);

  // morph 0 -> current layout, 1 -> proposed layout. reveal 0..1 = draw-in.
  let morph = 0;
  let reveal = 0;

  // Pre-create per-phase path elements (bg + fg) on top of node layer order.
  const pathEls = timelinePhases.map((phase) => {
    const bg = document.createElementNS(svgNS, "path");
    bg.setAttribute("class", "tl-path-bg");
    const fg = document.createElementNS(svgNS, "path");
    fg.setAttribute("class", "tl-path-fg");
    fg.setAttribute("stroke", phase.color);
    // Insert paths beneath nodes.
    layerPaths.append(bg, fg);
    return { bg, fg, phase };
  });

  // Build the full ordered point list at a given morph, plus per-phase point
  // groups so we can color each phase separately. Phases connect because the
  // first point of a phase equals the last drawn point of the previous one.
  function computePoints(m) {
    const pts = nodeEls.map(({ node }, i) => {
      const c = layoutCurrent.placed[i];
      const p = layoutProposed.placed[i];
      return {
        x: lerp(c.x, p.x, m),
        y: lerp(c.y, p.y, m),
        node,
        collapsed: c.collapsed && p.collapsed,
      };
    });
    return pts;
  }

  function render() {
    const pts = computePoints(morph);
    const totalHeight = VIEW_H;

    // Group points by phase, chaining the boundary point so segments connect.
    let cursor = 0;
    timelinePhases.forEach((phase, pi) => {
      const count = phase.steps.length;
      const slice = pts.slice(cursor, cursor + count);
      cursor += count;

      // Connect to previous phase's last point for continuity.
      const connectPts =
        pi > 0 ? [pts[cursor - count - 1], ...slice] : slice;

      const d = buildPath(connectPts.map((p) => ({ x: p.x, y: p.y })));
      const { bg, fg } = pathEls[pi];
      bg.setAttribute("d", d);
      fg.setAttribute("d", d);

      // Draw-in per phase based on overall reveal mapped to this phase's band.
      const len = fg.getTotalLength ? fg.getTotalLength() : 0;
      const phaseStart = pi / timelinePhases.length;
      const phaseEnd = (pi + 1) / timelinePhases.length;
      const local = Math.max(
        0,
        Math.min(1, (reveal - phaseStart) / (phaseEnd - phaseStart))
      );
      fg.style.strokeDasharray = `${len}`;
      fg.style.strokeDashoffset = `${len * (1 - local)}`;
    });

    // Position + reveal nodes.
    nodeEls.forEach((el, i) => {
      const p = pts[i];
      el.g.setAttribute("transform", `translate(${p.x}, ${p.y})`);

      const tY = (p.y - TOP_PAD) / (VIEW_H - TOP_PAD - BOTTOM_PAD);
      const reached = reveal >= tY - 0.02;

      if (el.node.proposed) {
        const grow = Math.min(1, morph * 1.4);
        el.circle.setAttribute("r", `${lerp(0, 16, grow)}`);
        el.g.style.opacity = String((reached ? 1 : 0.12) * grow);
      } else {
        el.g.style.opacity = reached ? "1" : "0.12";
      }

      // Place label opposite the bend direction so it doesn't overlap the path.
      const onRight = p.x >= (X_LEFT + X_RIGHT) / 2;
      const dx = onRight ? -26 : 26;
      const anchor = onRight ? "end" : "start";
      el.label.setAttribute("x", dx);
      el.label.setAttribute("y", -4);
      el.label.setAttribute("text-anchor", anchor);
      el.detail.setAttribute("x", dx);
      el.detail.setAttribute("y", 16);
      el.detail.setAttribute("text-anchor", anchor);
    });

    // Phase titles near each phase's first node.
    let idx = 0;
    phaseTitleEls.forEach((pt, pi) => {
      const firstPoint = pts[idx];
      idx += timelinePhases[pi].steps.length;
      const x = 40;
      const y = firstPoint.y - 70;
      pt.g.setAttribute("transform", `translate(${x}, ${y})`);
      pt.title.setAttribute("y", 0);
      pt.where.setAttribute("y", 22);

      const phaseStart = pi / timelinePhases.length;
      pt.g.style.opacity = reveal >= phaseStart - 0.04 ? "1" : "0.12";
    });
  }

  render();

  // Drive `reveal` and `morph` from scroll progress through the section.
  function onScroll() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    // Progress: 0 when section top hits viewport top, 1 when bottom reaches
    // viewport bottom. Tuned so the draw-in spans most of the scroll.
    const total = rect.height - vh;
    const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
    const progress = total > 0 ? scrolled / total : 0;

    reveal = Math.min(1, progress * 1.05);

    // Start morphing the proposed step in once the middle phase is reaching.
    const morphStart = 0.34;
    const morphEnd = 0.5;
    morph = Math.min(
      1,
      Math.max(0, (progress - morphStart) / (morphEnd - morphStart))
    );

    render();
  }

  let ticking = false;
  function requestRender() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    }
  }

  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", requestRender);
  onScroll();
}
