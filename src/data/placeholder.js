// Placeholder content. Replace with real assets/data when available.

// `BASE_URL` makes paths work both in local dev ("/") and on GitHub Pages
// ("/bids-postop-handoff/"). Files live in public/assets/ and are served as-is.
const asset = (p) => `${import.meta.env.BASE_URL}${p}`;

// Epic handoff tool screenshots, in workflow order.
// Drop real images into public/assets/screenshots/ and update the `src` paths.
export const screenshots = [
  {
    src: asset("assets/screenshots/step-1.svg"),
    caption: "1. Open the postoperative handoff report from the patient chart.",
  },
  {
    src: asset("assets/screenshots/step-2.svg"),
    caption: "2. Review the auto-populated surgical and anesthesia summary.",
  },
  {
    src: asset("assets/screenshots/step-3.svg"),
    caption: "3. Add notes on lines, drips, and post-op concerns.",
  },
  {
    src: asset("assets/screenshots/step-4.svg"),
    caption: "4. Share the structured report with the receiving ICU team.",
  },
];

// Educational flyers. Drop real images into public/assets/flyers/.
export const flyers = [
  {
    src: asset("assets/flyers/handoff-sending.png"),
    alt: "Flyer for the OR/sending team: why the Epic postoperative handoff report exists, what it does, when to use it, and how to access it.",
  },
  {
    src: asset("assets/flyers/handoff-receiving.png"),
    alt: "Flyer for the ICU/receiving team: why the Epic postoperative handoff report exists, what it does, when to use it, and how to access it.",
  },
];

// Workflow timeline, organized into three connected phases. Each phase is a
// winding "snake" of its own color; together they flow into one continuous
// path. Nodes within a phase appear in order.
//
// Steps flagged `proposed: true` only appear once the proposed-workflow
// animation is triggered; they are inserted into the middle (handoff) phase.
export const timelinePhases = [
  {
    id: "pre-handoff",
    title: "Pre-Handoff Process",
    where: "In the OR",
    color: "#67d4c1", // teal
    steps: [
      { id: "surgery-ends", label: "Surgery ends", detail: "Procedure completed; emergence begins." },
      { id: "prep", label: "Patient prep", detail: "Lines, drips, and monitors readied for transfer." },
      { id: "or-summary", label: "OR debrief", detail: "Team confirms counts and intra-op events." },
    ],
  },
  {
    id: "handoff",
    title: "Postoperative Handoff",
    where: "ICU \u2014 between the OR & ICU teams",
    color: "#ffd166", // amber
    steps: [
      { id: "transport", label: "Transport", detail: "Patient moved from OR to ICU." },
      { id: "icu-connect", label: "ICU connect", detail: "Patient connected to ICU monitors and lines." },
      {
        id: "structured-handoff",
        label: "Structured handoff",
        detail: "Brief, standardized handoff using the Epic tool.",
        proposed: true,
      },
      { id: "verbal-report", label: "Verbal report", detail: "OR team delivers the handoff report." },
    ],
  },
  {
    id: "post-handoff",
    title: "Post-Handoff Process",
    where: "ICU team takes over",
    color: "#f78fb3", // pink
    steps: [
      { id: "questions", label: "Q&A", detail: "ICU team asks clarifying questions." },
      { id: "plan", label: "Care plan", detail: "ICU sets the initial post-op plan." },
      { id: "stabilize", label: "Stabilize", detail: "Ongoing ICU monitoring and care." },
    ],
  },
];

// Bubble chart data, one dataset per category.
// `value` ~ how many clinicians voiced this (drives bubble size).
export const bubbleCategories = [
  {
    id: "challenges",
    title: "Challenges",
    blurb: "Friction points raised about the workflow or the tool.",
    accent: "#d1495b",
    items: [
      { label: "Too rushed", value: 9 },
      { label: "Tool not opened", value: 7 },
      { label: "Hard to find", value: 5 },
      { label: "Duplicate entry", value: 4 },
      { label: "Interruptions", value: 6 },
      { label: "Unclear ownership", value: 3 },
    ],
  },
  {
    id: "usefulness",
    title: "Usefulness",
    blurb: "Where the tool genuinely helps the handoff.",
    accent: "#2a9d8f",
    items: [
      { label: "Standardized info", value: 8 },
      { label: "Fewer omissions", value: 6 },
      { label: "Shared reference", value: 5 },
      { label: "Faster report", value: 4 },
      { label: "Auto-populated", value: 7 },
    ],
  },
  {
    id: "suggestions",
    title: "Suggestions",
    blurb: "Ideas clinicians offered for improvement.",
    accent: "#e9a020",
    items: [
      { label: "Mobile access", value: 5 },
      { label: "Shorter form", value: 7 },
      { label: "Auto-reminder", value: 6 },
      { label: "Prefill drips", value: 4 },
      { label: "Quick template", value: 5 },
    ],
  },
  {
    id: "liked",
    title: "Elements liked",
    blurb: "Specific parts of the tool clinicians appreciated.",
    accent: "#457b9d",
    items: [
      { label: "Surgery summary", value: 8 },
      { label: "Med list", value: 6 },
      { label: "Clean layout", value: 4 },
      { label: "Vitals snapshot", value: 5 },
    ],
  },
  {
    id: "disliked",
    title: "Elements disliked",
    blurb: "Specific parts that frustrated clinicians.",
    accent: "#8d5524",
    items: [
      { label: "Too many fields", value: 7 },
      { label: "Small text", value: 4 },
      { label: "Buried button", value: 6 },
      { label: "Slow to load", value: 5 },
      { label: "Free-text only", value: 3 },
    ],
  },
];
