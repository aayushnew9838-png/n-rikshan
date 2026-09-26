// ─────────────────────────────────────────────────────────
//  NIRIKSHAN — Central Data File
//  All content values live here. Touch only this file to
//  update copy, team info, KPIs, roadmap, FAQ, etc.
// ─────────────────────────────────────────────────────────

// ── KPI strip (illustrative demo data) ──────────────────
export const kpis = [
  { value: '78%', label: 'Highest bust probability', note: 'demo' },
  { value: '62', label: 'High-risk regions flagged', note: 'demo' },
  { value: 'Day 5', label: 'Most uncertain horizon', note: 'demo' },
  { value: '84/100', label: 'National confidence index', note: 'demo' },
];

// ── Nav links ────────────────────────────────────────────
export const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Problem', to: '/problem' },
  { label: 'Solution', to: '/solution' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Tech Stack', to: '/tech-stack' },
  { label: 'Impact', to: '/impact' },
  { label: 'Team', to: '/team' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' },
];

// ── Site map cards (Home page grid) ─────────────────────
export const siteCards = [
  {
    title: 'Problem Statement',
    desc: "Why forecast bust detection matters for India's weather ecosystem.",
    to: '/problem',
    icon: '⚠️',
  },
  {
    title: 'Our Solution',
    desc: 'Five principles and the golden path through the Nirikshan interface.',
    to: '/solution',
    icon: '💡',
  },
  {
    title: 'Dashboard Preview',
    desc: 'Mockup screens and feature set of the operational dashboard.',
    to: '/dashboard',
    icon: '📊',
  },
  {
    title: 'Tech Stack',
    desc: 'Every library, layer, and architectural boundary explained.',
    to: '/tech-stack',
    icon: '🛠️',
  },
  {
    title: 'Impact & Roadmap',
    desc: "Who benefits and how we'll build it across six phases.",
    to: '/impact',
    icon: '🚀',
  },
  {
    title: 'The Team',
    desc: 'The builders behind Nirikshan and their roles.',
    to: '/team',
    icon: '👥',
  },
  {
    title: 'FAQ',
    desc: 'Common questions answered concisely.',
    to: '/faq',
    icon: '❓',
  },
  {
    title: 'Contact',
    desc: 'Reach us, find the repo, or watch the demo.',
    to: '/contact',
    icon: '✉️',
  },
];

// ── Problem roles ────────────────────────────────────────
export const problemRoles = [
  {
    role: 'Meteorological Analyst',
    icon: '🌦️',
    pain: 'Manually cross-checks multiple model outputs to judge reliability; no single view surfaces confidence degradation over the Day 1–10 horizon.',
  },
  {
    role: 'Disaster-Management Operator',
    icon: '🚨',
    pain: 'Acts on forecast alerts without knowing which predictions are likely to bust — resource deployment is based on incomplete reliability context.',
  },
  {
    role: 'Decision-Support Supervisor',
    icon: '📋',
    pain: 'Responsible for briefings and policy decisions that depend on forecast trustworthiness, yet reliability data is buried in technical outputs.',
  },
];

// ── Solution principles ──────────────────────────────────
export const solutionPrinciples = [
  {
    num: '01',
    title: 'Understand',
    desc: 'Give the operator a single, unambiguous view of the full national confidence landscape at a glance.',
  },
  {
    num: '02',
    title: 'Trust',
    desc: 'Quantify and display bust probability so trust decisions are data-driven, not gut-driven.',
  },
  {
    num: '03',
    title: 'Locate',
    desc: 'Surface high-risk regions spatially on an interactive India-wide map — no hunting.',
  },
  {
    num: '04',
    title: 'Explain',
    desc: 'Show which meteorological variables and ensemble members drove the uncertainty score.',
  },
  {
    num: '05',
    title: 'Act',
    desc: 'Provide a prioritised alert center so operators move from insight to action in one step.',
  },
];

// ── Golden path steps ────────────────────────────────────
export const goldenPath = [
  { step: 'Load', desc: "App fetches today's model run; overview tiles populate instantly." },
  { step: 'Orient', desc: 'Colour-coded map reveals national confidence at a glance.' },
  { step: 'Filter', desc: 'Day-selector and variable filters narrow the view.' },
  { step: 'Inspect', desc: 'Click a high-risk region; Day 1–10 timeline expands.' },
  { step: 'Drill', desc: 'Ensemble spread and historical analogs load in the detail panel.' },
  { step: 'Explain', desc: 'Explainability panel lists top contributing factors.' },
  { step: 'Act', desc: 'Alert center shows prioritised actions; export as PDF with one click.' },
];

// ── Dashboard mockup panels ──────────────────────────────
export const dashboardPanels = [
  {
    title: 'Overview',
    caption: 'National KPI tiles and top-level confidence index for the current model run.',
  },
  {
    title: 'Forecast Map',
    caption: 'India-wide colour-coded bust-probability heatmap for the selected forecast day.',
  },
  {
    title: 'Region Detail',
    caption: 'Day 1–10 confidence timeline, ensemble spread, and variable breakdown for a clicked region.',
  },
  {
    title: 'Alert Center',
    caption: 'Prioritised list of high-bust-risk regions with severity tags and one-click actions.',
  },
  {
    title: 'Analytics',
    caption: 'Historical bust-case library and inter-model comparison charts.',
  },
];

// ── Dashboard feature cards ──────────────────────────────
export const dashboardFeatures = [
  {
    icon: '🗺️',
    title: 'India-wide Confidence Map',
    desc: 'Interactive MapLibre GL JS map with per-district bust-probability choropleth overlay.',
  },
  {
    icon: '📅',
    title: 'Day 1–10 Confidence Timeline',
    desc: 'Recharts area chart showing how confidence degrades across the medium-range forecast window.',
  },
  {
    icon: '🎯',
    title: 'Bust Probability Scoring',
    desc: 'AI-derived 0–100 score per region per day, computed from ensemble spread and historical skill.',
  },
  {
    icon: '🔍',
    title: 'Explainability Panel',
    desc: 'Ranked list of meteorological variables and model members that most influenced the score.',
  },
  {
    icon: '🔔',
    title: 'Alert & Prioritisation Center',
    desc: 'Severity-ranked alert queue with operator notes, acknowledgement workflow, and PDF export.',
  },
  {
    icon: '📚',
    title: 'Historical Case Studies',
    desc: 'Searchable library of past forecast busts with analog matching for current patterns.',
  },
];

// ── Tech stack ───────────────────────────────────────────
export const techStack = [
  { name: 'React', role: 'Component-based UI layer and state management host.' },
  { name: 'Vite', role: 'Lightning-fast HMR dev server and optimised production bundler.' },
  { name: 'Tailwind CSS', role: 'Utility-first styling; CSS-variable tokens drive the theme system.' },
  { name: 'MapLibre GL JS', role: 'WebGL-powered interactive India map with vector tile overlays.' },
  { name: 'Recharts', role: 'Responsive SVG charts for confidence timelines and analytics.' },
  { name: 'TanStack Query', role: 'Server-state caching, background refetching, and stale-while-revalidate.' },
  { name: 'Zustand', role: 'Lightweight global UI state for filters, selected regions, and theme.' },
  { name: 'Zod', role: 'Runtime API response validation to catch schema drift early.' },
  { name: 'jsPDF', role: 'Client-side PDF export of alerts and confidence reports.' },
];

// ── Architecture layers ──────────────────────────────────
export const archLayers = [
  { num: '01', name: 'App Shell', desc: 'Router, theme context, header, footer, and global error boundary.' },
  { num: '02', name: 'Data Layer', desc: 'TanStack Query hooks + Zod-validated REST/JSON endpoints. Never touches model code.' },
  { num: '03', name: 'Map Layer', desc: 'MapLibre GL JS canvas with dynamic bust-probability vector tiles.' },
  { num: '04', name: 'Analytics Layer', desc: 'Recharts dashboards — timelines, ensemble spread, inter-model diffs.' },
  { num: '05', name: 'Detail Layer', desc: 'Region drill-down: explainability panel, historical analogs, metadata.' },
  { num: '06', name: 'Export Layer', desc: 'jsPDF report generation triggered from the Alert Center.' },
];

// ── Impact audience ──────────────────────────────────────
export const impactRoles = [
  {
    role: 'Meteorological Analyst',
    icon: '🌦️',
    value: 'A single confidence dashboard replaces manual multi-model cross-checks — hours of work become seconds.',
  },
  {
    role: 'Disaster-Management Operator',
    icon: '🚨',
    value: 'Bust-probability scores and a prioritised alert queue enable data-driven resource deployment decisions.',
  },
  {
    role: 'Decision-Support Supervisor',
    icon: '📋',
    value: 'One-click PDF briefings with explainable confidence data replace manual report compilation.',
  },
];

// ── Roadmap phases ───────────────────────────────────────
export const roadmapPhases = [
  {
    phase: '01',
    title: 'Shell + API Mock',
    desc: 'Routing skeleton, theme system, design tokens, and mock JSON fixtures for all endpoints.',
    status: 'complete',
  },
  {
    phase: '02',
    title: 'Core Dashboard',
    desc: 'Overview tiles, confidence map, Day 1–10 timeline, and basic filtering controls.',
    status: 'in-progress',
  },
  {
    phase: '03',
    title: 'Deep Inspection',
    desc: 'Region drill-down, explainability panel, ensemble spread charts, and historical analog lookup.',
    status: 'planned',
  },
  {
    phase: '04',
    title: 'Production Polish',
    desc: 'Accessibility audit, responsive breakpoint hardening, animation refinement, and performance budget.',
    status: 'planned',
  },
  {
    phase: '05',
    title: 'Integration',
    desc: 'Replace mock fixtures with live NCMRWF REST API; Zod validation of real responses.',
    status: 'planned',
  },
  {
    phase: '06',
    title: 'Demo Hardening',
    desc: 'Offline-capable demo mode, guided walkthrough overlay, and SIH presentation artefacts.',
    status: 'planned',
  },
];

// ── Team ─────────────────────────────────────────────────
export const teamName = 'Team Nirikshan';
export const teamInstitution = 'Smart India Hackathon 2026 | SIH26079';

export const teamMembers = [
  {
    name: 'Janvi Sharma',
    role: 'Team Lead & ML Engineer',
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/',
    initials: 'JS',
  },
  {
    name: 'Aniket Kumar',
    role: 'Frontend Developer',
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/',
    initials: 'AK',
  },
  {
    name: 'Priya Nair',
    role: 'Data Engineer',
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/',
    initials: 'PN',
  },
  {
    name: 'Rahul Verma',
    role: 'Backend Developer',
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/',
    initials: 'RV',
  },
  {
    name: 'Sneha Patel',
    role: 'UI/UX Designer',
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/',
    initials: 'SP',
  },
  {
    name: 'Dev Mehta',
    role: 'GIS & Mapping Specialist',
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/',
    initials: 'DM',
  },
];

// ── FAQ ──────────────────────────────────────────────────
export const faqs = [
  {
    q: 'Does Nirikshan replace the weather forecast?',
    a: 'No — it tells you how much to trust it. Nirikshan sits alongside operational forecasts and surfaces bust-probability scores, so meteorologists and operators can make better-informed decisions about when to act and when to wait.',
  },
  {
    q: 'What is a "forecast bust"?',
    a: 'A forecast bust occurs when a model prediction differs significantly from observed reality — for example, predicting no rain when heavy rainfall occurs, or vice versa. Bust detection quantifies the likelihood of this failure before the event.',
  },
  {
    q: 'What data does Nirikshan use?',
    a: 'Nirikshan consumes ensemble model output from NCMRWF, historical verification archives, and gridded observational data. The frontend communicates with a REST/JSON API; it never directly accesses model files or raw GRIB data.',
  },
  {
    q: 'How is the bust-probability score calculated?',
    a: 'The score combines ensemble spread metrics, historical model skill scores for each region-season combination, and AI-derived pattern similarity to past bust cases. The specific ML methodology lives entirely in the backend.',
  },
  {
    q: 'Is the dashboard data real-time?',
    a: 'In the current demo phase, the dashboard uses realistic illustrative data clearly labelled as such. Phase 5 of the roadmap integrates the live NCMRWF API once the interface is validated.',
  },
  {
    q: 'Is Nirikshan open source?',
    a: 'The frontend codebase is open source. The ML backend and API layer will be governed by NCMRWF data-use policies. See the GitHub link on the Contact page.',
  },
];

// ── Contact ──────────────────────────────────────────────
export const contactInfo = {
  email: 'team.nirikshan@example.com',
  github: 'https://github.com/nirikshan-sih',
  demo: 'https://www.youtube.com/',
};
