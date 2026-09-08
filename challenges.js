/**
 * IKIGAI.DELHI — Challenge & Problem Statement Dossiers
 * 
 * ORGANIZERS: Add or modify technical dossiers here.
 * Operational lines inspired by Delhi transit conduits:
 * LINE 01: Civic & Geospatial (Social Impact)
 * LINE 02: Machine Intelligence & Autonomous Systems (AI)
 * LINE 03: Distributed Protocols & High-Throughput Web (Web3/Cloud)
 * LINE 04: Wildcard & Open Innovation
 */

export const challengeCategories = [
  { id: "all", label: "ALL DOSSIERS", line: "ALL" },
  { id: "social", label: "LINE 01 // CIVIC & GEOSPATIAL", line: "LINE 01" },
  { id: "ai", label: "LINE 02 // INTELLIGENT SYSTEMS", line: "LINE 02" },
  { id: "web", label: "LINE 03 // DISTRIBUTED ARCHITECTURE", line: "LINE 03" },
  { id: "open", label: "LINE 04 // OPEN METROPOLITAN", line: "LINE 04" }
];

export const challenges = [
  {
    id: "DOSSIER-01",
    number: "DOSSIER // 01",
    line: "LINE 01",
    category: "social",
    categoryLabel: "Civic & Geospatial",
    title: "Community Radar & Civic Incident Mesh",
    difficulty: "INTERMEDIATE",
    complexityGauge: "■■■□□",
    summary: "Empower citizens and local student communities to flag, cryptographically verify, and monitor municipal infrastructure anomalies across Delhi NCR in real time.",
    problemStatement: "Citizens frequently observe civic emergencies and infrastructural failures (broken drainage, hazardous transit crossings, unlit corridors) but lack a direct, tamper-proof, transparent ledger to report, track resolution latency, or mobilize neighborhood response squads.",
    requirements: [
      "Geolocation-indexed incident reporting with verifiable media attestations",
      "Street-level geospatial vector map with status markers (Active, In-Triage, Resolved)",
      "Sybil-resistant community upvoting to prevent spam and false alarms",
      "Public transparency telemetry dashboard with resolution speed metrics",
      "Exportable summary manifests for local authorities and resident welfare collectives"
    ],
    suggestedTech: ["React / Svelte", "Leaflet / Mapbox / OpenStreetMap", "Node.js / FastAPI", "PostgreSQL / PostGIS", "PWA"],
    deliverables: "Functional PWA or web portal featuring real-time map clustering, incident logging lifecycle, and citizen verification workflow."
  },
  {
    id: "DOSSIER-02",
    number: "DOSSIER // 02",
    line: "LINE 02",
    category: "ai",
    categoryLabel: "Intelligent Systems",
    title: "Autonomous Developer Reliability Agent",
    difficulty: "ADVANCED",
    complexityGauge: "■■■■□",
    summary: "Engineer local-first or API-orchestrated agents capable of auditing dependency trees, synthesizing pull request diffs, and verifying documentation integrity under tight constraints.",
    problemStatement: "Modern engineering teams lose hundreds of hours each sprint manually tracing transitive dependency vulnerabilities, resolving ambiguous merge conflicts, and hunting deprecated endpoints across fragmented documentation.",
    requirements: [
      "Deterministic AST inspection or dependency graph vulnerability scanner",
      "Context-aware agent pipeline with deterministic fallbacks and guardrails",
      "CLI or minimal web dashboard presenting actionable diff recommendations",
      "Rigorous hallucination prevention mechanisms and code injection sandboxing",
      "Empirical benchmark evaluating time-to-review against sample repositories"
    ],
    suggestedTech: ["Python / Rust / TypeScript", "Tree-sitter", "LiteLLM / Ollama / Local Models", "Docker Sandboxes", "FastAPI"],
    deliverables: "Working agent engine or developer CLI with a recorded or live audit on a real-world multi-module codebase."
  },
  {
    id: "DOSSIER-03",
    number: "DOSSIER // 03",
    line: "LINE 03",
    category: "web",
    categoryLabel: "Distributed Architecture",
    title: "High-Throughput Cryptographic Event Credentials",
    difficulty: "INTERMEDIATE",
    complexityGauge: "■■■□□",
    summary: "Architect a tamper-proof, bot-resistant credentialing engine for high-density metropolitan events and hackathon check-in turnstiles.",
    problemStatement: "Large-scale developer conventions and cultural gatherings in metropolitan Delhi struggle with ticket scalping, fraudulent badge duplication, and gate check-in failures under poor venue network connectivity.",
    requirements: [
      "Cryptographically signed dynamic QR passes or verifiable credentials",
      "Strict anti-scalping mechanisms with programmable transfer restrictions",
      "Offline-first validator client capable of zero-latency venue badge verification",
      "High-concurrency reservation queue handling massive traffic bursts",
      "Audit log guaranteeing zero duplicate admissions"
    ],
    suggestedTech: ["Next.js / SvelteKit", "WebCrypto API / Ed25519", "Redis / Valkey", "Tailwind CSS / Pure CSS", "IndexedDB"],
    deliverables: "End-to-end credential issuance portal + offline-capable gate scanner application with live stress-tested issuance."
  },
  {
    id: "DOSSIER-04",
    number: "DOSSIER // 04",
    line: "LINE 01",
    category: "social",
    categoryLabel: "Civic & Geospatial",
    title: "Hyperlocal Air Quality & Transit Heat Shield",
    difficulty: "BEGINNER TO INTERMEDIATE",
    complexityGauge: "■■□□□",
    summary: "Combine microclimate sensor data and transit paths to calculate clean-air, shaded pedestrian and cycling corridors across Delhi NCR.",
    problemStatement: "Severe seasonal smog and extreme urban heat island spikes across Delhi directly impact commuters and students who lack street-level environmental exposure forecasts and shaded navigation routes.",
    requirements: [
      "Ingestion and normalization of real-time CPCB and OpenAQ sensor streams",
      "Route recommendation algorithm optimizing for minimal particulate exposure and maximum shade",
      "Actionable health advisories segmented by ambient severity thresholds",
      "Crowdsourced catalog of public hydrations spots, metro transit hubs, and cooling zones",
      "High-contrast, lightweight mobile-first interface optimized for outdoor visibility"
    ],
    suggestedTech: ["JavaScript / React", "OpenAQ Feeds / CPCB API", "GeoJSON", "Turf.js", "Chart.js / Canvas"],
    deliverables: "Mobile-responsive application comparing standard vs. environmental-optimized urban transit routes with live sensor metrics."
  },
  {
    id: "DOSSIER-05",
    number: "DOSSIER // 05",
    line: "LINE 04",
    category: "open",
    categoryLabel: "Open Metropolitan",
    title: "Wildcard: The Delhi Urban Machine",
    difficulty: "ALL LEVELS",
    complexityGauge: "■■■■■",
    summary: "Unconstrained operational vector. Identify a critical inefficiency in city life, developer tooling, or technical infrastructure and engineer an audacious solution.",
    problemStatement: "The most impactful breakthroughs emerge when builders break constraints. Whether re-engineering transit tracking, local food rescue systems, open developer infrastructure, or decentralized collaboration—build what matters.",
    requirements: [
      "Clear, demonstrative real-world utility addressing an acute user or developer problem",
      "Authentic working prototype built entirely during the 48-hour hacking window",
      "Rigorous documentation including architecture blueprints and setup manifests",
      "Live deployment accessible via a public URL or executable distribution",
      "A sharp, concise technical demonstration"
    ],
    suggestedTech: ["Any modern stack: TypeScript, Rust, Go, Python, React, Flutter, Node.js, WebAssembly"],
    deliverables: "Working software with public GitHub repository, live web deployment, and 3-minute technical walkthrough."
  }
];
