import { flyers } from "../data/placeholder.js";

// Flyer gallery with a scroll-reveal as each card enters the viewport.
export function initFlyers() {
  const gallery = document.getElementById("flyers-gallery");
  if (!gallery || flyers.length === 0) return;

  const items = flyers.map((flyer) => {
    const fig = document.createElement("figure");
    fig.className = "flyers__item";

    // Wrap in a link so clicking opens the full-resolution flyer in a new tab.
    const link = document.createElement("a");
    link.href = flyer.src;
    link.target = "_blank";
    link.rel = "noopener";
    link.className = "flyers__link";
    link.setAttribute("aria-label", "Open flyer full size in a new tab");

    const img = document.createElement("img");
    img.src = flyer.src;
    img.alt = flyer.alt;
    img.loading = "lazy";

    const hint = document.createElement("span");
    hint.className = "flyers__zoom";
    hint.textContent = "Open full size \u2197";

    link.append(img, hint);
    fig.appendChild(link);
    gallery.appendChild(fig);
    return fig;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  items.forEach((item) => observer.observe(item));
}
