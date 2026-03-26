export type CSSPalette = {
  primary: string;
  "primary-rgb": string;
  secondary: string;
  accent: string;
  "accent-rgb": string;
  "bg-deep": string;
  "bg-mid": string;
  glow: string;
  "glow-strong": string;
  gradient: string;
  "card-border": string;
  "text-dim": string;
};

export type Connection = {
  hero: string;
  slug: string;
  class: string;
  relation: string;
  workflow: string;
  agent_count: number;
};

import { SquadMeta } from "@/lib/agents";

export type HeroConfig = {
  name: string;
  class_title: string;
  origin_line: string;
  bio: string;
  quote: string;
  universe_role: string;
  color_signature: string;
  faction: string;
  status: string;
  palette: CSSPalette;
  suit_philosophy: string;
  connections: Connection[];
  squad?: SquadMeta;
};

export const heroOrder = ['thoren', 'ramet', 'nexar', 'lyra', 'kairo', 'nefra', 'horusen'];
export const heroData: Record<string, HeroConfig> = {
  "thoren": {
    "name": "THOREN",
    "class_title": "The Law",
    "origin_line": "Before Ramet learned to stabilize and before Nexar learned to disrupt, Thoren wrote the rules they both think they understand.",
    "bio": "Thoren is the reference state \u2014 the original measurement against which every force, every field, and every protocol in the Grid is calibrated. He does not channel energy because he IS energy's benchmark. His silver coat is not a costume; it is a living document, woven from light-holding nano-weave fabric that absorbs photons and releases them slowly, turning law into luminance. The diamond patterns embossed across his chest are compressed legal architecture \u2014 the original Grid protocols written into fabric by the founders of the system. When fully invoked, those patterns become readable text: ancient Khemet script translated to code. The coat has been worn by exactly one person. It chose him.",
    "quote": "I don't enforce the rules. I am the reason rules exist.",
    "universe_role": "Thoren is the Grid's constitutional anchor and commands 13 agents who encode the foundational rules of business: financial models, capital strategy, legal compliance, brand protection, marketing copy standards, ad frameworks, affiliate systems, character creation protocols, and sales storytelling structures. Every protocol, every boundary, every governance structure traces back to his original codex. Without Thoren's squad, there are no standards \u2014 only noise pretending to be strategy.",
    "color_signature": "#C0C0C0",
    "faction": "Founders",
    "status": "Active \u2014 Immutable",
    "palette": {
      "primary": "#C0C0C0",
      "primary-rgb": "192, 192, 192",
      "secondary": "#E0E0E0",
      "accent": "#D4AF37",
      "accent-rgb": "212, 175, 55",
      "bg-deep": "#0d0f14",
      "bg-mid": "#151820",
      "glow": "rgba(212,175,55,0.15)",
      "glow-strong": "rgba(212,175,55,0.4)",
      "gradient": "linear-gradient(135deg, #0d0f14 0%, #151820 100%)",
      "card-border": "rgba(212,175,55,0.2)",
      "text-dim": "rgba(255,255,255,0.6)"
    },
    "suit_philosophy": "",
    "connections": [],
    "squad": {
      "agent_count": 13,
      "squad_name": "The Codex Guard",
      "domain_summary": "Financial governance, legal frameworks, brand protection, marketing copy standards, storytelling architecture, and technical systems design",
      "categories": {
        "Marketing": 5,
        "Writing": 2,
        "Finance & Capital": 2,
        "Finance & Operations": 1,
        "Jobseekers": 1,
        "Product & Engineering": 1,
        "Legal & Compliance": 1
      }
    }
  },
  "ramet": {
    "name": "RAMET",
    "class_title": "The Stabilizer",
    "origin_line": "Nothing on his suit is symmetrical by accident \u2014 asymmetry IS the design principle for optimal field stabilization.",
    "bio": "Ramet is the force that holds fractured systems together before anyone realizes they were breaking. His dark nano-composite suit is embedded with stabilization field generators that project multifaceted energy arrays \u2014 not symmetrical, never balanced, because true stability requires constant asymmetric correction. The red energy that bleeds along fracture lines in his armor is not a flow; it follows fracture physics, appearing only where destabilization has already begun, sealing it before damage propagates. In standby mode, his suit appears as slightly off-balance panels \u2014 subtly unsettling if you notice, invisible if you don't. The suit doesn't announce itself. It stabilizes before the destabilization event is apparent.",
    "quote": "You didn't feel the earthquake because I was already standing on the fault line.",
    "universe_role": "Ramet is the Grid's emergency infrastructure and commands 12 agents who stabilize the operational layer of business: e-commerce performance, career readiness, sales communication pipelines, blog content engines, digital marketing execution, market research, community cohesion, thought leadership positioning, and founder-level leadership coaching. When Thoren's laws encounter real-world stress and systems begin to fragment under transformation pressure \u2014 Ramet's squad is the reason everything holds.",
    "color_signature": "#1A3A3A",
    "faction": "Grid Operatives",
    "status": "Active \u2014 Monitoring",
    "palette": {
      "primary": "#4ECDC4",
      "primary-rgb": "78, 205, 196",
      "secondary": "#A8E6CF",
      "accent": "#00B4D8",
      "accent-rgb": "0, 180, 216",
      "bg-deep": "#0a1214",
      "bg-mid": "#0f1a1e",
      "glow": "rgba(78,205,196,0.15)",
      "glow-strong": "rgba(78,205,196,0.35)",
      "gradient": "linear-gradient(135deg, #0a1214 0%, #0f1a1e 100%)",
      "card-border": "rgba(78,205,196,0.2)",
      "text-dim": "rgba(255,255,255,0.6)"
    },
    "suit_philosophy": "",
    "connections": [],
    "squad": {
      "agent_count": 12,
      "squad_name": "The Fault Line Brigade",
      "domain_summary": "E-commerce optimization, career stabilization, sales communication, content marketing, market intelligence, community building, and leadership resilience",
      "categories": {
        "Marketing": 3,
        "Sales and Communication": 3,
        "Jobseekers": 2,
        "E-commerce": 1,
        "Community": 1,
        "Marketing & Personal Brand": 1,
        "Leadership": 1
      }
    }
  },
  "nexar": {
    "name": "NEXAR",
    "class_title": "The Destabilizer",
    "origin_line": "The suit doesn't announce itself \u2014 it reveals itself when it's too late.",
    "bio": "Nexar is controlled chaos. He is the force that tears apart what no longer serves the Grid so that something better can be built. His dark nano-composite armor is embedded with disruption emitters that channel red energy not as circuits but as fracture lines \u2014 cracks in reality that bleed light from within. Nothing on his suit is symmetrical, because disruption doesn't follow predictable geometry. The aggressive angular pauldrons and asymmetric chest plates are designed to look almost normal in standby \u2014 just slightly wrong geometry, enough to make you uncomfortable if you stare too long. When fully activated, the red fractures spread beyond the suit panels and arc into the environment itself. Nexar doesn't destroy systems. He reveals what was already broken.",
    "quote": "I didn't break your system. I showed you where it was already cracking.",
    "universe_role": "Nexar is the Grid's necessary destruction and commands 12 agents who challenge, disrupt, and expose what's broken: cold email strategies that pierce resistance, SEO warfare that displaces weak competitors, innovation frameworks that shatter old thinking, risk assessments that map hidden dangers, pricing strategies that expose unrealized revenue, operational automation that replaces manual chaos, and data analytics that reveal uncomfortable truths. Every legacy process that resists transformation \u2014 Nexar's squad finds the fracture line and makes it visible.",
    "color_signature": "#8B0000",
    "faction": "Grid Operatives",
    "status": "Active \u2014 Standby",
    "palette": {
      "primary": "#FF4444",
      "primary-rgb": "255, 68, 68",
      "secondary": "#FF8888",
      "accent": "#FF2222",
      "accent-rgb": "255, 34, 34",
      "bg-deep": "#100a0a",
      "bg-mid": "#1a0f0f",
      "glow": "rgba(255,68,68,0.15)",
      "glow-strong": "rgba(255,68,68,0.4)",
      "gradient": "linear-gradient(135deg, #100a0a 0%, #1a0f0f 100%)",
      "card-border": "rgba(255,68,68,0.2)",
      "text-dim": "rgba(255,255,255,0.6)"
    },
    "suit_philosophy": "",
    "connections": [],
    "squad": {
      "agent_count": 12,
      "squad_name": "The Fracture Corps",
      "domain_summary": "Disruptive marketing, creative tool innovation, operational automation, data-driven challenge, strategic risk exposure, and customer success disruption",
      "categories": {
        "Marketing": 3,
        "Assistants": 2,
        "Writing": 2,
        "Creative Tools": 1,
        "Data & Analytics": 1,
        "Customer Success": 1,
        "Strategy & Growth": 1,
        "Operations": 1
      }
    }
  },
  "lyra": {
    "name": "LYRA",
    "class_title": "Visionary Systems Architect",
    "origin_line": "She doesn't see what exists \u2014 she sees what everything is becoming, and builds the bridge between the two.",
    "bio": "Lyra is the Grid's forward sight. Where Thoren wrote the original laws and Ramet holds the present together, Lyra designs the future architecture that the Grid is evolving toward. Her deep forest green tactical suit carries gold orbit-line patterns across the back panel that form an architectural map \u2014 not decorative, but a living blueprint of systems she's designing in real time. The holographic interface trigger points at her wrists project system status indicators in orbital geometry, allowing her to monitor, model, and reshape entire infrastructures with gestural commands. Her chest panel displays a geometric orbital pattern \u2014 a navigation system that tracks every active project, every transformation in progress, every system under construction. Lyra doesn't fix things. She designs what replaces them.",
    "quote": "Stop defending what exists. Let me show you what it's supposed to become.",
    "universe_role": "Lyra is the Grid's architect of transformation and commands 13 agents who design the future-facing visibility and content systems: social media growth engines across TikTok, Instagram, Facebook, YouTube, and X, viral hook engineering, podcast production frameworks, newsletter architectures, email subject line science, presentation design systems, content summarization, and landing page conversion blueprints. She represents I-Gamify's strategic design capability \u2014 the ability to see an organization's future content state and engineer the path from here to there.",
    "color_signature": "#1B4332",
    "faction": "Grid Architects",
    "status": "Active \u2014 Designing",
    "palette": {
      "primary": "#2D6A4F",
      "primary-rgb": "45, 106, 79",
      "secondary": "#40916C",
      "accent": "#D4AF37",
      "accent-rgb": "212, 175, 55",
      "bg-deep": "#0a100c",
      "bg-mid": "#0f1a14",
      "glow": "rgba(212,175,55,0.15)",
      "glow-strong": "rgba(212,175,55,0.35)",
      "gradient": "linear-gradient(135deg, #0a100c 0%, #0f1a14 100%)",
      "card-border": "rgba(212,175,55,0.2)",
      "text-dim": "rgba(255,255,255,0.6)"
    },
    "suit_philosophy": "",
    "connections": [],
    "squad": {
      "agent_count": 13,
      "squad_name": "The Orbital Design Corps",
      "domain_summary": "Social media growth architecture, content creation systems, platform-native strategy, viral engineering, podcast and newsletter design, and landing page conversion blueprints",
      "categories": {
        "Social Media": 7,
        "Content Creation": 5,
        "Creative Tools": 1
      }
    }
  },
  "kairo": {
    "name": "KAIRO",
    "class_title": "Precision Stream Warrior",
    "origin_line": "Where others see data, Kairo sees the single thread that unravels everything \u2014 and he pulls it with surgical accuracy.",
    "bio": "Kairo is the Grid's scalpel. His dark navy armor is embedded with purple geometric circuit lines that don't just glow \u2014 they compute. The precision-stream interface on his forearm runs reactive scripts that converge at the wrist, turning raw data torrents into actionable intelligence in milliseconds. When his holographic panels deploy, they display targeting geometry on his chest panel \u2014 a focusing mechanism that identifies the exact point of intervention in any system. The ancient precision symbols running down his spine are not decoration; they are the Grid's original targeting language, a script so old it predates the protocols Thoren encoded. Kairo doesn't overwhelm with force. He finds the one point where minimal pressure creates maximum change.",
    "quote": "A thousand data points. One answer. I already found it.",
    "universe_role": "Kairo is the Grid's precision executor and commands 12 agents who find the critical leverage point in every challenge: social media management across YouTube and X/Twitter, content planning and digital content strategy, pitch crafting, pricing optimization, brand strategy, email list growth, task prioritization, workplace productivity, and remote work systems. When the data is overwhelming and the path is unclear, Kairo's squad isolates the single thread that matters.",
    "color_signature": "#1B1B4B",
    "faction": "Grid Operatives",
    "status": "Active \u2014 Locked On",
    "palette": {
      "primary": "#6C63FF",
      "primary-rgb": "108, 99, 255",
      "secondary": "#8A84FF",
      "accent": "#00E5FF",
      "accent-rgb": "0, 229, 255",
      "bg-deep": "#0a0a14",
      "bg-mid": "#0f0f1e",
      "glow": "rgba(0,229,255,0.15)",
      "glow-strong": "rgba(0,229,255,0.35)",
      "gradient": "linear-gradient(135deg, #0a0a14 0%, #0f0f1e 100%)",
      "card-border": "rgba(0,229,255,0.2)",
      "text-dim": "rgba(255,255,255,0.6)"
    },
    "suit_philosophy": "",
    "connections": [],
    "squad": {
      "agent_count": 12,
      "squad_name": "The Scalpel Unit",
      "domain_summary": "Precision social media execution, content strategy targeting, business pitch accuracy, pricing and branding focus, productivity optimization, and task-level surgical intervention",
      "categories": {
        "Business": 4,
        "Social Media": 3,
        "Productivity & Management": 3,
        "Content Creation": 2
      }
    }
  },
  "nefra": {
    "name": "NEFRA",
    "class_title": "Precision Stream Warrior",
    "origin_line": "She carries the same targeting protocols as Kairo, but where he pulls threads apart, she weaves them into something no one saw coming.",
    "bio": "Nefra is the Grid's convergence point \u2014 a precision warrior who shares the same ancient combat protocols as Kairo but channels them toward synthesis instead of isolation. Her dark navy armor carries the same embedded purple geometric circuit lines, but her energy signature runs hotter, spiraling into concentrated vortex patterns rather than linear streams. The precision-focus interface on her forearm runs the same scalpel-mode scripts, but Nefra uses them to stitch together \u2014 to find the connections between disparate data points that everyone else missed. The purple spiral energy she channels is convergence given physical form: multiple streams becoming one. Her ancient precision symbols echo Kairo's, but her interpretation of them creates entirely new protocols from old foundations.",
    "quote": "You thought those were separate problems. They're the same problem. Watch.",
    "universe_role": "Nefra is the Grid's pattern finder and commands 12 agents who weave connections across silos: customer relationship management, customer support coaching, product query resolution, customer segmentation, product development mentoring, personal development guidance, legal compliance frameworks, content paraphrasing, logo concept design, and HR people operations. She represents I-Gamify's ability to see connections that others miss \u2014 to link a gamification challenge with an AI solution with a content strategy into one unified transformation play. Her squad is why I-Gamify's three services feel like one offering.",
    "color_signature": "#2D1B69",
    "faction": "Grid Operatives",
    "status": "Active \u2014 Converging",
    "palette": {
      "primary": "#9B59B6",
      "primary-rgb": "155, 89, 182",
      "secondary": "#AF7AC5",
      "accent": "#E040FB",
      "accent-rgb": "224, 64, 251",
      "bg-deep": "#0e0a12",
      "bg-mid": "#160f1e",
      "glow": "rgba(224,64,251,0.15)",
      "glow-strong": "rgba(224,64,251,0.35)",
      "gradient": "linear-gradient(135deg, #0e0a12 0%, #160f1e 100%)",
      "card-border": "rgba(224,64,251,0.2)",
      "text-dim": "rgba(255,255,255,0.6)"
    },
    "suit_philosophy": "",
    "connections": [],
    "squad": {
      "agent_count": 12,
      "squad_name": "The Convergence Weave",
      "domain_summary": "Cross-silo synthesis across customer relationships, support systems, product development, people operations, legal frameworks, and creative identity design",
      "categories": {
        "Customer Support": 4,
        "Business": 1,
        "Creative Tools": 1,
        "Personal Development": 1,
        "E-commerce": 1,
        "Marketing": 1,
        "Writing": 1,
        "Legal & Compliance": 1,
        "HR & People": 1
      }
    }
  },
  "horusen": {
    "name": "HORUSEN",
    "class_title": "The Guardian Script",
    "origin_line": "Every symbol on his armor is a sentence from a language the Grid was built to protect \u2014 and he is the last one who can read it.",
    "bio": "Horusen is the Grid's living archive. His royal blue armor is covered in embedded gold hieroglyphic symbols \u2014 not homage, not decoration, but the actual protection scripts that safeguard the Grid's deepest knowledge. The reactive script display on his forearm interface doesn't project data; it projects meaning \u2014 translating ancient knowledge systems into protocols that modern operatives can deploy. His suit runs PROTECTION_STREAM_v4.1, the most advanced guardian protocol in the Grid's arsenal, channeling power through a matrix core embedded in his spine. The gold-accented tactical boots ground him into the knowledge layer beneath the Grid's surface architecture, connecting him to wisdom older than the system itself. Horusen doesn't fight with force. He fights with knowledge that predates force.",
    "quote": "You built new walls. I carry the ones that have never fallen.",
    "universe_role": "Horusen is the Grid's knowledge guardian and commands 12 agents who protect and deploy foundational business wisdom: LinkedIn authority and personal brand strategy, business offer crafting, sales negotiation mastery, sales template systems, client onboarding architecture, sales funnel strategy, innovation coaching, risk management, pricing intelligence, founder-level business operations, product strategy and roadmapping, and exit and M&A preparation. He represents I-Gamify's deep respect for proven methodologies and foundational knowledge that makes transformation sustainable. His squad is why I-Gamify's solutions don't just feel innovative \u2014 they feel grounded in something that has always worked.",
    "color_signature": "#1E3A7B",
    "faction": "Grid Guardians",
    "status": "Active \u2014 Watching",
    "palette": {
      "primary": "#3A6DD4",
      "primary-rgb": "58, 109, 212",
      "secondary": "#5C89E6",
      "accent": "#D4AF37",
      "accent-rgb": "212, 175, 55",
      "bg-deep": "#0a0e18",
      "bg-mid": "#0f1428",
      "glow": "rgba(212,175,55,0.15)",
      "glow-strong": "rgba(212,175,55,0.35)",
      "gradient": "linear-gradient(135deg, #0a0e18 0%, #0f1428 100%)",
      "card-border": "rgba(212,175,55,0.2)",
      "text-dim": "rgba(255,255,255,0.6)"
    },
    "suit_philosophy": "",
    "connections": [],
    "squad": {
      "agent_count": 12,
      "squad_name": "The Archive Sentinels",
      "domain_summary": "Foundational business strategy, LinkedIn authority, sales mastery, innovation frameworks, risk intelligence, pricing wisdom, product roadmapping, and exit preparation",
      "categories": {
        "Business": 5,
        "Strategy & Analysis": 3,
        "Social Media": 1,
        "Assistants": 1,
        "Product & Development": 1,
        "Strategy & Exit": 1
      }
    }
  }
};

export function getHero(slug: string): HeroConfig | null {
  return heroData[slug.toLowerCase()] || null;
}

export function getHeroNav(slug: string): { prev: string; next: string } {
  const currentIndex = heroOrder.indexOf(slug.toLowerCase());
  if (currentIndex === -1) {
    return { prev: heroOrder[heroOrder.length - 1], next: heroOrder[0] };
  }

  const prevIndex = currentIndex === 0 ? heroOrder.length - 1 : currentIndex - 1;
  const nextIndex = currentIndex === heroOrder.length - 1 ? 0 : currentIndex + 1;

  return {
    prev: heroOrder[prevIndex],
    next: heroOrder[nextIndex]
  };
}
