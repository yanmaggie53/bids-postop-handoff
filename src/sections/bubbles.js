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

// Build one force-packed bubble chart into `container` from `category` data.
function createBubbleChart(container, category) {
  const values = category.items.map((d) => d.value);
  const maxVal = Math.max(...values);
  const radius = scaleSqrt().domain([0, maxVal]).range([22, 78]);

  const nodes = category.items.map((d) => ({
    ...d,
    r: radius(d.value),
  }));

  const svg = select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
    .attr("role", "img")
    .attr("aria-label", `${category.title} bubble chart`);

  const groups = svg
    .selectAll("g.bubble")
    .data(nodes)
    .join("g")
    .attr("class", "bubble");

  groups
    .append("circle")
    .attr("r", (d) => d.r)
    .attr("fill", category.accent)
    .style("transition-delay", (_, i) => `${i * 60}ms`);

  // Label (only on bubbles large enough to fit text).
  const labels = groups
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

  // Tooltip via native <title> for smaller bubbles / accessibility.
  groups.append("title").text((d) => `${d.label} (${d.value})`);

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

  // Let it settle quickly without burning CPU forever.
  sim.alpha(1).restart();
  setTimeout(() => sim.stop(), 4000);
}

export function initBubbles() {
  const section = document.getElementById("bubbles");
  if (!section) return;

  const blocks = bubbleCategories.map((category) => {
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

    block.append(title, blurb, chart);
    section.appendChild(block);

    createBubbleChart(chart, category);
    return block;
  });

  // Reveal (pop-in) each chart when it scrolls into view.
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
