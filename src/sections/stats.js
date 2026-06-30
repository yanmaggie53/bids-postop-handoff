import { quickStats } from "../data/placeholder.js";

// Quick stats: large numbers without boxes; count up fast on first scroll into view.
export function initStats() {
  const section = document.getElementById("quick-stats");
  if (!section || !quickStats) return;

  const { observations, cliniciansTotal, cliniciansByRole, handoffsWithTool } = quickStats;

  section.replaceChildren();

  const grid = document.createElement("div");
  grid.className = "stats__grid";

  function makeStat(value, label, metaText = "") {
    const item = document.createElement("article");
    item.className = "stats__item";
    const valueEl = document.createElement("p");
    valueEl.className = "stats__value";
    valueEl.dataset.target = String(value);
    valueEl.textContent = "0";
    const labelEl = document.createElement("p");
    labelEl.className = "stats__label";
    labelEl.textContent = label;
    item.append(valueEl, labelEl);
    if (metaText) {
      const meta = document.createElement("p");
      meta.className = "stats__meta";
      meta.textContent = metaText;
      item.appendChild(meta);
    }
    return { item, valueEl };
  }

  grid.appendChild(makeStat(observations, "Total handoffs observed").item);

  const clinicians = makeStat(cliniciansTotal, "Total number of clinicians talked to");
  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "stats__toggle";
  toggleBtn.textContent = "Show role breakdown";
  toggleBtn.setAttribute("aria-expanded", "false");
  toggleBtn.setAttribute("aria-controls", "stats-breakdown");
  clinicians.item.appendChild(toggleBtn);
  grid.appendChild(clinicians.item);

  grid.appendChild(makeStat(handoffsWithTool, "Handoffs where the Epic tool was used").item);

  const breakdown = document.createElement("div");
  breakdown.className = "stats__breakdown";
  breakdown.id = "stats-breakdown";

  const breakdownTitle = document.createElement("p");
  breakdownTitle.className = "stats__breakdown-title";
  breakdownTitle.textContent = "Clinicians by role";

  const rolesList = document.createElement("ul");
  rolesList.className = "stats__roles";

  const roleCounts = Object.entries(cliniciansByRole || {});
  const maxRole = roleCounts.length ? Math.max(...roleCounts.map(([, c]) => c)) : 1;

  roleCounts.forEach(([role, count], i) => {
    const li = document.createElement("li");
    li.className = "stats__role";
    const pct = (count / maxRole) * 100;
    li.innerHTML = `
      <span class="stats__role-name">${role}</span>
      <span class="stats__role-bar-track">
        <span class="stats__role-bar" style="--w: ${pct}%; --i: ${i}"></span>
      </span>
      <span class="stats__role-count">${count}</span>
    `;
    rolesList.appendChild(li);
  });

  breakdown.append(breakdownTitle, rolesList);
  section.append(grid, breakdown);

  let breakdownOpen = false;

  function animateBars() {
    breakdown.classList.remove("is-animated");
    // Reflow so the browser registers the reset before we animate again.
    breakdown.getBoundingClientRect();
    requestAnimationFrame(() => {
      breakdown.classList.add("is-animated");
    });
  }

  toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    breakdownOpen = !breakdownOpen;
    if (breakdownOpen) {
      breakdown.classList.add("is-open");
      animateBars();
    } else {
      breakdown.classList.remove("is-open", "is-animated");
    }
    toggleBtn.setAttribute("aria-expanded", String(breakdownOpen));
    toggleBtn.textContent = breakdownOpen ? "Hide role breakdown" : "Show role breakdown";
  });

  let counted = false;

  function runCountUp() {
    if (counted) return;
    counted = true;

    section.querySelectorAll(".stats__value[data-target]").forEach((el) => {
      const target = Number(el.dataset.target);
      const start = performance.now();
      const duration = 850;

      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = String(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = String(target);
      }

      el.textContent = "0";
      requestAnimationFrame(tick);
    });
  }

  function inView() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    // Start when the stats block is clearly on screen (not just barely intersecting).
    return rect.top < vh * 0.72 && rect.bottom > vh * 0.28;
  }

  function onScroll() {
    if (!counted && inView()) runCountUp();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  requestAnimationFrame(onScroll);
}
