// Placeholder content. Replace with real assets/data when available.

// `BASE_URL` makes paths work both in local dev ("/") and on GitHub Pages
// ("/bids-postop-handoff/"). Files live in public/assets/ and are served as-is.
const asset = (p) => `${import.meta.env.BASE_URL}${p}`;

// Handoff report tool UI images (public/assets/screenshots/).
export const handoffToolUi = {
  printGroups: [
    {
      src: asset("assets/screenshots/Print-groups1.png"),
      alt: "Reference guide to handoff report sections, part 1: anesthesia record through last vent parameters.",
    },
    {
      src: asset("assets/screenshots/Print-groups2.png"),
      alt: "Reference guide to handoff report sections, part 2: medication summary through encounter notes.",
    },
  ],
  desktop: {
    src: asset("assets/screenshots/HyperspaceUI.png"),
    alt: "Epic Hyperspace desktop view of the postoperative anesthesia handoff report.",
  },
  mobile: [
    {
      src: asset("assets/screenshots/HaikuUI1.png"),
      alt: "Epic Haiku mobile handoff report, screen 1: patient details and procedure summary.",
      width: 489,
      height: 881,
    },
    {
      src: asset("assets/screenshots/HaikuUI2.png"),
      alt: "Epic Haiku mobile handoff report, screen 2: clinical history and care team.",
      width: 491,
      height: 881,
    },
    {
      src: asset("assets/screenshots/HaikuUI3.png"),
      alt: "Epic Haiku mobile handoff report, screen 3: medications and airway details.",
      width: 491,
      height: 881,
    },
    {
      src: asset("assets/screenshots/HaikuUI4.png"),
      alt: "Epic Haiku mobile handoff report, screen 4: intraoperative medications.",
      width: 456,
      height: 849,
    },
    {
      src: asset("assets/screenshots/HaikuUI5.png"),
      alt: "Epic Haiku mobile handoff report, screen 5: lines, I/O totals, and vitals.",
      width: 456,
      height: 849,
    },
    {
      src: asset("assets/screenshots/HaikuUI6.png"),
      alt: "Epic Haiku mobile handoff report, screen 6: preprocedure evaluation and meds.",
      width: 456,
      height: 849,
    },
    {
      src: asset("assets/screenshots/HaikuUI7.png"),
      alt: "Epic Haiku mobile handoff report, screen 7: vent settings, events, and handoff survey.",
      width: 218,
      height: 407,
    },
  ],
};

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
// Steps flagged `proposed: true` belong to the PROPOSED workflow. They are
// hidden by default and each one has its own discrete toggle at its location
// in the snake, so the viewer can reveal them individually.
export const timelinePhases = [
  {
    id: "pre-handoff",
    title: "Pre-Handoff Process",
    where: "In the OR",
    color: "#67d4c1", // teal
    steps: [
      { id: "incision-closed", label: "Surgery finished", detail: "Incision closed & surgery is finished." },
      { id: "or-debrief", label: "OR debrief", detail: "Debrief in the OR." },
      { id: "prep-transfer", label: "Prep for transfer", detail: "Preparation of patient for ICU transfer." },
      { id: "confirm-bed", label: "Confirm ICU bed", detail: "Anesthesia team calls ICU to confirm bed availability." },
      { id: "family-update", label: "Family update", detail: "Circulating nurse updates the family about the transfer." },
      { id: "icu-update", label: "Update ICU", detail: "Anesthesia team again calls the ICU to update about the transfer." },
      {
        id: "icu-preview",
        label: "ICU preview",
        detail:
          "ICU clinicians prepare for patient arrival by reviewing patient information in advance using the handoff report tool on Epic.",
        proposed: true,
      },
    ],
  },
  {
    id: "handoff",
    title: "Postoperative Handoff Process",
    where: "In the ICU \u2014 between the OR & ICU teams",
    color: "#ffd166", // amber
    steps: [
      { id: "icu-setup", label: "Patient setup", detail: "Patient setup in ICU." },
      { id: "team-gather", label: "Team gathers", detail: "ICU clinicians (APPs, RNs and residents) gather for handoff." },
      { id: "eicu", label: "eICU connected", detail: "eICU is connected." },
      { id: "verbal-start", label: "Verbal handoff", detail: "Verbal handoff starts." },
      {
        id: "nurse-report",
        label: "Circulating nurse",
        detail:
          "Circulating nurse initiates handoff transfer: confirms patient's name and age, allergies, medications and implants, specimens, incisions and dressing, family update.",
      },
      {
        id: "surgical-report",
        label: "Surgical rep",
        detail:
          "Surgical representative: surgical procedure, findings, special instructions, complications, labs, imaging, diet and concerns.",
      },
      {
        id: "anesthesia-epic-ref",
        label: "Reference handoff tool",
        detail:
          "While giving the verbal handoff, the anesthesia rep references the handoff report tool in Epic \u2014 not to dictate the handoff, but to help in case they forget something or need to answer an ICU clinician's question.",
        proposed: true,
      },
      {
        id: "anesthesia-report",
        label: "Anesthesia rep",
        detail:
          "Anesthesia representative: type of anesthesia, allergies, isolation, airway, ventilation, hemodynamics, fluids, blood products, anesthesia complications, PMH, concerns.",
      },
    ],
  },
  {
    id: "post-handoff",
    title: "Post-Handoff Process",
    where: "In the ICU",
    color: "#f78fb3", // pink
    steps: [
      {
        id: "icu-review",
        label: "ICU review",
        detail:
          "ICU clinicians use the handoff report tool in Epic to review and/or clarify patient information.",
        proposed: true,
      },
      { id: "continue-setup", label: "Continue setup", detail: "ICU clinicians (RNs) continue patient setup (draping, cleaning, etc.)." },
      { id: "orders", label: "Orders", detail: "ICU APPs order tests and medications for the patient." },
      { id: "care-plan", label: "Care plan", detail: "ICU APPs discuss the care plan with critical care residents/physicians and implement it." },
      { id: "follow-up", label: "Follow-up", detail: "ICU APPs might reach out to OR clinicians (residents \u2014 surgeons / anesthesia) with any questions." },
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
