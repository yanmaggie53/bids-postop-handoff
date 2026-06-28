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

// Build one force-packed bubble chart. `items` is a flat list of { label, value }.
function renderBubbles(svg, category, items, { clickable = false, onSelect, instant = false } = {}) {
  svg.selectAll("*").remove();

  if (items.length === 0) return null;

  const values = items.map((d) => d.value);
  const maxVal = Math.max(...values, 1);
  const radius = scaleSqrt().domain([0, maxVal]).range([22, 78]);

  const nodes = items.map((d) => ({
    ...d,
    r: radius(d.value),
  }));

  const groups = svg
    .selectAll("g.bubble")
    .data(nodes)
    .join("g")
    .attr("class", "bubble")
    .style("cursor", clickable ? "pointer" : "default");

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

  groups
    .append("text")
    .attr("dy", "-0.1em")
    .style("font-size", (d) => `${Math.max(11, Math.min(18, d.r / 3.4))}px`)
    .text((d) => (d.r > 30 ? d.label : ""));

  groups
    .filter((d) => d.r > 30)
    .append("text")
    .attr("class", "bubble__value")
    .attr("dy", "1.2em")
    .style("font-size", (d) => `${Math.max(10, Math.min(16, d.r / 4))}px`)
    .style("fill", "#fff")
    .style("text-anchor", "middle")
    .text((d) => `\u00d7${d.value}`);

  groups.append("title").text((d) => `${d.label} (${d.value})`);

  if (instant) {
    layoutGrid(nodes, WIDTH, HEIGHT);
    groups.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    return null;
  }

  const sim = forceSimulation(nodes)
    .force("x", forceX(WIDTH / 2).strength(0.06))
    .force("y", forceY(HEIGHT / 2).strength(0.12))
    .force("charge", forceManyBody().strength(2))
    .force(
      "collide",
      forceCollide()
        .radius((d) => d.r + 3)
        .iterations(3)
    )
    .on("tick", () => {
      const pad = 4;
      groups.attr("transform", (d) => {
        d.x = Math.max(d.r + pad, Math.min(WIDTH - d.r - pad, d.x));
        d.y = Math.max(d.r + pad, Math.min(HEIGHT - d.r - pad, d.y));
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

  const hint = document.createElement("p");
  hint.className = "bubble-block__hint";
  hint.textContent = "Click a sub-theme to see the codes inside it.";

  const chart = document.createElement("div");
  chart.className = "bubble-block__chart";

  const svg = select(chart)
    .append("svg")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
    .attr("role", "img")
    .attr("aria-label", `${category.title} bubble chart`);

  block.append(title, blurb, hint, chart);
  container.appendChild(block);
  block.classList.add("is-visible");

  function showSubThemes() {
    hint.textContent = "Click a sub-theme to see the codes inside it.";
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

    hint.textContent = "Click any code to return to sub-themes.";
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
