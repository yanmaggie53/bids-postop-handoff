import { handoffToolUi } from "../data/placeholder.js";

// Handoff report tool UI: print-group reference images, desktop mockup, and
// a scrollable mobile mockup.
export function initScreenshots() {
  const root = document.getElementById("screenshots-stage");
  if (!root) return;

  const { printGroups, desktop, mobile } = handoffToolUi;

  const prints = document.createElement("div");
  prints.className = "tool-ui__prints";

  const printItems = printGroups.map((item) => {
    const fig = document.createElement("figure");
    fig.className = "tool-ui__print";

    const link = document.createElement("a");
    link.href = item.src;
    link.target = "_blank";
    link.rel = "noopener";
    link.className = "tool-ui__print-link";
    link.setAttribute("aria-label", "Open print group full size in a new tab");

    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt;
    img.loading = "lazy";

    const hint = document.createElement("span");
    hint.className = "tool-ui__zoom";
    hint.textContent = "Open full size \u2197";

    link.append(img, hint);
    fig.appendChild(link);
    prints.appendChild(fig);
    return fig;
  });

  const desktopBlock = document.createElement("div");
  desktopBlock.className = "tool-ui__block tool-ui__block--desktop is-visible";

  const desktopLabel = document.createElement("p");
  desktopLabel.className = "tool-ui__label";
  desktopLabel.textContent = "Desktop (Epic Hyperspace)";

  const desktopFrame = document.createElement("div");
  desktopFrame.className = "device-mockup device-mockup--desktop";

  const desktopChrome = document.createElement("div");
  desktopChrome.className = "device-mockup__chrome";
  desktopChrome.setAttribute("aria-hidden", "true");
  desktopChrome.innerHTML =
    '<span class="device-mockup__dot device-mockup__dot--red"></span>' +
    '<span class="device-mockup__dot device-mockup__dot--yellow"></span>' +
    '<span class="device-mockup__dot device-mockup__dot--green"></span>' +
    '<span class="device-mockup__title">Anesthesia Record</span>';

  const desktopScreen = document.createElement("div");
  desktopScreen.className = "device-mockup__screen";

  const desktopImg = document.createElement("img");
  desktopImg.src = desktop.src;
  desktopImg.alt = desktop.alt;
  desktopImg.loading = "lazy";

  desktopScreen.appendChild(desktopImg);
  desktopFrame.append(desktopChrome, desktopScreen);
  desktopBlock.append(desktopLabel, desktopFrame);

  const mobileBlock = document.createElement("div");
  mobileBlock.className = "tool-ui__block tool-ui__block--mobile is-visible";

  const mobileLabel = document.createElement("p");
  mobileLabel.className = "tool-ui__label";
  mobileLabel.textContent = "Mobile (Epic Haiku)";

  const mobileFrame = document.createElement("div");
  mobileFrame.className = "device-mockup device-mockup--phone";

  const mobileBezel = document.createElement("div");
  mobileBezel.className = "device-mockup__bezel";

  const mobileScreen = document.createElement("div");
  mobileScreen.className = "device-mockup__screen device-mockup__screen--phone";
  mobileScreen.setAttribute("tabindex", "0");
  mobileScreen.setAttribute(
    "aria-label",
    "Scrollable Epic Haiku handoff report preview. Scroll inside the phone to review each section."
  );

  mobile.forEach((item) => {
    const img = document.createElement("img");
    img.className = "tool-ui__mobile-img";
    img.src = item.src;
    img.alt = item.alt;
    img.width = item.width;
    img.height = item.height;
    img.loading = "lazy";
    img.draggable = false;
    mobileScreen.appendChild(img);
  });

  mobileBezel.appendChild(mobileScreen);
  mobileFrame.appendChild(mobileBezel);

  const scrollHint = document.createElement("p");
  scrollHint.className = "tool-ui__scroll-hint";
  scrollHint.textContent = "Scroll inside the phone \u2195";

  mobileBlock.append(mobileLabel, mobileFrame, scrollHint);
  root.append(prints, desktopBlock, mobileBlock);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  printItems.forEach((item) => observer.observe(item));
}
