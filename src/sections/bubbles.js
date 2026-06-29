import { select } from "d3-selection";
import { scaleSqrt } from "d3-scale";
import {
  forceSimulation,
  forceManyBody,
  forceX,
  forceY,
  forceCollide,
} from "d3-force";
import { bubbleCategories } from "../data/placeholder.js";

const WIDTH = 760;
const HEIGHT = 420;

function sumValues(items) {
  return items.reduce((s, d) => s + d.value, 0);
}

// Shared hover tooltip showing how many times a code/sub-theme appeared.
let tooltipEl = null;
function getTooltip() {
  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.className = "bubble-tooltip";
    tooltipEl.setAttribute("role", "status");
    document.body.appendChild(tooltipEl);
  }
  return tooltipEl;
}

function showTooltip(event, d) {
  const tip = getTooltip();
  tip.textContent = `${d.value}`;
  tip.classList.add("is-visible");
  positionTooltip(event);
}

function positionTooltip(event) {
  if (!tooltipEl) return;
  const offset = 14;
  let x = event.clientX;
  let y = event.clientY;

  // Pointer events carry clientX/Y; keyboard focus events don't, so fall back
  // to the focused element's position.
  if (x == null || Number.isNaN(x)) {
    const rect = event.target?.getBoundingClientRect?.();
    if (rect) {
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else {
      x = 0;
      y = 0;
    }
  }

  tooltipEl.style.left = `${x + offset}px`;
  tooltipEl.style.top = `${y + offset}px`;
}

function moveTooltip(event) {
  positionTooltip(event);
}

function hideTooltip() {
  if (tooltipEl) tooltipEl.classList.remove("is-visible");
}

function layoutGrid(nodes, width, height) {
  const n = nodes.length;
  const cols = Math.min(n, Math.ceil(Math.sqrt(n)));
  const rows = Math.ceil(n / cols);
  const padX = 90;
  const padY = 70;
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;

  nodes.forEach((d, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    d.x = padX + (col + 0.5) * (usableW / cols);
    d.y = padY + (row + 0.5) * (usableH / rows);
  });
}

// Wrap a label into lines that each fit within `maxCharsPerLine`, keeping
// whole words together. Returns an array of line strings.
function wrapLabel(label, maxCharsPerLine) {
  const words = label.split(/\s+/);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  return lines;
}

// Pick the largest font size (within bounds) at which the wrapped label fits
// inside a circle of radius `r`. The count is shown on hover, so the label gets
// the full circle interior. Returns { fontSize, lines }.
function fitLabel(label, r) {
  const maxFont = Math.min(26, r * 0.6);
  const minFont = 5;

  // Rough average glyph width factor for the display font.
  const charWidthFactor = 0.56;

  for (let fontSize = maxFont; fontSize >= minFont; fontSize -= 0.5) {
    const lineHeight = fontSize * 1.12;

    // Try progressively narrower wraps; keep the first layout whose farthest
    // corner stays inside the circle. For a vertically centered block, the
    // worst-case point is a top/bottom row's end: sqrt(halfW^2 + halfH^2) <= r.
    const maxChars = Math.max(3, label.length);
    for (let chars = maxChars; chars >= 3; chars--) {
      const lines = wrapLabel(label, chars);
      const widest = Math.max(...lines.map((l) => l.length));
      const halfW = (widest * fontSize * charWidthFactor) / 2;
      const halfH = (lines.length * lineHeight) / 2;
      const corner = Math.sqrt(halfW * halfW + halfH * halfH);

      if (corner <= r * 0.9) {
        return { fontSize, lines };
      }
    }
  }

  const fallbackChars = Math.max(3, Math.floor((r * 1.3) / (minFont * charWidthFactor)));
  return { fontSize: minFont, lines: wrapLabel(label, fallbackChars) };
}

// Build one force-packed bubble chart. `items` is a flat list of { label, value }.
function renderBubbles(
  svg,
  category,
  items,
  { clickable = false, onSelect, instant = false } = {}
) {
  svg.selectAll("*").remove();

  if (items.length === 0) return null;

  const values = items.map((d) => d.value);
  const maxVal = Math.max(...values, 1);
  const radius = scaleSqrt().domain([0, maxVal]).range([34, 92]);

  const nodes = items.map((d) => ({
    ...d,
    r: radius(d.value),
  }));

  // Size the canvas to the bubbles so they never have to overlap. We need at
  // least the combined bubble area (plus spacing + margins); circle packing is
  // ~70% efficient, so divide by that. Width stays fixed to the column; height
  // grows to provide the rest of the room.
  const margin = 60;
  const spacingPad = 8; // matches the collision radius padding
  const packedArea =
    nodes.reduce((s, d) => s + Math.PI * (d.r + spacingPad) ** 2, 0) / 0.5;
  const usableW = WIDTH - margin * 2;
  const neededH = packedArea / usableW + margin * 2;
  const height = Math.max(HEIGHT, Math.ceil(neededH));

  svg.attr("viewBox", `0 0 ${WIDTH} ${height}`);

  const groups = svg
    .selectAll("g.bubble")
    .data(nodes)
    .join("g")
    .attr("class", "bubble")
    .style("cursor", clickable ? "pointer" : "default");

  groups
    .on("mouseenter", (event, d) => showTooltip(event, d))
    .on("mousemove", (event) => moveTooltip(event))
    .on("mouseleave", hideTooltip)
    .on("focus", (event, d) => showTooltip(event, d))
    .on("blur", hideTooltip);

  if (clickable && onSelect) {
    groups.on("click", (_, d) => onSelect(d));
    groups.on("keydown", (event, d) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect(d);
      }
    });
    groups.attr("tabindex", 0).attr("role", "button");
  }

  groups
    .append("circle")
    .attr("r", (d) => d.r)
    .attr("fill", category.accent);

  // Label text: wrapped + font-fitted to fill the whole bubble interior. The
  // count is revealed on hover instead of being printed, leaving more room.
  groups.each(function (d) {
    const g = select(this);
    const { fontSize, lines } = fitLabel(d.label, d.r);
    const lineHeight = fontSize * 1.12;

    const labelBlockH = lines.length * lineHeight;
    const startY = -labelBlockH / 2 + lineHeight * 0.78;

    const label = g
      .append("text")
      .attr("class", "bubble__label")
      .style("font-size", `${fontSize}px`)
      .style("text-anchor", "middle");

    lines.forEach((line, i) => {
      label
        .append("tspan")
        .attr("x", 0)
        .attr("y", startY + i * lineHeight)
        .text(line);
    });
  });

  if (instant) {
    // Seed with a grid, then settle synchronously with a collision force so
    // bubbles never overlap regardless of how many codes there are.
    layoutGrid(nodes, WIDTH, height);

    const settle = forceSimulation(nodes)
      .force("x", forceX(WIDTH / 2).strength(0.05))
      .force("y", forceY(height / 2).strength(0.06))
      .force(
        "collide",
        forceCollide()
          .radius((d) => d.r + spacingPad)
          .iterations(10)
      )
      .stop();

    for (let i = 0; i < 500; i++) settle.tick();

    const pad = 4;
    groups.attr("transform", (d) => {
      d.x = Math.max(d.r + pad, Math.min(WIDTH - d.r - pad, d.x));
      d.y = Math.max(d.r + pad, Math.min(height - d.r - pad, d.y));
      return `translate(${d.x}, ${d.y})`;
    });
    return null;
  }

  const sim = forceSimulation(nodes)
    .force("x", forceX(WIDTH / 2).strength(0.06))
    .force("y", forceY(height / 2).strength(0.1))
    .force("charge", forceManyBody().strength(2))
    .force(
      "collide",
      forceCollide()
        .radius((d) => d.r + spacingPad)
        .iterations(4)
    )
    .on("tick", () => {
      const pad = 4;
      groups.attr("transform", (d) => {
        d.x = Math.max(d.r + pad, Math.min(WIDTH - d.r - pad, d.x));
        d.y = Math.max(d.r + pad, Math.min(height - d.r - pad, d.y));
        return `translate(${d.x}, ${d.y})`;
      });
    });

  sim.alpha(1).restart();
  setTimeout(() => sim.stop(), 4000);
  return sim;
}

function createBubbleBlock(container, category) {
  const block = document.createElement("div");
  block.className = "bubble-block";
  block.id = `bubbles-${category.id}`;

  const title = document.createElement("h3");
  title.className = "bubble-block__title";
  title.textContent = category.title;

  const blurb = document.createElement("p");
  blurb.className = "bubble-block__blurb";
  blurb.textContent = category.blurb;

  const chart = document.createElement("div");
  chart.className = "bubble-block__chart";

  const svg = select(chart)
    .append("svg")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
    .attr("role", "img")
    .attr("aria-label", `${category.title} bubble chart`);

  block.append(title, blurb, chart);
  container.appendChild(block);
  block.classList.add("is-visible");

  function showSubThemes() {
    block.classList.remove("is-drilled");

    const items = category.subThemes.map((st) => ({
      id: st.id,
      label: st.label,
      value: sumValues(st.codes),
    }));

    renderBubbles(svg, category, items, {
      clickable: true,
      onSelect: (d) => showCodes(d.id),
    });
  }

  function showCodes(subThemeId) {
    const subTheme = category.subThemes.find((st) => st.id === subThemeId);
    if (!subTheme) return;

    block.classList.add("is-drilled");

    renderBubbles(svg, category, subTheme.codes, {
      clickable: true,
      instant: true,
      onSelect: () => showSubThemes(),
    });
  }

  showSubThemes();
  return block;
}

export function initBubbles() {
  const section = document.getElementById("bubbles");
  if (!section) return;

  const blocks = bubbleCategories.map((category) => createBubbleBlock(section, category));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  blocks.forEach((b) => observer.observe(b));
}
