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

// Quick stats for the Findings section (replace with real study numbers).
export const quickStats = {
  observations: 78,
  cliniciansTotal: 80,
  cliniciansByRole: {
    "ICU clinicians": 18,
    Anesthesiologists: 43,
    CRNAs: 18,
    SRNAs: 4,
    "Circulating nurses": 2,
    Surgeons: 1,
  },
  handoffsWithTool: 14,
};

// Bubble chart data — three overarching themes. Each theme has sub-themes;
// clicking a sub-theme bubble reveals the individual codes beneath it.
// `value` ~ how many clinicians voiced this (drives bubble size).
export const bubbleCategories = [
  {
    id: "usefulness",
    title: "Perceived usefulness of the handoff report",
    blurb: "which encapsulate both the positive and negative feedback on the usefulness of the tool",
    accent: "#2a9d8f",
    subThemes: [
      {
        id: "general-perception",
        label: "General perception of report",
        codes: [
          { label: "Certatin sections on report is helpful", value: 1 },
          { label: "Report helpful for remembering", value: 1 },
          { label: "Report is helpful", value: 6 },
          { label: "Report is somewhat helpful", value: 2 },
          { label: "Report makes information accessible", value: 4 },
          { label: "Report not useful", value: 14 },
        ],
      },
      {
        id: "not-useful-elements",
        label: "Not useful elements",
        codes: [
          { label: "Events", value: 3 },
          { label: "Home medications information", value: 1 },
          { label: "Hovering over to find brief notes", value: 2 },
          { label: "Medications summary", value: 2 },
          { label: "Preop medications information", value: 2 },
        ],
      },
      {
        id: "haiku-accessibility",
        label: "Report accessibility in Haiku",
        codes: [
          { label: "Haiku version is helpful", value: 7 },
        ],
      },
      {
        id: "useful-elements",
        label: "Useful elements",
        codes: [
          { label: "Airways", value: 1 },
          { label: "Blood products information", value: 3 },
          { label: "Color coding of preop, intraop, postop information", value: 1 },
          { label: "Drains", value: 1 },
          { label: "I/O totals information", value: 5 },
          { label: "Information personalizaed to the patient", value: 1 },
          { label: "Intraop amounts of fluids", value: 1 },
          { label: "Intraop information", value: 2 },
          { label: "Intraop medication and dosages information", value: 1 },
          { label: "Intraop medication information", value: 6 },
          { label: "Intraop medication with time administered information", value: 1 },
          { label: "Lines", value: 1 },
          { label: "Preop history/diagnosis", value: 1 },
          { label: "Preop information", value: 1 },
          { label: "Preop vitals", value: 1 },
          { label: "Report updates in real time", value: 1 },
        ],
      },
      {
        id: "workflow-fit",
        label: "Workflow fit and integration",
        codes: [
          { label: "Hyperspace version helpful for taking over", value: 1 },
          { label: "Potential users", value: 9 },
          { label: "Report helpful before and after handoff", value: 1 },
          { label: "Report helpful during entire handoff process", value: 1 },
          { label: "Report helpful during handoff", value: 4 },
          { label: "Report helpful for preview", value: 3 },
          { label: "Report helpful to clarify information", value: 1 },
          { label: "Report helpful when taking over", value: 1 },
          { label: "Report helpful after handoff", value: 1 },
        ],
      },
    ],
  },
  {
    id: "challenges",
    title: "Challenges",
    blurb: "with the workflow, tool itself, integrating the tool into the workflow,and clinician behavior",
    accent: "#d1495b",
    subThemes: [
      {
        id: "clinician-behavior",
        label: "Challenges with clinician behavior and attitude",
        codes: [
          { label: "Not interested in report", value: 4 },
          { label: "Reliance on memory", value: 12 },
          { label: "Selective attention", value: 5 },
          { label: "Human ego", value: 2 },
          { label: "Forgot to use report", value: 3 },
          { label: "Distracted during handoff", value: 5 },
          { label: "Interruption during handoff", value: 1 },
        ],
      },
      {
        id: "handoff-workflow",
        label: "Challenges with handoff process workflow",
        codes: [
          { label: "Dissatisfaction with handoff process", value: 2 },
          { label: "Inconsistency in current workflow", value: 7 },
          { label: "Inconsistency in filling information", value: 3 },
          { label: "Interruption during handoff", value: 1 },
          { label: "Limited personnel at handoff", value: 1 },
          { label: "Miscommunication between OR & care teams", value: 1 },
          { label: "No notes taken", value: 8 },
          { label: "Only one person taking notes", value: 2 },
          { label: "Physical distance barrier to hearing", value: 8 },
          { label: "Second transfer of information distorted", value: 4 },
          { label: "Taking notes on random things", value: 7 },
        ],
      },
      {
        id: "hrt-haiku",
        label: "Challenges with HRT (Haiku)",
        codes: [
          { label: "Flow of print groups different", value: 1 },
          { label: "Missing navigation option in Haiku", value: 1 },
          { label: "Missing survey link (Haiku)", value: 2 },
          { label: "Report not displayed in Haiku", value: 5 },
          { label: "Report not easily accessible", value: 2 },
          { label: "Too much information in report", value: 3 },
        ],
      },
      {
        id: "hrt-hyperspace",
        label: "Challenges with HRT (Hyperspace)",
        codes: [
          { label: "Mismatch between report and actual data", value: 1 },
          { label: "Platform preference (Haiku)", value: 1 },
          { label: "Report not easily accessible", value: 5 },
          { label: "Too much information in report", value: 7 },
          { label: "Unable to search for handoff report directly", value: 1 },
        ],
      },
      {
        id: "integrating-workflow",
        label: "Challenges with integrating into workflow",
        codes: [
          { label: "Disruption in current workflow", value: 3 },
          { label: "Prefer not to change workflow", value: 12 },
          { label: "Printing report feasibility", value: 5 },
          { label: "Report tool is distraction", value: 2 },
        ],
      },
    ],
  },
  {
    id: "suggestions",
    title: "General suggestions",
    blurb: "for report improvement and implementation",
    accent: "#e9a020",
    subThemes: [
      {
        id: "implementation",
        label: "Suggestions for implementation",
        codes: [
          { label: "Higher authority", value: 1 },
          { label: "Reference to SICU 4400 checklist", value: 2 },
          { label: "Standardized handoff process", value: 1 },
        ],
      },
      {
        id: "improvement",
        label: "Suggestions for improvement",
        codes: [
          { label: "Concise summary", value: 3 },
          { label: "Printed handoff report", value: 3 },
          { label: "Reference to PACU color-coded worksheet", value: 1 },
          { label: "Report accessibility in Haiku", value: 5 },
          { label: "Report navigation in Hyperspace", value: 2 },
        ],
      },
    ],
  },
];
