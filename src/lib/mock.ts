/* Dummy data for the SEC platform demo.
   Everything is generated with a SEEDED random generator, so the data is
   identical on every device and every reload (until the user changes it —
   the store then persists edits to localStorage).
   A production build would swap this file for real database queries: the
   shapes in types.ts already match what the API would return. */

import type {
  AdminUser, AdminUser as AU, Announcement, AppNotification, Delivery, MessageTemplate,
  MilestoneCfg, PartnerOrg, Region, Resource, RubricCriterion, Submission, SubmissionDraft,
  Team, Thread, User,
} from "./types";

/* ---------- tiny deterministic RNG ---------- */
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20250913);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

/* ---------- geography: 61 countries, 5 regions ---------- */
export const COUNTRIES: { name: string; code: string; region: Region }[] = [
  { name: "Kenya", code: "KE", region: "Africa" },
  { name: "Nigeria", code: "NG", region: "Africa" },
  { name: "Ghana", code: "GH", region: "Africa" },
  { name: "Uganda", code: "UG", region: "Africa" },
  { name: "Tanzania", code: "TZ", region: "Africa" },
  { name: "Rwanda", code: "RW", region: "Africa" },
  { name: "Zambia", code: "ZM", region: "Africa" },
  { name: "Zimbabwe", code: "ZW", region: "Africa" },
  { name: "Malawi", code: "MW", region: "Africa" },
  { name: "South Africa", code: "ZA", region: "Africa" },
  { name: "Ethiopia", code: "ET", region: "Africa" },
  { name: "Sierra Leone", code: "SL", region: "Africa" },
  { name: "Cameroon", code: "CM", region: "Africa" },
  { name: "Senegal", code: "SN", region: "Africa" },
  { name: "India", code: "IN", region: "Asia" },
  { name: "Bangladesh", code: "BD", region: "Asia" },
  { name: "Pakistan", code: "PK", region: "Asia" },
  { name: "Nepal", code: "NP", region: "Asia" },
  { name: "Sri Lanka", code: "LK", region: "Asia" },
  { name: "Indonesia", code: "ID", region: "Asia" },
  { name: "Philippines", code: "PH", region: "Asia" },
  { name: "Vietnam", code: "VN", region: "Asia" },
  { name: "Cambodia", code: "KH", region: "Asia" },
  { name: "Malaysia", code: "MY", region: "Asia" },
  { name: "Myanmar", code: "MM", region: "Asia" },
  { name: "Honduras", code: "HN", region: "Mesoamerica" },
  { name: "Guatemala", code: "GT", region: "Mesoamerica" },
  { name: "El Salvador", code: "SV", region: "Mesoamerica" },
  { name: "Nicaragua", code: "NI", region: "Mesoamerica" },
  { name: "Costa Rica", code: "CR", region: "Mesoamerica" },
  { name: "Panama", code: "PA", region: "Mesoamerica" },
  { name: "Mexico", code: "MX", region: "Mesoamerica" },
  { name: "Belize", code: "BZ", region: "Mesoamerica" },
  { name: "Peru", code: "PE", region: "Latin America" },
  { name: "Colombia", code: "CO", region: "Latin America" },
  { name: "Ecuador", code: "EC", region: "Latin America" },
  { name: "Bolivia", code: "BO", region: "Latin America" },
  { name: "Paraguay", code: "PY", region: "Latin America" },
  { name: "Argentina", code: "AR", region: "Latin America" },
  { name: "Chile", code: "CL", region: "Latin America" },
  { name: "Uruguay", code: "UY", region: "Latin America" },
  { name: "Brazil", code: "BR", region: "Latin America" },
  { name: "Dominican Republic", code: "DO", region: "Latin America" },
  { name: "United Kingdom", code: "GB", region: "Europe" },
  { name: "Ireland", code: "IE", region: "Europe" },
  { name: "Spain", code: "ES", region: "Europe" },
  { name: "Portugal", code: "PT", region: "Europe" },
  { name: "Netherlands", code: "NL", region: "Europe" },
  { name: "Germany", code: "DE", region: "Europe" },
  { name: "France", code: "FR", region: "Europe" },
  { name: "Italy", code: "IT", region: "Europe" },
  { name: "Poland", code: "PL", region: "Europe" },
  { name: "Romania", code: "RO", region: "Europe" },
  { name: "Ukraine", code: "UA", region: "Europe" },
  { name: "Greece", code: "GR", region: "Europe" },
  { name: "Sweden", code: "SE", region: "Europe" },
  { name: "Norway", code: "NO", region: "Europe" },
  { name: "Finland", code: "FI", region: "Europe" },
  { name: "Denmark", code: "DK", region: "Europe" },
  { name: "Austria", code: "AT", region: "Europe" },
  { name: "Switzerland", code: "CH", region: "Europe" },
];

/* ---------- partner organisations ---------- */
export const PARTNERS: PartnerOrg[] = [
  { id: "po-01", name: "Ujasiri Foundation", country: "Kenya", code: "KE", region: "Africa", schools: 96, teams: 388, contact: "Wanjiru M.", active: true },
  { id: "po-02", name: "EduRise Trust", country: "India", code: "IN", region: "Asia", schools: 214, teams: 906, contact: "Arjun P.", active: true },
  { id: "po-03", name: "Fundación Emprende", country: "Honduras", code: "HN", region: "Mesoamerica", schools: 64, teams: 201, contact: "Lucía G.", active: true },
  { id: "po-04", name: "Jóvenes con Futuro", country: "Guatemala", code: "GT", region: "Mesoamerica", schools: 58, teams: 176, contact: "Marco A.", active: true },
  { id: "po-05", name: "BrightFuture Africa", country: "Nigeria", code: "NG", region: "Africa", schools: 88, teams: 264, contact: "Chiamaka O.", active: true },
  { id: "po-06", name: "Sembrar A.C.", country: "Mexico", code: "MX", region: "Mesoamerica", schools: 41, teams: 122, contact: "Sofía R.", active: true },
  { id: "po-07", name: "Andean Learning Lab", country: "Peru", code: "PE", region: "Latin America", schools: 47, teams: 149, contact: "Diego Q.", active: true },
  { id: "po-08", name: "Karuna Skills", country: "Bangladesh", code: "BD", region: "Asia", schools: 73, teams: 214, contact: "Farhana A.", active: true },
  { id: "po-09", name: "Pacific Education Hub", country: "Philippines", code: "PH", region: "Asia", schools: 39, teams: 118, contact: "Ramon V.", active: false },
  { id: "po-10", name: "Ágora Educação", country: "Brazil", code: "BR", region: "Latin America", schools: 55, teams: 163, contact: "Beatriz L.", active: true },
  { id: "po-11", name: "Savanna Schools Network", country: "Uganda", code: "UG", region: "Africa", schools: 62, teams: 190, contact: "Grace N.", active: true },
  { id: "po-12", name: "Delta Learning Co.", country: "Colombia", code: "CO", region: "Latin America", schools: 33, teams: 97, contact: "Camila T.", active: true },
];

/* ---------- rubrics (editable per milestone in Admin → Review) ---------- */
const CRITERIA: RubricCriterion[] = [
  { id: "cr-1", labels: { en: "Market research", es: "Investigación de mercado" } },
  { id: "cr-2", labels: { en: "Innovation", es: "Innovación" } },
  { id: "cr-3", labels: { en: "Feasibility", es: "Viabilidad" } },
  { id: "cr-4", labels: { en: "Financial planning", es: "Planificación financiera" } },
  { id: "cr-5", labels: { en: "Presentation quality", es: "Calidad de presentación" } },
];
const IDEA_CRITERIA: RubricCriterion[] = [
  CRITERIA[0], CRITERIA[1],
  { id: "cr-6", labels: { en: "Local impact", es: "Impacto local" } },
  CRITERIA[4],
];

/* ---------- milestone configuration (admin-editable & reorderable) ---------- */
export const MILESTONES: MilestoneCfg[] = [
  {
    id: 0,
    name: { en: "Registration", es: "Registro" },
    blurb: { en: "Tell us who you are and register your team.", es: "Cuéntanos quiénes son y registra tu equipo." },
    guidance: {
      en: "1. Agree a team of 4–6 students.\n2. Assign roles: Captain, Finance, Marketing, Operations.\n3. Upload your signed registration form.\n\nTip: every member needs guardian consent on file.",
      es: "1. Forma un equipo de 4–6 estudiantes.\n2. Asigna roles: Capitán, Finanzas, Marketing, Operaciones.\n3. Sube el formulario de registro firmado.\n\nConsejo: cada miembro necesita el consentimiento de un adulto.",
    },
    accepts: ["document"],
    rubric: CRITERIA,
    due: "2025-10-10", points: 20, open: true,
  },
  {
    id: 1,
    name: { en: "Business Idea", es: "Idea de negocio" },
    blurb: { en: "Choose a real product or service for your community.", es: "Elige un producto o servicio real para tu comunidad." },
    guidance: {
      en: "1. List 5 problems in your community.\n2. Pick one your team can solve by selling something.\n3. Fill the Idea Canvas and add a photo of your brainstorming session.\n\nJudges love ideas built on local resources!",
      es: "1. Anota 5 problemas de tu comunidad.\n2. Elige uno que tu equipo pueda resolver vendiendo algo.\n3. Completa el Lienzo de Idea y añade una foto de su lluvia de ideas.\n\n¡A los jueces les encantan las ideas con recursos locales!",
    },
    video: "https://www.youtube.com/results?search_query=school+enterprise+challenge+business+idea",
    accepts: ["document", "image"],
    rubric: IDEA_CRITERIA,
    due: "2025-11-07", points: 100, open: true,
  },
  {
    id: 2,
    name: { en: "Business Plan", es: "Plan de negocio" },
    blurb: { en: "Research the market, cost your product and plan sales.", es: "Investiga el mercado, calcula costos y planea ventas." },
    guidance: {
      en: "1. Survey at least 10 potential customers.\n2. Cost ONE unit of your product, then set your price.\n3. Complete all 12 sections of the plan template.\n\nUpload early — slow internet at deadline time is common.",
      es: "1. Encuesta al menos a 10 clientes potenciales.\n2. Calcula el costo de UNA unidad y fija tu precio.\n3. Completa las 12 secciones de la plantilla.\n\nSube temprano — a la fecha límite el internet suele ir lento.",
    },
    accepts: ["document"],
    rubric: CRITERIA,
    due: "2025-12-12", points: 200, open: true,
  },
  {
    id: 3,
    name: { en: "Real Money", es: "Dinero real" },
    blurb: { en: "Launch, sell and record your first real revenue.", es: "Lanza, vende y registra tus primeros ingresos reales." },
    guidance: {
      en: "1. Launch on a market day and photograph your stall.\n2. Record every sale in the cash book.\n3. Upload your ledger photos and a short sales summary.\n\nEven a small first sale counts!",
      es: "1. Lanza un día de mercado y fotografía tu puesto.\n2. Registra cada venta en el libro de caja.\n3. Sube fotos del libro y un resumen de ventas.\n\n¡Incluso una pequeña primera venta cuenta!",
    },
    video: "https://www.youtube.com/results?search_query=school+business+market+day",
    accepts: ["image", "document"],
    rubric: CRITERIA,
    due: "2026-03-06", points: 200, open: false,
  },
  {
    id: 4,
    name: { en: "End of Year Report", es: "Informe final" },
    blurb: { en: "Report your results, learning and future plans.", es: "Reporta resultados, aprendizajes y planes futuros." },
    guidance: {
      en: "1. Total your revenue and profit.\n2. Write what went well, what was hard, what you learned.\n3. Say what happens to the profits — reinvest or spend them well.\n4. Optional: a 2-minute team video impresses judges.",
      es: "1. Suma tus ingresos y ganancias.\n2. Escribe qué salió bien, qué costó y qué aprendiste.\n3. Explica qué pasará con las ganancias.\n4. Opcional: un vídeo de equipo de 2 minutos impresiona a los jueces.",
    },
    accepts: ["document", "video"],
    rubric: CRITERIA,
    due: "2026-05-22", points: 300, open: false,
  },
];

/* ---------- the teacher/student's own teams ---------- */
export const MY_TEAMS: Team[] = [
  {
    id: "team-001", name: "Sunrise Juice Co.", school: "Lakeview Secondary School", country: "Kenya", code: "KE",
    region: "Africa", partnerId: "po-01", teacherName: "Amara K.", stage: 2, points: 540, hue: 28,
    members: [
      { id: "tm-1", name: "Amina O.", role: "Team Captain", consent: true },
      { id: "tm-2", name: "Baraka M.", role: "Finance Lead", consent: true },
      { id: "tm-3", name: "Ciku N.", role: "Marketing Lead", consent: true },
      { id: "tm-4", name: "Daudi K.", role: "Operations", consent: false },
    ],
    progress: {
      0: { status: "reviewed", fileName: "team-registration.pdf", submittedAt: "2025-09-28", score: 96, criteria: [10, 9, 10, 9, 10], feedback: "A wonderfully clear registration — your roles are well defined. Karibu to the challenge!" },
      1: { status: "reviewed", fileName: "business-idea-mango-juice.pdf", submittedAt: "2025-11-02", score: 88, criteria: [9, 9, 8, 8, 10], feedback: "Fresh mango juice from fruit that would otherwise rot — a very strong, local idea. Watch portion costing in the plan." },
      2: { status: "submitted", fileName: "sunrise-business-plan-v2.pdf", submittedAt: "2025-12-09" },
      3: { status: "locked" },
      4: { status: "locked" },
    },
  },
  {
    id: "team-002", name: "GreenLoop Plastics", school: "Lakeview Secondary School", country: "Kenya", code: "KE",
    region: "Africa", partnerId: "po-01", teacherName: "Amara K.", stage: 1, points: 295, hue: 152,
    members: [
      { id: "tm-5", name: "Ernest W.", role: "Team Captain", consent: true },
      { id: "tm-6", name: "Faith A.", role: "Production", consent: true },
      { id: "tm-7", name: "Grace T.", role: "Sales", consent: true },
    ],
    progress: {
      0: { status: "reviewed", fileName: "registration.pdf", submittedAt: "2025-10-01", score: 82, criteria: [8, 8, 9, 8, 8], feedback: "Solid start. Make sure every member signs the consent section next time." },
      1: { status: "returned", fileName: "idea-recycled-pens.pdf", submittedAt: "2025-11-20", feedback: "Recycled pens are promising — but tell us WHO buys them and WHY. Add 3 real customer quotes and resubmit." },
      2: { status: "locked" },
      3: { status: "locked" },
      4: { status: "locked" },
    },
  },
];

/* ---------- pre-existing school records (for duplicate detection at sign-up) ---------- */
export const EXISTING_SCHOOLS: string[] = [
  "Lakeview Secondary School",
  "Hillside Academy Kasarani",
  "St. Mary's High School",
  "Greenfield Girls' School",
  "New Hope Community School",
  "Sunrise Secondary School",
  "Kingsway College Nakuru",
  "Victory Day School",
  "Riverbank Institute",
  "Unity Secondary School",
  "Escuela Secundaria San Rafael",
  "Instituto San Rafael",
  "Colegio Nuevos Horizontes",
  "Govt. Senior School Jaipur",
  "Horizon High School Accra",
];

/* ---------- one seeded draft so autosave/persistence is visible immediately ---------- */
export const SEED_DRAFTS: Record<string, SubmissionDraft> = {
  "team-002:1": {
    text: "Our idea: refillable recycled pens for exam season.\n\nCustomers so far: students in Form 3 and 4 who lose pens weekly. We interviewed 6 students — 5 said they would pay 15 KES for a pen that lasts the term.\n\nTODO: add 3 more customer quotes (from Mrs. Banda's class) before we resubmit.",
    attachments: [],
    savedAt: "2025-12-11T08:32:00.000Z",
  },
};

/* ---------- 2,400 generated teams (scale!) ---------- */
const ADJ = ["Golden", "Swift", "Bright", "Urban", "River", "Solar", "Happy", "Prime", "Clever", "Green", "Little", "Bold", "Fresh", "Smart", "Noble", "Magic"];
const NOUN = ["Mangoes", "Bakers", "Weavers", "Growers", "Juicers", "Traders", "Makers", "Apiary", "Potters", "Tailors", "Recyclers", "Brewers", "Planters", "Crafters", "Bikes", "Snacks"];
const SCHOOLS = ["Secondary School", "High School", "Academy", "College", "Institute", "Community School", "Girls' School", "Day School"];
const TOWN = ["Lakeview", "Hillside", "Riverbank", "New Hope", "Sunrise", "Kingsway", "Greenfield", "Unity", "Victory", "Horizon", "Maple", "Cedar"];
const TEACHER = ["Ms. Otieno", "Mr. Patel", "Sra. Gómez", "Mrs. Adeyemi", "Mr. Kamau", "Prof. Rivera", "Ms. Nakato", "Mr. Silva", "Sra. Mendoza", "Mrs. Banda", "Mr. Nguyen", "Miss Wanjiru"];

export function generateTeams(count: number): Team[] {
  const teams: Team[] = [];
  for (let i = 0; i < count; i++) {
    const c = pick(COUNTRIES);
    const partner = PARTNERS.find((p) => p.country === c.name) ?? pick(PARTNERS);
    const stage = Math.min(4, Math.floor(rand() * rand() * 5.4));
    const progress: Team["progress"] = {};
    for (let m = 0; m < 5; m++) {
      progress[m] = m < stage ? { status: "reviewed", score: int(55, 100) } : m === stage ? { status: "open" } : { status: "locked" };
    }
    const points = Object.values(progress).reduce((a, p) => a + (p.score ?? 0), 0);
    teams.push({
      id: `gt-${i}`,
      name: `${pick(ADJ)} ${pick(NOUN)}`,
      school: `${pick(TOWN)} ${pick(SCHOOLS)}`,
      country: c.name, code: c.code, region: c.region,
      partnerId: partner.id,
      teacherName: pick(TEACHER),
      stage, points,
      members: [],
      progress,
      hue: int(0, 359),
    });
  }
  return teams;
}

/* ---------- automatic event → message templates (5.6) ---------- */
export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  { id: "tpl-welcome", event: "welcome", channels: ["email", "whatsapp"], enabled: true,
    subject: { en: "Welcome to the School Enterprise Challenge!", es: "¡Bienvenido al School Enterprise Challenge!" },
    body: { en: "Your school is registered. Start with Milestone 1: Registration — templates are waiting in Resources.", es: "Tu escuela está registrada. Empieza con el Hito 1: Registro — las plantillas te esperan en Recursos." } },
  { id: "tpl-d7", event: "deadline_7", channels: ["email"], enabled: true,
    subject: { en: "One week left for {milestone}", es: "Una semana para {milestone}" },
    body: { en: "Your deadline is in 7 days. Upload early in case of slow internet — drafts autosave.", es: "Tu fecha límite es en 7 días. Sube temprano por si falla el internet — los borradores se guardan solos." } },
  { id: "tpl-d1", event: "deadline_1", channels: ["email", "whatsapp"], enabled: true,
    subject: { en: "{milestone} closes tomorrow", es: "{milestone} cierra mañana" },
    body: { en: "Tomorrow, 23:59. Submit today to be safe — you can still resubmit after feedback.", es: "Mañana a las 23:59. Envía hoy por seguridad — puedes reenviar tras la revisión." } },
  { id: "tpl-sub", event: "submission_received", channels: ["whatsapp"], enabled: true,
    subject: { en: "We received your evidence", es: "Recibimos tu evidencia" },
    body: { en: "{file} is safely in the judging queue. A judge will review it within 7 days.", es: "{file} está en la cola de evaluación. Un juez la revisará en 7 días." } },
  { id: "tpl-fb", event: "feedback_ready", channels: ["email", "whatsapp"], enabled: true,
    subject: { en: "Feedback is ready for {team}", es: "Hay comentarios para {team}" },
    body: { en: "Your {milestone} was scored {score}/100. Read the judge's feedback — it's full of useful detail.", es: "Tu {milestone} fue calificado con {score}/100. Lee los comentarios del juez." } },
  { id: "tpl-ret", event: "returned", channels: ["email", "whatsapp"], enabled: true,
    subject: { en: "Your {milestone} needs a quick revision", es: "Tu {milestone} necesita una pequeña revisión" },
    body: { en: "The judge returned your work with notes. Improve it and resubmit — most gold winners did this too!", es: "El juez devolvió tu trabajo con notas. Mejóralo y reenvíalo — ¡la mayoría de ganadores también lo hizo!" } },
  { id: "tpl-re", event: "reengage", channels: ["whatsapp"], enabled: true,
    subject: { en: "We miss your team!", es: "¡Echamos de menos a tu equipo!" },
    body: { en: "No activity in a while. Your next step takes under an hour — open the app to continue.", es: "Sin actividad últimamente. Tu próximo paso toma menos de una hora — abre la app para continuar." } },
  { id: "tpl-man", event: "manual", channels: ["email", "whatsapp"], enabled: true,
    subject: { en: "Message from the SEC team", es: "Mensaje del equipo SEC" },
    body: { en: "Hi {team}! …", es: "¡Hola {team}! …" } },
];

/* ---------- reviewers (used for automatic + manual assignment) ---------- */
export const REVIEWERS = [
  { name: "Carlos M.", regions: ["Mesoamerica", "Latin America"] as Region[] },
  { name: "Elena V.", regions: ["Africa"] as Region[] },
  { name: "Marcus T.", regions: ["Asia"] as Region[] },
  { name: "Ingrid B.", regions: ["Europe", "Africa"] as Region[] },
];

export function autoAssign(country: string): string {
  const region = COUNTRIES.find((c) => c.name === country)?.region;
  const pool = REVIEWERS.filter((r) => !region || r.regions.includes(region));
  return (pool[0] ?? REVIEWERS[0]).name;
}

/* ---------- seeded delivery log (every message ever sent lives here) ---------- */
export function seedDeliveries(): Delivery[] {
  const events: [Delivery["event"], string][] = [
    ["welcome", "Amara K."], ["deadline_7", "Sunrise Juice Co."], ["deadline_7", "GreenLoop Plastics"],
    ["submission_received", "Sunrise Juice Co."], ["feedback_ready", "Sunrise Juice Co."],
    ["returned", "GreenLoop Plastics"], ["deadline_1", "Bright Mangoes"], ["reengage", "Swift Bakers"],
    ["feedback_ready", "Golden Weavers"], ["submission_received", "Happy Growers"],
    ["welcome", "Lucía G."], ["deadline_7", "Solar Traders"], ["feedback_ready", "Urban Makers"],
    ["reengage", "Prime Potters"], ["submission_received", "River Juicers"],
  ];
  const out: Delivery[] = events.flatMap(([event, to], i) => {
    const tpl = MESSAGE_TEMPLATES.find((t) => t.event === event)!;
    return tpl.channels.map((channel, j): Delivery => ({
      id: `dl-${i}-${j}`, to, channel, event,
      preview: `${tpl.subject.en} — ${tpl.body.en}`,
      at: `2025-12-${String(Math.max(1, 12 - i)).padStart(2, "0")} 09:${String(10 + i).padStart(2, "0")}`,
      status: "sent",
    }));
  });
  // scheduled deadline reminders queued for tomorrow
  out.unshift(
    { id: "dl-q1", to: "All teams — Kenya", channel: "whatsapp", event: "deadline_1", preview: `${MESSAGE_TEMPLATES[2].subject.en} — scheduled`, at: "queued", status: "queued" },
    { id: "dl-q2", to: "All teams — Honduras", channel: "email", event: "deadline_1", preview: `${MESSAGE_TEMPLATES[2].subject.en} — scheduled`, at: "queued", status: "queued" },
  );
  return out;
}

/* ---------- review queue seed ---------- */
const EVIDENCE_FILES = ["business-plan.pdf", "market-research.docx", "sales-ledger.xlsx", "idea-pitch.mp4", "financial-plan.pdf", "photo-report.zip"];

export function seedSubmissions(): Submission[] {
  const pool = generateTeams(60);
  const subs: Submission[] = [];
  for (let i = 0; i < 26; i++) {
    const t = pool[int(0, pool.length - 1)];
    const status = i < 16 ? "pending" : rand() > 0.5 ? "approved" : "returned";
    const isReviewed = status !== "pending";
    const criteria = isReviewed ? Array.from({ length: 5 }, () => int(4, 10)) : undefined;
    const total = criteria ? Math.round(criteria.reduce((a, b) => a + b, 0) * 2) : 0;
    const assignee = autoAssign(t.country);
    const submittedAt = `2025-12-${String(int(1, 12)).padStart(2, "0")}`;
    const history = isReviewed
      ? [
          // audit trail: many scored submissions had an earlier "returned" round first
          ...(rand() > 0.5 ? [{
            id: `se-${i}-a`, at: `2025-12-${String(int(1, 10)).padStart(2, "0")}`, by: assignee,
            decision: "returned" as const, total: int(35, 55), criteria: Array.from({ length: 5 }, () => int(3, 6)),
            feedback: "Needs more market research before I can score this higher.",
          }] : []),
          {
            id: `se-${i}-b`, at: `2025-12-${String(int(10, 12)).padStart(2, "0")}`, by: assignee,
            decision: status as "approved" | "returned", total, criteria: criteria!,
            feedback: "Good effort — see rubric for detail.",
          },
        ]
      : undefined;
    subs.push({
      id: `sub-${i}`,
      teamId: t.id, teamName: t.name, school: t.school, country: t.country,
      milestone: int(1, 3),
      fileName: pick(EVIDENCE_FILES),
      submittedAt,
      status: status as Submission["status"],
      assignee,
      reviewedAt: isReviewed ? `2025-12-${String(int(10, 12)).padStart(2, "0")}` : undefined,
      criteria,
      score: criteria ? total : undefined,
      feedback: criteria ? "Good effort — see rubric for detail." : undefined,
      history,
    });
  }
  // the demo teacher's own submission sits in the queue so the loop closes
  subs.unshift({
    id: "sub-demo", teamId: "team-001", teamName: "Sunrise Juice Co.", school: "Lakeview Secondary School",
    country: "Kenya", milestone: 2, fileName: "sunrise-business-plan-v2.pdf", submittedAt: "2025-12-09",
    status: "pending", assignee: autoAssign("Kenya"),
  });
  return subs;
}

/* ---------- chat threads ---------- */
export const THREADS: Thread[] = [
  {
    id: "th-1", title: "Mentor — Wanjiru M.", subtitle: "Ujasiri Foundation", hue: 24, unread: 2,
    messages: [
      { id: "mm-1", author: "Wanjiru M.", body: "Hi Sunrise team! Your idea score was excellent — well done.", at: "09:14" },
      { id: "mm-2", author: "Wanjiru M.", body: "For the business plan, remember to cost ONE cup of juice first, then scale up.", at: "09:15" },
      { id: "mm-3", author: "Me", body: "Thank you! We measured 250ml per cup and will cost the bottles tomorrow.", at: "09:41", mine: true },
      { id: "mm-4", author: "Wanjiru M.", body: "Perfect. Also photograph your market survey — judges love real evidence.", at: "10:02" },
    ],
  },
  {
    id: "th-2", title: "Team Sunrise chat", subtitle: "4 members", hue: 152, unread: 0,
    messages: [
      { id: "mm-5", author: "Amina O.", body: "Mango supplier confirmed for Thursday market day 🎯", at: "08:20" },
      { id: "mm-6", author: "Baraka M.", body: "I'll bring the ledger book so we can record every sale.", at: "08:24" },
      { id: "mm-7", author: "Me", body: "Great. Ciku, can you finish the poster by Wednesday?", at: "08:30", mine: true },
    ],
  },
  {
    id: "th-3", title: "TAMTF Support", subtitle: "Official programme help", hue: 200, unread: 1,
    messages: [
      { id: "mm-8", author: "SEC Support", body: "Reminder: Business Plan milestone closes 12 December. Upload early in case of slow internet!", at: "Mon" },
      { id: "mm-9", author: "Me", body: "We uploaded ours today — please confirm it arrived?", at: "Mon", mine: true },
      { id: "mm-10", author: "SEC Support", body: "Confirmed ✓ — sunrise-business-plan-v2.pdf is safely stored.", at: "Mon" },
    ],
  },
  {
    id: "th-4", title: "Judge Panel — Cohort 12", subtitle: "Announcements for judges", hue: 320, unread: 0,
    messages: [
      { id: "mm-11", author: "Head Judge", body: "Calibration call on Friday 15:00 UTC. We will score one plan together.", at: "Tue" },
      { id: "mm-12", author: "Me", body: "I'll be there — reviewing 14 plans this week.", at: "Tue", mine: true },
    ],
  },
];

/* ---------- notifications ---------- */
export const NOTIFICATIONS: AppNotification[] = [
  { id: "nt-1", title: "Business Plan submitted", body: "sunrise-business-plan-v2.pdf is now in the judging queue.", at: "2h", read: false, kind: "info" },
  { id: "nt-2", title: "You earned 88 points", body: "Your Business Idea was scored 88/100. Read the feedback!", at: "1d", read: false, kind: "award" },
  { id: "nt-3", title: "Deadline reminder", body: "Business Plan closes 12 December, 23:59 your time.", at: "2d", read: false, kind: "alert" },
  { id: "nt-4", title: "New mentor message", body: "Wanjiru M. replied in your team chat.", at: "3d", read: true, kind: "info" },
  { id: "nt-5", title: "Welcome to SEC 2025/26!", body: "60,000+ students are on this journey with you.", at: "1w", read: true, kind: "info" },
];

/* ---------- resource library ---------- */
export const RESOURCES: Resource[] = [
  { id: "rs-1", title: "Getting Started Guide", cat: "Guides", lang: "EN + ES", size: "1.2 MB", desc: "Everything a new teacher needs for week one.", body: "Welcome to the School Enterprise Challenge!\n\n1. Form a team of 4–6 students.\n2. Agree roles: Captain, Finance, Marketing, Operations.\n3. Register before the deadline.\n4. Check milestones — each one has a template.\n\nTip: work in short weekly sessions; small steps win." },
  { id: "rs-2", title: "Business Idea Canvas", cat: "Templates", lang: "EN + ES", size: "400 KB", desc: "One-page canvas to choose your product.", body: "BUSINESS IDEA CANVAS\n\nProblem: What does your community need?\nProduct: What will you sell?\nCustomer: Who buys it, and why?\nPrice: What will you charge?\nCompetition: Who else sells this?\nEdge: Why are you better?" },
  { id: "rs-3", title: "Business Plan Template", cat: "Templates", lang: "EN + ES", size: "820 KB", desc: "The full 12-section plan judges score.", body: "BUSINESS PLAN TEMPLATE\n\n1. Executive summary\n2. The product\n3. Market research\n4. Customers\n5. Competitors\n6. Marketing plan\n7. Operations plan\n8. Costing one unit\n9. Pricing\n10. Sales forecast\n11. Profit & reinvestment\n12. Risks" },
  { id: "rs-4", title: "Simple Cash Book", cat: "Finance", lang: "EN + ES", size: "300 KB", desc: "Record every coin in and out.", body: "CASH BOOK\n\nDate | Description | Money in | Money out | Balance\nKeep it next to the money box. Count cash weekly. Two students must sign every entry." },
  { id: "rs-5", title: "Costing & Pricing Sheet", cat: "Finance", lang: "EN + ES", size: "350 KB", desc: "Cost one unit, set a price, find profit.", body: "COSTING ONE UNIT\n\nMaterials + packaging + transport = unit cost.\nPrice = unit cost + profit margin.\nIf customers won't pay that price, cut costs — not quality." },
  { id: "rs-6", title: "Marketing on a Zero Budget", cat: "Marketing", lang: "EN + ES", size: "1.4 MB", desc: "Posters, word of mouth and market days.", body: "ZERO-BUDGET MARKETING\n\n• Hand-made posters at school gates\n• Free samples on market day\n• Customer quotes as proof\n• Announce at assembly\n• Consistent stall colours" },
  { id: "rs-7", title: "Winning Example: Mango Juice", cat: "Templates", lang: "EN", size: "2.1 MB", desc: "A gold-award plan from Kenya, 2024.", body: "GOLD AWARD EXAMPLE\n\nSunrise Juice sold 1,140 cups in 8 weeks.\nUnit cost: 8 KES. Price: 20 KES.\nReinvested profits into a cooler box.\nJudge note: 'Best unit economics we saw this year.'" },
  { id: "rs-8", title: "Guía del Docente", cat: "Guides", lang: "ES", size: "1.1 MB", desc: "Guía completa para docentes, en español.", body: "BIENVENIDO\n\n1. Forma un equipo de 4–6 estudiantes.\n2. Asigna roles claros.\n3. Revisa las fechas límite.\n4. Usa las plantillas de cada hito.\n\nConsejo: sesiones cortas y semanales funcionan mejor." },
  { id: "rs-9", title: "End of Year Report Template", cat: "Templates", lang: "EN + ES", size: "640 KB", desc: "Tell your year story with numbers.", body: "END OF YEAR REPORT\n\n• Total revenue & profit\n• What went well (3 things)\n• What was hard (3 things)\n• What you learned\n• What happens to the profits\n• Photos of the team at work" },
  { id: "rs-10", title: "Video: Judge Tips (3 min)", cat: "Videos", lang: "EN", size: "Stream", desc: "Head judge explains what wins awards.", body: "VIDEO TRANSCRIPT\n\nHi! I'm an SEC head judge. The plans that score highest always show REAL evidence: photos of customers, actual costs, honest risks. Don't write a novel — show us the numbers." },
  { id: "rs-11", title: "Video: Market Day Success", cat: "Videos", lang: "ES", size: "Stream", desc: "Cómo un equipo de Honduras vendió todo.", body: "TRANSCRIPCIÓN\n\nEl equipo preparó 50 tazas de café de su parcela. Cartel grande, muestras gratis a las 7am, precio claro. Vendieron todo en 3 horas." },
  { id: "rs-12", title: "Safeguarding & Consent Pack", cat: "Guides", lang: "EN + ES", size: "520 KB", desc: "Guardian consent forms and safety rules.", body: "SAFEGUARDING\n\n• Every student needs guardian consent on file.\n• Adults are verified before contacting teams.\n• Never share student surnames or photos publicly.\n• Report concerns to safeguarding@teachamantofish.org.uk" },
];

/* ---------- admin people table ---------- */
const FIRST = ["Amara", "Diya", "Carlos", "Lucía", "Priya", "Wanjiru", "Arjun", "Marco", "Grace", "Diego", "Amina", "Baraka", "Sofía", "Farhana", "Ramon", "Beatriz", "Camila", "David", "Elena", "Felix", "Hana", "Ivan", "Julia", "Kofi", "Lena", "Mateo"];
const LASTI = ["K.", "P.", "G.", "M.", "O.", "R.", "N.", "S.", "T.", "A.", "L.", "V.", "B.", "D.", "Q.", "J."];
const ROLES: User["role"][] = ["student", "student", "student", "teacher", "teacher", "reviewer", "partner"];

export function seedAdminUsers(): AdminUser[] {
  const users: AdminUser[] = [];
  for (let i = 0; i < 56; i++) {
    const c = pick(COUNTRIES);
    users.push({
      id: `au-${i}`,
      name: `${pick(FIRST)} ${pick(LASTI)}`,
      email: `user${i + 1}@example.org`,
      role: i % 17 === 0 ? "admin" : pick(ROLES),
      country: c.name,
      status: rand() > 0.92 ? "suspended" : "active",
      joined: `2025-${String(int(5, 12)).padStart(2, "0")}-${String(int(1, 28)).padStart(2, "0")}`,
    });
  }
  return users;
}

/* ---------- announcements ---------- */
export const seedAnnouncements: Announcement[] = [
  { id: "an-1", title: "Business Plan deadline — 12 December", body: "Upload early in case of slow internet. Late plans lose 10 points per day.", at: "3 Dec 2025", audience: "all" },
  { id: "an-2", title: "New Spanish resources live", body: "Guía del Docente and two new videos are now in the library.", at: "28 Nov 2025", audience: "all" },
];

/* ---------- charts ---------- */
export const TREND12 = [420, 510, 488, 640, 700, 690, 812, 788, 905, 1120, 1244, 1390];

export const REGION_STATS: { region: Region; teams: number; schools: number }[] = [
  { region: "Africa", teams: 1832, schools: 312 },
  { region: "Asia", teams: 2610, schools: 486 },
  { region: "Mesoamerica", teams: 1204, schools: 238 },
  { region: "Latin America", teams: 978, schools: 214 },
  { region: "Europe", teams: 214, schools: 61 },
];

/* ---------- demo personas for one-tap login ---------- */
export const PERSONAS: User[] = [
  { id: "u-teacher", name: "Amara K.", email: "amara@lakeview.sc.ke", role: "teacher", country: "Kenya", school: "Lakeview Secondary School", partnerId: "po-01", hue: 28 },
  { id: "u-student", name: "Amina O.", email: "amina.o@lakeview.sc.ke", role: "student", country: "Kenya", school: "Lakeview Secondary School", hue: 190 },
  { id: "u-reviewer", name: "Carlos M.", email: "carlos@judges.sec.org", role: "reviewer", country: "Honduras", hue: 340 },
  { id: "u-partner", name: "Lucía G.", email: "lucia@fundemprende.org", role: "partner", country: "Honduras", partnerId: "po-03", hue: 12 },
  { id: "u-admin", name: "Priya S.", email: "priya@teachamantofish.org.uk", role: "admin", country: "United Kingdom", hue: 265 },
];

/* keep the unused-import warning away in older TS configs */
export type { AU };
