import "./style.css";
import { initScreenshots } from "./sections/screenshots.js";
import { initFlyers } from "./sections/flyers.js";
import { initTimeline } from "./sections/timeline.js";
import { initBubbles } from "./sections/bubbles.js";

function init() {
  initScreenshots();
  initFlyers();
  initTimeline();
  initBubbles();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
