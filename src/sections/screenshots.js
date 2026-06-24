import { screenshots } from "../data/placeholder.js";

// Click-to-advance carousel for the Epic handoff tool screenshots.
export function initScreenshots() {
  const stageRoot = document.getElementById("screenshots-stage");
  if (!stageRoot || screenshots.length === 0) return;

  let index = 0;

  const stage = document.createElement("div");
  stage.className = "screenshots__stage";
  stage.setAttribute("role", "button");
  stage.setAttribute("tabindex", "0");
  stage.setAttribute("aria-label", "Epic handoff tool workflow. Click or press Enter to advance.");

  const imgs = screenshots.map((shot, i) => {
    const img = document.createElement("img");
    img.className = "screenshots__img" + (i === 0 ? " is-active" : "");
    img.src = shot.src;
    img.alt = shot.caption;
    img.draggable = false;
    stage.appendChild(img);
    return img;
  });

  const hint = document.createElement("div");
  hint.className = "screenshots__hint";
  hint.textContent = "Click to continue \u2192";
  stage.appendChild(hint);

  const caption = document.createElement("p");
  caption.className = "screenshots__caption";
  caption.textContent = screenshots[0].caption;

  const dots = document.createElement("div");
  dots.className = "screenshots__dots";
  const dotButtons = screenshots.map((_, i) => {
    const dot = document.createElement("button");
    dot.className = "screenshots__dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Go to screenshot ${i + 1}`);
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      go(i);
    });
    dots.appendChild(dot);
    return dot;
  });

  stageRoot.append(stage, caption, dots);

  function go(next) {
    index = (next + screenshots.length) % screenshots.length;
    imgs.forEach((img, i) => img.classList.toggle("is-active", i === index));
    dotButtons.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    caption.textContent = screenshots[index].caption;
    hint.textContent =
      index === screenshots.length - 1 ? "Click to restart \u21BA" : "Click to continue \u2192";
  }

  stage.addEventListener("click", () => go(index + 1));
  stage.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowRight") {
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      go(index - 1);
    }
  });
}
