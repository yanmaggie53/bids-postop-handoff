import { timelinePhases } from "../data/placeholder.js";

// Tall, scroll-through workflow visualization.
//
// One continuous winding "snake" made of three connected phases, each in its
// own color. The path draws in as you scroll, and nodes pop in as the drawn
// length reaches them.
//
// The PROPOSED workflow adds extra nodes (flagged `proposed`). They are hidden
// by default; each has its own discrete toggle (a small chevron) at its spot in
// the snake. Clicking a toggle reveals just that node and the snake stretches to
// make room; clicking again hides it.

const svgNS = "http://www.w3.org/2000/svg";

// The viewBox is wide so labels have room on the OUTER sides of the snake,
// away from the central winding zone.
const VIEW_W = 900;
// Vertical space allotted to each node along the snake. Generous because some
// node details wrap to several lines.
const NODE_GAP = 280;
const TOP_PAD = 130;
const BOTTOM_PAD = 160;
// Horizontal extremes of the winding path. Kept near the center so the snake
// occupies a narrow middle band, leaving wide margins for text on both sides.
const X_LEFT = 330;
const X_RIGHT = 570;
// How far node labels sit from their node, measured outward toward the margin.
const LABEL_OFFSET = 34;
// How far phase titles (phases 2 & 3) sit outside the snake band edge.
const TITLE_BAND_GAP = 20;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Greedily wrap a string into lines of at most `maxChars` characters.
function wrapText(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  return lines;
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

  // Flatten phases into an ordered list of nodes.
  const nodes = [];
  timelinePhases.forEach((phase, phaseIndex) => {
    phase.steps.forEach((step) => {
      nodes.push({ ...step, phase, phaseIndex });
    });
  });

  // Which proposed nodes are currently toggled ON.
  const enabled = new Set();

  // Compute layout for a given set of enabled proposed nodes. Proposed nodes
  // that are OFF collapse onto the previous visible row (so they take no space);
  // ON proposed nodes occupy their own row and push everything below them down.
  function layoutFor(enabledSet) {
    const placed = [];
    let row = 0;
    nodes.forEach((node) => {
      const hidden = node.proposed && !enabledSet.has(node.id);
      if (hidden) {
        const prev = placed[placed.length - 1];
        placed.push({
          node,
          x: prev ? prev.x : X_LEFT,
          y: prev ? prev.y : TOP_PAD,
          row: prev ? prev.row : 0,
          collapsed: true,
        });
        return;
      }
      const x = row % 2 === 0 ? X_LEFT : X_RIGHT;
      const y = TOP_PAD + row * NODE_GAP;
      placed.push({ node, x, y, row, collapsed: false });
      row++;
    });
    const totalRows = row;
    const height = TOP_PAD + Math.max(0, totalRows - 1) * NODE_GAP + BOTTOM_PAD;
    return { placed, height };
  }

  // SVG viewBox height tracks the current layout (shrinks when proposed nodes
  // are toggled off, expands when they're on).
  let viewH = layoutFor(enabled).height;

  // Current and target positions per node (for animating toggles).
  let current = layoutFor(enabled).placed.map((p) => ({ x: p.x, y: p.y, collapsed: p.collapsed }));
  let target = current.map((p) => ({ ...p }));

  // SVG setup. Height is driven by `viewH` and updates as toggles change.
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEW_W} ${viewH}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMin meet");
  svg.setAttribute("class", "tl-svg");

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
    const detailLines = wrapText(node.detail, 34);
    const detailSpans = detailLines.map((lineText, li) => {
      const tspan = document.createElementNS(svgNS, "tspan");
      tspan.textContent = lineText;
      tspan.setAttribute("dy", li === 0 ? "0" : "1.25em");
      detail.appendChild(tspan);
      return tspan;
    });

    g.append(circle, label, detail);
    layerNodes.appendChild(g);
    return { g, circle, label, detail, detailSpans, node };
  });

  // Toggle markers: one per proposed node. A discrete chevron sitting on the
  // snake that the user clicks to reveal/hide that proposed step.
  const toggleEls = nodes
    .map((node, i) => ({ node, i }))
    .filter(({ node }) => node.proposed)
    .map(({ node, i }) => {
      const g = document.createElementNS(svgNS, "g");
      g.setAttribute("class", "tl-toggle");
      g.setAttribute("role", "button");
      g.setAttribute("tabindex", "0");
      g.setAttribute("aria-label", `Toggle proposed step: ${node.label}`);

      // Hit area (invisible, generous) for easy clicking.
      const hit = document.createElementNS(svgNS, "circle");
      hit.setAttribute("r", "16");
      hit.setAttribute("fill", "transparent");

      // Small ring + chevron so it's discoverable but discrete.
      const ring = document.createElementNS(svgNS, "circle");
      ring.setAttribute("r", "11");
      ring.setAttribute("class", "tl-toggle__ring");
      ring.setAttribute("stroke", node.phase.color);

      const chevron = document.createElementNS(svgNS, "path");
      chevron.setAttribute("class", "tl-toggle__chevron");
      chevron.setAttribute("stroke", node.phase.color);

      g.append(hit, ring, chevron);
      layerNodes.appendChild(g);

      const toggle = () => {
        if (enabled.has(node.id)) enabled.delete(node.id);
        else enabled.add(node.id);
        animateToLayout();
      };
      g.addEventListener("click", toggle);
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });

      return { g, ring, chevron, node, index: i };
    });

  // Phase title labels.
  const phaseTitleEls = timelinePhases.map((phase) => {
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "tl-phase-title");

    const title = document.createElementNS(svgNS, "text");
    title.setAttribute("class", "tl-phase-title__name");
    title.setAttribute("fill", phase.color);
    const titleLines = wrapText(phase.title, 16);
    const titleSpans = titleLines.map((lineText, li) => {
      const tspan = document.createElementNS(svgNS, "tspan");
      tspan.textContent = lineText;
      tspan.setAttribute("dy", li === 0 ? "0" : "1.15em");
      title.appendChild(tspan);
      return tspan;
    });

    const where = document.createElementNS(svgNS, "text");
    where.setAttribute("class", "tl-phase-title__where");
    where.textContent = phase.where;

    g.append(title, where);
    layerPaths.appendChild(g);
    return { g, title, titleSpans, where, titleLineCount: titleLines.length, phase };
  });

  sticky.appendChild(svg);

  let reveal = 0;

  // Per-phase path elements (bg track + fg draw-in).
  const pathEls = timelinePhases.map((phase) => {
    const bg = document.createElementNS(svgNS, "path");
    bg.setAttribute("class", "tl-path-bg");
    const fg = document.createElementNS(svgNS, "path");
    fg.setAttribute("class", "tl-path-fg");
    fg.setAttribute("stroke", phase.color);
    layerPaths.append(bg, fg);
    return { bg, fg, phase };
  });

  // For a collapsed (hidden) proposed node, find where its toggle marker should
  // sit: midway between the previous visible node and the next visible node.
  function markerPosition(i, positions) {
    // previous visible node (any earlier node that isn't a collapsed proposed)
    let prevK = -1;
    for (let k = i - 1; k >= 0; k--) {
      if (!positions[k].collapsed) {
        prevK = k;
        break;
      }
    }
    // next visible node
    let nextK = -1;
    for (let k = i + 1; k < positions.length; k++) {
      if (!positions[k].collapsed) {
        nextK = k;
        break;
      }
    }
    const prev = prevK >= 0 ? positions[prevK] : null;
    const next = nextK >= 0 ? positions[nextK] : null;

    // If several collapsed markers share this same gap, distribute them evenly
    // along the segment so they don't stack on top of one another.
    const lo = prevK; // exclusive lower bound
    const hi = nextK >= 0 ? nextK : positions.length; // exclusive upper bound
    const siblings = [];
    for (let k = lo + 1; k < hi; k++) {
      if (positions[k].collapsed) siblings.push(k);
    }
    const order = Math.max(0, siblings.indexOf(i));
    const count = Math.max(1, siblings.length);
    // Fraction from prev->next: spread markers at (order+1)/(count+1).
    const f = (order + 1) / (count + 1);

    if (prev && next) {
      return { x: lerp(prev.x, next.x, f), y: lerp(prev.y, next.y, f) };
    }
    if (prev) return { x: prev.x, y: prev.y + NODE_GAP * f };
    if (next) return { x: next.x, y: next.y - NODE_GAP * (1 - f) };
    return { x: X_LEFT, y: TOP_PAD };
  }

  function render() {
    const positions = current;
    svg.setAttribute("viewBox", `0 0 ${VIEW_W} ${viewH}`);

    // Group points by phase, chaining the boundary point so segments connect.
    // Collapsed (hidden) proposed nodes are skipped from the path.
    let cursor = 0;
    timelinePhases.forEach((phase, pi) => {
      const count = phase.steps.length;
      const sliceIdx = [];
      for (let k = 0; k < count; k++) sliceIdx.push(cursor + k);
      cursor += count;

      // Visible points for this phase.
      const visibleIdx = sliceIdx.filter((k) => !positions[k].collapsed);
      // Connect to the previous phase's last visible point.
      let connectIdx = visibleIdx;
      if (pi > 0) {
        for (let k = cursor - count - 1; k >= 0; k--) {
          if (!positions[k].collapsed) {
            connectIdx = [k, ...visibleIdx];
            break;
          }
        }
      }
      const connectPts = connectIdx.map((k) => ({ x: positions[k].x, y: positions[k].y }));

      const d = buildPath(connectPts);
      const { bg, fg } = pathEls[pi];
      bg.setAttribute("d", d);
      fg.setAttribute("d", d);

      const len = fg.getTotalLength ? fg.getTotalLength() : 0;
      const phaseStart = pi / timelinePhases.length;
      const phaseEnd = (pi + 1) / timelinePhases.length;
      const local = Math.max(0, Math.min(1, (reveal - phaseStart) / (phaseEnd - phaseStart)));
      fg.style.strokeDasharray = `${len}`;
      fg.style.strokeDashoffset = `${len * (1 - local)}`;
    });

    const drawableH = viewH - TOP_PAD - BOTTOM_PAD;

    // Position + reveal nodes.
    nodeEls.forEach((el, i) => {
      const p = positions[i];
      el.g.setAttribute("transform", `translate(${p.x}, ${p.y})`);

      const tY = (p.y - TOP_PAD) / drawableH;
      const reached = reveal >= tY - 0.02;
      const hiddenProposed = el.node.proposed && p.collapsed;

      // A collapsed proposed node is invisible (its toggle marker stands in).
      el.g.style.display = hiddenProposed ? "none" : "";
      el.g.style.opacity = hiddenProposed ? "0" : reached ? "1" : "0.12";

      const onRight = p.x >= (X_LEFT + X_RIGHT) / 2;
      const dx = onRight ? LABEL_OFFSET : -LABEL_OFFSET;
      const anchor = onRight ? "start" : "end";
      el.label.setAttribute("x", dx);
      el.label.setAttribute("y", -8);
      el.label.setAttribute("text-anchor", anchor);
      el.detail.setAttribute("y", 12);
      el.detail.setAttribute("text-anchor", anchor);
      el.detailSpans.forEach((tspan) => tspan.setAttribute("x", dx));
    });

    // Position toggle markers + set their open/closed visual state.
    toggleEls.forEach((t) => {
      const isOn = enabled.has(t.node.id);
      const p = positions[t.index];
      // When ON, sit on the node; when OFF, sit at the insertion midpoint.
      const pos = isOn ? { x: p.x, y: p.y } : markerPosition(t.index, positions);

      // Offset the marker slightly off the node so it doesn't cover it when on.
      const onRight = pos.x >= (X_LEFT + X_RIGHT) / 2;
      const ox = isOn ? (onRight ? -26 : 26) : 0;
      t.g.setAttribute("transform", `translate(${pos.x + ox}, ${pos.y})`);

      // Chevron: down (v) when closed (click to expand), up (^) when open.
      t.chevron.setAttribute(
        "d",
        isOn ? "M -5 3 L 0 -3 L 5 3" : "M -5 -3 L 0 3 L 5 -3"
      );
      t.g.classList.toggle("is-on", isOn);

      // Hide the marker entirely until its part of the snake has been revealed.
      const tY = (pos.y - TOP_PAD) / drawableH;
      const reached = reveal >= tY - 0.02;
      t.g.style.opacity = reached ? "1" : "0";
      t.g.style.pointerEvents = reached ? "auto" : "none";
    });

    // Phase titles.
    let idx = 0;
    phaseTitleEls.forEach((pt, pi) => {
      // First *visible* node of this phase.
      let firstK = idx;
      const phaseCount = timelinePhases[pi].steps.length;
      for (let k = idx; k < idx + phaseCount; k++) {
        if (!positions[k].collapsed) {
          firstK = k;
          break;
        }
      }
      idx += phaseCount;
      const firstPoint = positions[firstK];

      const firstOnRight = firstPoint.x >= (X_LEFT + X_RIGHT) / 2;
      const anchor = firstOnRight ? "end" : "start";
      let x;
      if (pi === 0) {
        const sign = firstOnRight ? -1 : 1;
        x = firstPoint.x + sign * 15;
      } else {
        x = firstOnRight ? X_LEFT - TITLE_BAND_GAP : X_RIGHT + TITLE_BAND_GAP;
      }
      const titleHeight = pt.titleLineCount * 23;
      const y = firstPoint.y - 24 - titleHeight;

      pt.g.setAttribute("transform", `translate(${x}, ${y})`);
      pt.title.setAttribute("x", 0);
      pt.title.setAttribute("y", 0);
      pt.title.setAttribute("text-anchor", anchor);
      pt.titleSpans.forEach((tspan) => tspan.setAttribute("x", 0));
      pt.where.setAttribute("x", 0);
      pt.where.setAttribute("y", titleHeight + 4);
      pt.where.setAttribute("text-anchor", anchor);

      const phaseStart = pi / timelinePhases.length;
      pt.g.style.opacity = reveal >= phaseStart - 0.04 ? "1" : "0.12";
    });
  }

  // Animate node positions toward the layout for the current `enabled` set.
  let raf = null;
  function animateToLayout() {
    const nextLayout = layoutFor(enabled);
    target = nextLayout.placed.map((p) => ({ x: p.x, y: p.y, collapsed: p.collapsed }));
    const targetViewH = nextLayout.height;

    // Snap collapsed flags immediately for nodes that just turned ON so they
    // animate in from their predecessor; keep them collapsed-hidden when OFF.
    const start = current.map((p) => ({ ...p }));
    const startViewH = viewH;
    // Starting position for a node newly turning on: its predecessor's spot.
    target.forEach((t, i) => {
      if (!t.collapsed && start[i].collapsed) {
        // begin the animation from where the collapsed marker was
        const m = markerPosition(i, start);
        start[i] = { x: m.x, y: m.y, collapsed: false };
      }
    });

    cancelAnimationFrame(raf);
    const t0 = performance.now();
    const dur = 520;
    const ease = (x) => 1 - Math.pow(1 - x, 3);

    function tick(now) {
      const k = Math.min(1, (now - t0) / dur);
      const e = ease(k);
      current = target.map((t, i) => ({
        x: lerp(start[i].x, t.x, e),
        y: lerp(start[i].y, t.y, e),
        // Reveal as soon as we start (so it animates), hide only when fully off.
        collapsed: t.collapsed,
      }));
      viewH = lerp(startViewH, targetViewH, e);
      render();
      if (k < 1) raf = requestAnimationFrame(tick);
      else viewH = targetViewH;
    }
    raf = requestAnimationFrame(tick);
  }

  render();

  // Drive `reveal` from scroll progress through the section.
  function onScroll() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height - vh;
    const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
    const progress = total > 0 ? scrolled / total : 0;
    reveal = Math.min(1, progress * 1.05);
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
