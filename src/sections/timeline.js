import scrollama from "scrollama";
import { timelineSteps } from "../data/placeholder.js";

// Winding "snake" workflow timeline.
//
// Two SVG paths share the same silhouette, but `proposed` is stretched open at
// the insertion point to make room for the highlighted proposed step. We
// interpolate between them on scroll and re-sample node positions live with
// getPointAtLength, so nodes ride along the path as it morphs.

const VIEW_W = 760;
const VIEW_H = 1100;

// Current workflow: a winding path with 5 stops (no proposed step).
// Each command count is kept identical between the two paths so we can
// interpolate command-by-command.
const PATH_CURRENT = [
  "M 130 90",
  "C 130 90 630 90 630 250",
  "C 630 410 130 350 130 510",
  "C 130 670 630 610 630 770",
  "C 630 930 130 930 130 1010",
].join(" ");

// Proposed workflow: same shape, but the third bend is pulled out wider/longer
// to open a gap where the new structured-handoff step is inserted.
const PATH_PROPOSED = [
  "M 130 90",
  "C 130 90 660 90 660 250",
  "C 660 430 100 360 100 540",
  "C 100 760 680 660 680 840",
  "C 680 1020 130 1010 130 1010",
].join(" ");

// Anchor positions (fraction along the path) for each node, for each state.
// In the "current" state the proposed step shares a position with its neighbor
// and is hidden; in the "proposed" state it spreads into its own slot.
const ANCHORS_CURRENT = [0.0, 0.26, 0.5, 0.5, 0.74, 1.0];
const ANCHORS_PROPOSED = [0.0, 0.2, 0.4, 0.58, 0.78, 1.0];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Interpolate two path "d" strings that share an identical command structure.
function makePathInterpolator(d0, d1) {
  const nums0 = d0.match(/-?\d+\.?\d*/g).map(Number);
  const nums1 = d1.match(/-?\d+\.?\d*/g).map(Number);
  const tokens = d0.split(/(-?\d+\.?\d*)/);
  let numIndex = 0;
  const template = tokens.map((tok) => {
    if (/-?\d+\.?\d*/.test(tok)) {
      const i = numIndex++;
      return { num: true, a: nums0[i], b: nums1[i] };
    }
    return { num: false, text: tok };
  });
  return (t) =>
    template
      .map((part) => (part.num ? lerp(part.a, part.b, t).toFixed(2) : part.text))
      .join("");
}

export function initTimeline() {
  const sticky = document.getElementById("timeline-sticky");
  const stepsRoot = document.getElementById("timeline-steps");
  if (!sticky || !stepsRoot) return;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEW_W} ${VIEW_H}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  // Background (faint full path) + foreground (the drawn-in progress path).
  const bgPath = document.createElementNS(svgNS, "path");
  bgPath.setAttribute("class", "tl-path-bg");
  bgPath.setAttribute("d", PATH_CURRENT);

  const fgPath = document.createElementNS(svgNS, "path");
  fgPath.setAttribute("class", "tl-path-fg");
  fgPath.setAttribute("d", PATH_CURRENT);

  // A hidden measuring path we can sample with getPointAtLength.
  const measurePath = document.createElementNS(svgNS, "path");
  measurePath.setAttribute("d", PATH_CURRENT);
  measurePath.setAttribute("fill", "none");
  measurePath.setAttribute("stroke", "none");

  svg.append(bgPath, fgPath, measurePath);

  const interp = makePathInterpolator(PATH_CURRENT, PATH_PROPOSED);

  // Build node groups.
  const nodes = timelineSteps.map((step, i) => {
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "tl-node" + (step.proposed ? " is-proposed" : ""));

    const pulse = document.createElementNS(svgNS, "circle");
    pulse.setAttribute("class", "tl-node__pulse");
    pulse.setAttribute("r", "18");
    pulse.setAttribute("fill", "none");
    pulse.setAttribute("opacity", "0");

    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("r", "13");

    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", "22");
    label.setAttribute("y", "0");
    label.textContent = step.label;

    const detail = document.createElementNS(svgNS, "text");
    detail.setAttribute("class", "tl-node__detail");
    detail.setAttribute("x", "22");
    detail.setAttribute("y", "18");
    detail.textContent = step.detail;

    g.append(pulse, circle, label, detail);
    svg.appendChild(g);
    return { g, circle, label, detail, step, i };
  });

  sticky.appendChild(svg);

  // Render the timeline at a given morph amount (0 = current, 1 = proposed)
  // and reveal progress (0..1 of the path drawn + nodes shown).
  let morph = 0;
  let reveal = 0;

  function render() {
    const d = interp(morph);
    bgPath.setAttribute("d", d);
    fgPath.setAttribute("d", d);
    measurePath.setAttribute("d", d);

    const total = measurePath.getTotalLength();

    // Draw-in effect on the foreground path.
    fgPath.style.strokeDasharray = `${total}`;
    fgPath.style.strokeDashoffset = `${total * (1 - reveal)}`;

    nodes.forEach((node) => {
      const tCur = ANCHORS_CURRENT[node.i];
      const tPro = ANCHORS_PROPOSED[node.i];
      const t = lerp(tCur, tPro, morph);
      const pt = measurePath.getPointAtLength(total * t);

      node.g.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);

      // Reveal nodes as the path reaches them.
      const reached = reveal >= t - 0.001;
      let visible = reached;

      // Proposed-only steps stay hidden until we morph toward proposed.
      if (node.step.proposed) {
        visible = reached && morph > 0.15;
        node.circle.setAttribute("r", `${lerp(0, 13, Math.min(1, morph * 1.2))}`);
        node.g.style.opacity = String(Math.min(1, morph * 1.4) * (reached ? 1 : 0.15));
      } else {
        node.g.style.opacity = visible ? "1" : "0.15";
      }

      // Flip labels to the left side when the node sits on the right edge,
      // so text never runs off the canvas.
      const onRight = pt.x > VIEW_W * 0.6;
      const anchor = onRight ? "end" : "start";
      const dx = onRight ? -22 : 22;
      node.label.setAttribute("text-anchor", anchor);
      node.detail.setAttribute("text-anchor", anchor);
      node.label.setAttribute("x", String(dx));
      node.detail.setAttribute("x", String(dx));
    });
  }

  render();

  // Map scroll steps to (reveal, morph). Steps 0-2 draw in the current path;
  // step 3+ morph to the proposed layout with the inserted step.
  const stateByStep = [
    { reveal: 0.34, morph: 0 },
    { reveal: 0.62, morph: 0 },
    { reveal: 1.0, morph: 0 },
    { reveal: 1.0, morph: 1 },
    { reveal: 1.0, morph: 1 },
  ];

  function setState(stepIndex) {
    const s = stateByStep[Math.max(0, Math.min(stepIndex, stateByStep.length - 1))];
    animateTo(s.reveal, s.morph);
  }

  // Simple eased tween between states (rAF based).
  let raf = null;
  function animateTo(targetReveal, targetMorph) {
    cancelAnimationFrame(raf);
    const startReveal = reveal;
    const startMorph = morph;
    const start = performance.now();
    const dur = 700;
    const ease = (x) => 1 - Math.pow(1 - x, 3);

    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const e = ease(p);
      reveal = lerp(startReveal, targetReveal, e);
      morph = lerp(startMorph, targetMorph, e);
      render();
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
  }

  // Scrollama wiring.
  const scroller = scrollama();
  scroller
    .setup({
      step: "#timeline-steps .step",
      offset: 0.6,
    })
    .onStepEnter((response) => {
      const stepEls = stepsRoot.querySelectorAll(".step");
      stepEls.forEach((el) => el.classList.remove("is-active"));
      response.element.classList.add("is-active");
      const idx = Number(response.element.dataset.step);
      setState(idx);
    });

  window.addEventListener("resize", () => {
    scroller.resize();
    render();
  });
}
