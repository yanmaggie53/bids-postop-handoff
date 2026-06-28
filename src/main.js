import "./style.css";
import { initScreenshots } from "./sections/screenshots.js";
import { initFlyers } from "./sections/flyers.js";
import { initTimeline } from "./sections/timeline.js";
import { initStats } from "./sections/stats.js";
import { initBubbles } from "./sections/bubbles.js";

function safeInit(name, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`Failed to initialize ${name}:`, err);
  }
}

function init() {
  safeInit("screenshots", initScreenshots);
  safeInit("flyers", initFlyers);
  safeInit("timeline", initTimeline);
  safeInit("stats", initStats);
  safeInit("bubbles", initBubbles);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
