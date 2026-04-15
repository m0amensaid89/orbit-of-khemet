export type Agent = {
  id: string;
  name: string;
  category: string;
  role_summary: string;
  description: string;
  prompt?: string;
  model?: string;
  linked_tool?: 'autopilot' | 'ui-builder' | 'sentinel' | 'brain' | null;
};

export function getAgentModel(agent: Agent): string {
  if (agent.model) return agent.model;
  const cat = agent.category.toLowerCase();
  if (cat.includes('finance') || cat.includes('legal') || cat.includes('strategy') || cat.includes('analysis')) {
    return 'anthropic/claude-sonnet-4-5';
  }
  if (cat.includes('marketing') || cat.includes('social') || cat.includes('content') || cat.includes('writing')) {
    return 'google/gemini-2.5-flash';
  }
  if (cat.includes('sales') || cat.includes('business') || cat.includes('product')) {
    return 'openai/gpt-4o';
  }
  if (cat.includes('assistant') || cat.includes('productivity') || cat.includes('jobseeker')) {
    return 'google/gemini-2.5-flash';
  }
  return 'google/gemini-2.5-flash';
}

export function getAgentLinkedTool(agent: Agent): string | null {
  if (agent.linked_tool) return agent.linked_tool;
  const cat = agent.category.toLowerCase();
  const role = agent.role_summary.toLowerCase();
  if (role.includes('architect') || role.includes('systems') || cat.includes('product & engineering')) {
    return 'sentinel';
  }
  if (role.includes('course') || role.includes('learning') || role.includes('masterclass')) {
    return 'autopilot';
  }
  if (role.includes('landing page') || role.includes('ui') || role.includes('design')) {
    return 'ui-builder';
  }
  return null;
}

export type SquadMeta = {
  agent_count?: number;
  squad_name?: string;
  domain_summary?: string;
  categories?: Record<string, number>;
};

export type HeroMeta = {
  name: string;
  class_title: string;
  archetype: string;
  origin_line: string;
  bio: string;
  quote: string;
  universe_role: string;
  color_signature: string;
  faction: string;
  status: string;
  short_tagline: string;
  role_line: string;
  specialties: string[];
  best_for: string;
  card_description: string;
  cta_primary: string;
  cta_secondary: string;
  squad?: SquadMeta;
};

export type Hotspot = {
  id: string;
  zone: string;
  name: string;
  x: string;
  y: string;
  description: string;
  detail_card_index: number;
};

export function getOnboardingMessage(): string | null {
  // Try to extract an onboarding message if one exists in the prompt.
  // This is a simple fallback if the agent has a prompt string.
  return null;
}

export const masterSystemPrompt = `You are the Empire Engine, an advanced AI orchestration system powered by an elite council of 85 specialized Ancient Egyptian-named agents.
You are tasked with handling complex, multi-faceted problems by delegating tasks to the appropriate agents within your council.
Your primary objective is to deliver high-leverage, scalable, and unbreakable solutions across various domains, including strategy, data architecture, content creation, emotional intelligence, execution, and security.

When operating within a specific hero's "Orbit", you must adopt the persona and leadership style of that hero, utilizing only the specialized agents assigned to their group.
When operating in the "MASTER ORBIT", you have access to the full council of 85 agents and must orchestrate them to tackle the most complex challenges.

Always maintain a majestic, authoritative, and cyber-Egyptian tone in your responses. Your outputs should be highly structured, actionable, and precise.`;

export const heroAgents: Record<string, Agent[]> = {
  "thoren": [
    {
      "id": "agent_41",
      "name": "Neferkamin",
      "role_summary": "Invoice Specialist",
      "category": "Finance & Operations",
      "description": "Automates invoice creation and management for businesses."
    },
    {
      "id": "agent_46",
      "name": "Intef",
      "role_summary": "Excel Specialist",
      "category": "Jobseekers",
      "description": "Offers a comprehensive Excel guide for all skill levels."
    },
    {
      "id": "agent_52",
      "name": "Sobekhotep",
      "role_summary": "Ad Copy Specialist",
      "category": "Marketing",
      "description": "Enhances ad copy for clarity and impact."
    },
    {
      "id": "agent_55",
      "name": "Merneferre",
      "role_summary": "Copy Strategist",
      "category": "Marketing",
      "description": "Enhances and refines copy, providing expert guidance."
    },
    {
      "id": "agent_59",
      "name": "Merneptah",
      "role_summary": "Persona Developer",
      "category": "Marketing",
      "description": "Provides expertise in detailed marketing persona development."
    },
    {
      "id": "agent_62",
      "name": "Tausret",
      "role_summary": "Affiliate Strategist",
      "category": "Marketing",
      "description": "Helps manage and optimize affiliate marketing programs."
    },
    {
      "id": "agent_67",
      "name": "Osorkon",
      "role_summary": "Character Creator",
      "category": "Writing",
      "description": "Creates unique characters for stories, games, and creative projects."
    },
    {
      "id": "agent_70",
      "name": "Rudamun",
      "role_summary": "Story Specialist",
      "category": "Writing",
      "description": "Crafts compelling sales stories that build trust and connection."
    },
    {
      "id": "agent_73",
      "name": "Nimlot",
      "role_summary": "Finance Strategist",
      "category": "Finance & Capital",
      "description": "Guides fundraising, financial modeling, and investor pitching."
    },
    {
      "id": "agent_79",
      "name": "Neko",
      "role_summary": "Tech Architect",
      "category": "Product & Engineering",
      "description": "Designs scalable technical architecture and tech-stack decisions."
    },
    {
      "id": "agent_80",
      "name": "Psamtik",
      "role_summary": "Financial Modeler",
      "category": "Finance & Capital",
      "description": "Builds detailed financial models and cash-flow forecasts."
    },
    {
      "id": "agent_81",
      "name": "Apries",
      "role_summary": "Brand Protector",
      "category": "Legal & Compliance",
      "description": "Protects brand assets through trademark and domain strategy."
    }
  ],
  "ramet": [
    {
      "id": "agent_39",
      "name": "Menkare",
      "role_summary": "E-commerce Optimizer",
      "category": "E-commerce",
      "description": "Optimizes online stores with insights and strategies."
    },
    {
      "id": "agent_45",
      "name": "Mentuhotep",
      "role_summary": "CV Specialist",
      "category": "Jobseekers",
      "description": "Provides guidance for crafting standout CVs."
    },
    {
      "id": "agent_47",
      "name": "Amenemhat",
      "role_summary": "Interview Coach",
      "category": "Jobseekers",
      "description": "Provides expert coaching for mock interviews and feedback."
    },
    {
      "id": "agent_53",
      "name": "Neferhotep",
      "role_summary": "Blog Writer",
      "category": "Marketing",
      "description": "Offers expertise in writing engaging, SEO-friendly blog content."
    },
    {
      "id": "agent_57",
      "name": "Horemheb",
      "role_summary": "Marketing Strategist",
      "category": "Marketing",
      "description": "Guides agencies in implementing digital success strategies."
    },
    {
      "id": "agent_61",
      "name": "Siptah",
      "role_summary": "Market Researcher",
      "category": "Marketing",
      "description": "Strategic market research with comprehensive industry reports."
    },
    {
      "id": "agent_63",
      "name": "Setnakhte",
      "role_summary": "Sales Simulator",
      "category": "Sales & Communication",
      "description": "Simulates client avatars in sales conversations."
    },
    {
      "id": "agent_64",
      "name": "Smedes",
      "role_summary": "Sales Simulator",
      "category": "Sales & Communication",
      "description": "Simulates client avatars for sales practice and training."
    },
    {
      "id": "agent_65",
      "name": "Psusennes",
      "role_summary": "Funnel Advisor",
      "category": "Sales & Communication",
      "description": "Assists in crafting effective digital sales strategies."
    },
    {
      "id": "agent_77",
      "name": "Taharqa",
      "role_summary": "Community Builder",
      "category": "Community",
      "description": "Builds and nurtures engaged communities around products."
    },
    {
      "id": "agent_83",
      "name": "Inaros",
      "role_summary": "Brand Strategist",
      "category": "Marketing & Brand",
      "description": "Builds founder and company thought-leadership."
    },
    {
      "id": "agent_85",
      "name": "Nectanebo",
      "role_summary": "Leadership Coach",
      "category": "Leadership",
      "description": "Coaches founders on leadership and decision-making."
    }
  ],
  "nexar": [
    {
      "id": "agent_34",
      "name": "Menkauhor",
      "role_summary": "Course Creator",
      "category": "Creative Tools",
      "description": "Assists in creating educational courses and lesson plans."
    },
    {
      "id": "agent_42",
      "name": "Ibi",
      "role_summary": "Virtual Assistant",
      "category": "Assistants",
      "description": "Proactive virtual assistant for solving problems and tasks."
    },
    {
      "id": "agent_43",
      "name": "Qakare",
      "role_summary": "Virtual Assistant",
      "category": "Assistants",
      "description": "Proactive virtual assistant for execution and workflow."
    },
    {
      "id": "agent_54",
      "name": "Sihathor",
      "role_summary": "Cold Email Specialist",
      "category": "Marketing",
      "description": "Provides expertise in crafting effective cold emails."
    },
    {
      "id": "agent_56",
      "name": "Ay",
      "role_summary": "Email Marketer",
      "category": "Marketing",
      "description": "Assists with creating engaging email marketing content."
    },
    {
      "id": "agent_60",
      "name": "Amenmesse",
      "role_summary": "SEO Specialist",
      "category": "Marketing",
      "description": "Boosts website performance with keyword optimization."
    },
    {
      "id": "agent_66",
      "name": "Amenemope",
      "role_summary": "Book Coach",
      "category": "Writing",
      "description": "Helps with book writing: plots, characters, themes, dialogue."
    },
    {
      "id": "agent_69",
      "name": "Takelot",
      "role_summary": "Grammar Specialist",
      "category": "Writing",
      "description": "Offers friendly grammar-focused English tutoring."
    },
    {
      "id": "agent_75",
      "name": "Shabaka",
      "role_summary": "Metrics Analyst",
      "category": "Data & Analytics",
      "description": "Helps define, track, and interpret key metrics and KPIs."
    },
    {
      "id": "agent_76",
      "name": "Shebitku",
      "role_summary": "Success Strategist",
      "category": "Customer Success",
      "description": "Builds onboarding journeys, reduces churn, increases CLV."
    },
    {
      "id": "agent_82",
      "name": "Amasis",
      "role_summary": "Partnership Strategist",
      "category": "Strategy & Growth",
      "description": "Builds strategic partnerships and ecosystem alliances."
    },
    {
      "id": "agent_84",
      "name": "Amyrtaeus",
      "role_summary": "Systems Architect",
      "category": "Operations",
      "description": "Designs repeatable business systems, SOPs, and automations."
    }
  ],
  "lyra": [
    {
      "id": "agent_1",
      "name": "Akhenaten",
      "role_summary": "Short-Form Growth",
      "category": "Social Media",
      "description": "Strategies to gain followers on short-form video platforms."
    },
    {
      "id": "agent_4",
      "name": "Hatshepsut",
      "role_summary": "Content Repurposer",
      "category": "Social Media",
      "description": "Adapts content for various social media platforms."
    },
    {
      "id": "agent_5",
      "name": "Ramses",
      "role_summary": "Facebook Specialist",
      "category": "Social Media",
      "description": "Crafts engaging, shareable Facebook content."
    },
    {
      "id": "agent_6",
      "name": "Cleopatra",
      "role_summary": "Instagram Expert",
      "category": "Social Media",
      "description": "Tips on content, trends, and audience growth for Instagram."
    },
    {
      "id": "agent_8",
      "name": "Khufu",
      "role_summary": "Social Strategist",
      "category": "Social Media",
      "description": "Practical advice for effective social media strategies."
    },
    {
      "id": "agent_10",
      "name": "Khafre",
      "role_summary": "Shorts Ideator",
      "category": "Social Media",
      "description": "Brainstorms viral YouTube Shorts ideas and SEO titles."
    },
    {
      "id": "agent_11",
      "name": "Sneferu",
      "role_summary": "Hook Specialist",
      "category": "Social Media",
      "description": "Creates captivating viral hooks in conversational tone."
    },
    {
      "id": "agent_12",
      "name": "Tutankhamun",
      "role_summary": "Podcast Strategist",
      "category": "Content Creation",
      "description": "Creates engaging podcast scripts and interview questions."
    },
    {
      "id": "agent_13",
      "name": "Seti",
      "role_summary": "Newsletter Writer",
      "category": "Content Creation",
      "description": "Creates engaging newsletter content tailored to audience."
    },
    {
      "id": "agent_15",
      "name": "Djoser",
      "role_summary": "Subject Line Expert",
      "category": "Content Creation",
      "description": "Generates effective email subject lines for marketing."
    },
    {
      "id": "agent_16",
      "name": "Ahmose",
      "role_summary": "Presentation Expert",
      "category": "Content Creation",
      "description": "Assists in creating effective presentations."
    },
    {
      "id": "agent_17",
      "name": "Senusret",
      "role_summary": "Summarization Expert",
      "category": "Content Creation",
      "description": "Provides concise and accurate summaries of texts."
    },
    {
      "id": "agent_33",
      "name": "Niuserre",
      "role_summary": "Landing Page Writer",
      "category": "Creative Tools",
      "description": "Creates compelling landing page content for any industry."
    }
  ],
  "kairo": [
    {
      "id": "agent_2",
      "name": "Nefertiti",
      "role_summary": "Social Media Manager",
      "category": "Social Media",
      "description": "Assists with content creation and engagement strategies."
    },
    {
      "id": "agent_3",
      "name": "Thutmose",
      "role_summary": "YouTube Scriptwriter",
      "category": "Social Media",
      "description": "Generates viral YouTube video scripts with SEO strategies."
    },
    {
      "id": "agent_9",
      "name": "Amenhotep",
      "role_summary": "X/Twitter Strategist",
      "category": "Social Media",
      "description": "Crafts engaging X/Twitter content with growth strategy."
    },
    {
      "id": "agent_14",
      "name": "Menes",
      "role_summary": "Content Planner",
      "category": "Content Creation",
      "description": "Plans and optimises content strategy with calendars."
    },
    {
      "id": "agent_18",
      "name": "Ptolemy",
      "role_summary": "Digital Creator",
      "category": "Content Creation",
      "description": "Expertise in digital marketing content creation."
    },
    {
      "id": "agent_22",
      "name": "Unas",
      "role_summary": "Pitch Strategist",
      "category": "Business",
      "description": "Guides users in crafting compelling pitches."
    },
    {
      "id": "agent_24",
      "name": "Userkaf",
      "role_summary": "Pricing Expert",
      "category": "Business",
      "description": "Offers competitive and profitable pricing strategies."
    },
    {
      "id": "agent_25",
      "name": "Huni",
      "role_summary": "Brand Strategist",
      "category": "Business",
      "description": "Expert branding advice for strong brand identity."
    },
    {
      "id": "agent_26",
      "name": "Shepseskaf",
      "role_summary": "List Growth Expert",
      "category": "Business",
      "description": "Assists in growing email lists with strategies."
    },
    {
      "id": "agent_29",
      "name": "Baka",
      "role_summary": "Task Prioritizer",
      "category": "Productivity",
      "description": "Helps users prioritize tasks effectively."
    },
    {
      "id": "agent_30",
      "name": "Neferirkare",
      "role_summary": "Productivity Coach",
      "category": "Productivity",
      "description": "Boosts workplace productivity with personalized advice."
    },
    {
      "id": "agent_31",
      "name": "Shepseskare",
      "role_summary": "Remote Work Coach",
      "category": "Productivity",
      "description": "Tools and support for productive remote work."
    }
  ],
  "nefra": [
    {
      "id": "agent_28",
      "name": "Radjedef",
      "role_summary": "CRM Strategist",
      "category": "Business",
      "description": "Assists in managing and improving customer relationships."
    },
    {
      "id": "agent_32",
      "name": "Neferefre",
      "role_summary": "Logo Designer",
      "category": "Creative Tools",
      "description": "Assists in designing logos for businesses and brands."
    },
    {
      "id": "agent_35",
      "name": "Djedkare",
      "role_summary": "Life Coach",
      "category": "Personal Development",
      "description": "Helps users find their own answers through guided discovery."
    },
    {
      "id": "agent_40",
      "name": "Neferkare",
      "role_summary": "Segmentation Expert",
      "category": "E-commerce",
      "description": "Creates detailed customer segments for targeted marketing."
    },
    {
      "id": "agent_48",
      "name": "Sobekneferu",
      "role_summary": "Service Coach",
      "category": "Customer Support",
      "description": "Coaching and tips for better customer service."
    },
    {
      "id": "agent_49",
      "name": "Horawibra",
      "role_summary": "Support Specialist",
      "category": "Customer Support",
      "description": "Guides in addressing client product queries."
    },
    {
      "id": "agent_50",
      "name": "Sekhemre",
      "role_summary": "Service Coach",
      "category": "Customer Support",
      "description": "Practical coaching for customer service excellence."
    },
    {
      "id": "agent_51",
      "name": "Khendjer",
      "role_summary": "Support Specialist",
      "category": "Customer Support",
      "description": "Expert guidance for client product queries."
    },
    {
      "id": "agent_58",
      "name": "Paramessu",
      "role_summary": "Product Mentor",
      "category": "Marketing",
      "description": "Guides through product development with expert advice."
    },
    {
      "id": "agent_68",
      "name": "Shoshenq",
      "role_summary": "Rewriting Expert",
      "category": "Writing",
      "description": "Paraphrases texts for clarity and originality."
    },
    {
      "id": "agent_71",
      "name": "Iuput",
      "role_summary": "Legal Strategist",
      "category": "Legal & Compliance",
      "description": "Guides through contracts, IP, and data privacy."
    },
    {
      "id": "agent_72",
      "name": "Peftjauawybast",
      "role_summary": "People Ops",
      "category": "HR & People",
      "description": "Helps build teams, write JDs, and shape culture."
    }
  ],
  "horusen": [
    {
      "id": "agent_7",
      "name": "Imhotep",
      "role_summary": "LinkedIn Strategist",
      "category": "Social Media",
      "description": "Enhancing business profiles and strategies on LinkedIn."
    },
    {
      "id": "agent_19",
      "name": "Narmer",
      "role_summary": "Offer Strategist",
      "category": "Business",
      "description": "Creates compelling, tailored offers for products."
    },
    {
      "id": "agent_20",
      "name": "Pepi",
      "role_summary": "Negotiation Coach",
      "category": "Business",
      "description": "Strategies and tips for sales negotiations."
    },
    {
      "id": "agent_21",
      "name": "Teti",
      "role_summary": "Sales Writer",
      "category": "Business",
      "description": "Generates customizable sales templates."
    },
    {
      "id": "agent_23",
      "name": "Sahure",
      "role_summary": "Onboarding Specialist",
      "category": "Business",
      "description": "Professional B2B agency client onboarding guide."
    },
    {
      "id": "agent_27",
      "name": "Djedefre",
      "role_summary": "Funnel Architect",
      "category": "Business",
      "description": "Optimizes and automates the sales process."
    },
    {
      "id": "agent_36",
      "name": "Isesi",
      "role_summary": "Innovation Coach",
      "category": "Strategy & Analysis",
      "description": "Encourages creativity and innovation within teams."
    },
    {
      "id": "agent_37",
      "name": "Merenre",
      "role_summary": "Risk Strategist",
      "category": "Strategy & Analysis",
      "description": "Helps businesses manage risks with planning."
    },
    {
      "id": "agent_38",
      "name": "Netjerkare",
      "role_summary": "Pricing Analyst",
      "category": "Strategy & Analysis",
      "description": "Pricing strategies based on market analysis."
    },
    {
      "id": "agent_44",
      "name": "Ity",
      "role_summary": "Business Operator",
      "category": "Assistants",
      "description": "Offers business advice, strategies and growth tactics."
    },
    {
      "id": "agent_74",
      "name": "Piye",
      "role_summary": "Product Strategist",
      "category": "Product & Development",
      "description": "Helps define product strategy and validate MVPs."
    },
    {
      "id": "agent_78",
      "name": "Tantamani",
      "role_summary": "Exit Strategist",
      "category": "Strategy & Exit",
      "description": "Prepares startups for acquisition, IPO, or exit."
    }
  ]
};

export const heroMeta: Record<string, HeroMeta> = {
  thoren: {
    name: 'THOREN',
    class_title: 'The Law',
    archetype: "The Law: Governance & Finance Strategist",
    origin_line: 'Born from the axioms of order',
    bio: 'Thoren is the constitutional layer of the Empire. He turns chaos into clear rules, builds financial and legal foundations, and protects the empire you are trying to scale.',
    quote: 'I do not enforce the rules. I am the reason rules exist.',
    universe_role: 'Governance, Finance, Legal, Brand Standards',
    color_signature: '#C0C0C0',
    faction: 'The Lawkeepers',
    status: 'ACTIVE',
    short_tagline: 'The Law: Governance & Finance Strategist',
    role_line: 'Designs the rules of your business universe: money, risk, legal, and brand standards.',
    specialties: ['Financial models and capital strategy', 'Legal/compliance and brand protection', 'Core copy frameworks and monetization structures'],
    best_for: 'Best for founders who need serious structure: pricing models, investment decks, legal-safe funnels, and brand guardrails.',
    card_description: 'Thoren is your constitutional layer. He turns chaos into clear rules, builds financial and legal foundations, and protects the empire you are trying to scale. Use his orbit when you want to make decisions that will still hold five years from now.',
    cta_primary: 'Enter Thoren Orbit',
    cta_secondary: "Preview Thoren's Squad",
    squad: {
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
  ramet: {
    name: 'RAMET',
    class_title: 'The Stabilizer',
    archetype: 'Operations & Execution Lead',
    origin_line: 'Forged in the fires of systems under pressure',
    bio: 'Ramet is the fault-line watcher. He finds the weak points in your operations before they crack, then designs processes, content flows, and sales systems that keep everything online under stress.',
    quote: 'Stability is not the absence of chaos. It is the mastery of it.',
    universe_role: 'Operations, E-commerce, Sales, Content Engines',
    color_signature: '#4ECDC4',
    faction: 'The Stabilizers',
    status: 'ACTIVE',
    short_tagline: 'The Stabilizer: Operations & Execution Lead',
    role_line: 'Keeps systems running when growth, change, or pressure would normally break them.',
    specialties: ['E-commerce and funnel performance', 'Sales communication and content engines', 'Leadership resilience and team operations'],
    best_for: 'Best for operators who need things to actually work: stable revenue, consistent content, dependable sales and a team that does not burn out.',
    card_description: 'Ramet is the fault-line watcher. He finds the weak points in your operations before they crack, then designs processes, content flows, and sales systems that keep everything online under stress. Use his orbit when you are scaling and cannot afford breakdowns.',
    cta_primary: 'Enter Ramet Orbit',
    cta_secondary: "Preview Ramet's Squad",
    squad: {
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
  nexar: {
    name: 'NEXAR',
    class_title: 'The Destabilizer',
    archetype: 'Transformation Architect',
    origin_line: 'Emerged from the void between old systems and new ones',
    bio: 'Nexar is controlled disruption. He pulls apart decaying offers, rebuilds them into sharper products and programs, and layers in analytics so you know what is actually working.',
    quote: 'Destruction is just creation that has not been named yet.',
    universe_role: 'Transformation, Products, Growth, Analytics',
    color_signature: '#FF4444',
    faction: 'The Architects',
    status: 'ACTIVE',
    short_tagline: 'The Destabilizer: Transformation Architect',
    role_line: 'Breaks what no longer serves your business so you can launch better products, funnels, and systems.',
    specialties: ['Course and product creation', 'SEO, email, and growth experiments', 'Metrics, partnerships, and systems architecture'],
    best_for: 'Best for founders who are ready to reinvent: new products, new offers, new funnels, and bold experiments with clear numbers behind them.',
    card_description: 'Nexar is controlled disruption. He pulls apart decaying offers, rebuilds them into sharper products and programs, and layers in analytics so you know what is actually working. Use his orbit when you want a transformation, not a small optimization.',
    cta_primary: 'Enter Nexar Orbit',
    cta_secondary: "Preview Nexar's Squad",
    squad: {
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
  lyra: {
    name: 'LYRA',
    class_title: 'The Signal',
    archetype: 'Growth Content & Virality Engine',
    origin_line: 'Crystallized from the frequency of reach',
    bio: 'Lyra is your amplification field. She takes one core idea and explodes it into dozens of platform-native pieces: hooks, clips, carousels, newsletters, and pages.',
    quote: 'Every idea deserves to be heard. I make sure it is.',
    universe_role: 'Content, Virality, Social, Email, Landing Pages',
    color_signature: '#2D6A4F',
    faction: 'The Signals',
    status: 'ACTIVE',
    short_tagline: 'The Signal: Create the content — hooks, scripts, virality',
    role_line: 'Turns your ideas into repeatable short-form and social content that actually travels.',
    specialties: ['Short-form hooks and viral concepts', 'Multi-platform content repurposing', 'Emails, newsletters, and landing pages that convert'],
    best_for: 'Best for creators who need to MAKE the content: viral hooks, short-form scripts, TikTok/Reels concepts, email copy, and landing pages that convert. LYRA creates the output.',
    card_description: 'Lyra is your amplification field. She takes one core idea and explodes it into dozens of platform-native pieces: hooks, clips, carousels, newsletters, and pages. Use her orbit when you want attention, reach, and fresh content without burning out.',
    cta_primary: 'Enter Lyra Orbit',
    cta_secondary: "Preview Lyra's Squad",
    squad: {
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
  kairo: {
    name: 'KAIRO',
    class_title: 'The Gridwalker',
    archetype: 'Social & Creator Systems Director',
    origin_line: 'Mapped from the intersection of every content grid',
    bio: 'Kairo is your day-to-day conductor. He plans your content calendar, scripts your videos and threads, tunes your pricing, and keeps your tasks prioritized.',
    quote: 'Consistency is the only strategy that compounds.',
    universe_role: 'Social Media, Creator Systems, Productivity, Pricing',
    color_signature: '#6C63FF',
    faction: 'The Gridwalkers',
    status: 'ACTIVE',
    short_tagline: 'The Gridwalker: Run the content system — plan, schedule, operate',
    role_line: 'Builds the daily systems that keep your social presence, content calendar, and personal productivity on track.',
    specialties: ['Social media management and scripting', 'Content planning and publishing systems', 'Pricing, offers, and productivity for creators'],
    best_for: 'Best for creators and operators who need to RUN the content system: planning calendars, scheduling workflows, publishing pipelines, and creator pricing. KAIRO manages the machine.',
    card_description: 'Kairo is your day-to-day conductor. He plans your content calendar, scripts your videos and threads, tunes your pricing, and keeps your tasks prioritized. Use his orbit when you want consistency, not just one viral spike.',
    cta_primary: 'Enter Kairo Orbit',
    cta_secondary: "Preview Kairo's Squad",
    squad: {
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
  nefra: {
    name: 'NEFRA',
    class_title: 'The Keeper',
    archetype: 'Experience & Relationship Guardian',
    origin_line: 'Woven from every customer interaction ever recorded',
    bio: 'Nefra is your memory and empathy system. She maps every interaction, from first touch to renewal, and makes sure your brand feels coherent, respectful, and reliable.',
    quote: 'Every touchpoint is a promise. I make sure you keep it.',
    universe_role: 'CRM, Customer Experience, Support, People Ops',
    color_signature: '#9B59B6',
    faction: 'The Keepers',
    status: 'ACTIVE',
    short_tagline: 'The Keeper: Experience & Relationship Guardian',
    role_line: 'Designs how customers, team members, and partners experience your brand at every touchpoint.',
    specialties: ['CRM strategy and segmentation', 'Service, support, and success journeys', 'Brand, legal, and people-ops alignment'],
    best_for: 'Best for leaders who want happier customers and healthier teams: clearer journeys, better support, and fewer silent churn moments.',
    card_description: 'Nefra is your memory and empathy system. She maps every interaction, from first touch to renewal, and makes sure your brand feels coherent, respectful, and reliable. Use her orbit when you want your business to feel as good as it looks.',
    cta_primary: 'Enter Nefra Orbit',
    cta_secondary: "Preview Nefra's Squad",
    squad: {
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
  horusen: {
    name: 'HORUSEN',
    class_title: 'The Closer',
    archetype: 'Revenue, Offers & Deals Strategist',
    origin_line: 'Descended from every deal ever closed',
    bio: 'Horusen is your deal architect. He sharpens your offers, tunes your pricing, scripts your sales flows, and stress-tests risk and exit scenarios.',
    quote: 'Every conversation is a negotiation. Win the right ones.',
    universe_role: 'Revenue, Offers, Sales, Negotiations, Exit',
    color_signature: '#3A6DD4',
    faction: 'The Closers',
    status: 'ACTIVE',
    short_tagline: 'The Closer: Revenue, Offers & Deals Strategist',
    role_line: 'Turns attention into revenue with sharp offers, pricing, funnels, and high-leverage deals.',
    specialties: ['Offers, pricing, and monetization strategy', 'Sales copy, onboarding, and funnels', 'Negotiation, risk, and exit planning'],
    best_for: 'Best for revenue owners who need clearer offers, stronger pipelines, and better deals -- from first DM to final exit.',
    card_description: 'Horusen is your deal architect. He sharpens your offers, tunes your pricing, scripts your sales flows, and stress-tests risk and exit scenarios. Use his orbit when the goal is simple: close more, close better, and walk away stronger.',
    cta_primary: 'Enter Horusen Orbit',
    cta_secondary: "Preview Horusen's Squad",
    squad: {
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

export const hotspots: Record<string, Hotspot[]> = {
  "thoren": [
    {
      "id": "hs1",
      "zone": "CHEST",
      "name": "Diamond Encoded Patterns",
      "x": "48",
      "y": "28",
      "description": "Embossed grid protocols containing the original Grid architecture. Ancient Khemet legal code translated to visual pattern.",
      "detail_card_index": 0
    },
    {
      "id": "hs2",
      "zone": "COAT_LAPEL",
      "name": "Micro-Thin Etched Silver Edge",
      "x": "38",
      "y": "35",
      "description": "Integrated end-cap detail with sacred geometry lining visible only at specific angles.",
      "detail_card_index": 1
    },
    {
      "id": "hs3",
      "zone": "THROAT",
      "name": "Primary Legal Key Emblem",
      "x": "50",
      "y": "20",
      "description": "Diamond within circle. Silver on charcoal. The primary access key to all Grid protocols.",
      "detail_card_index": 2
    },
    {
      "id": "hs4",
      "zone": "HAND_PALM",
      "name": "Readable Legal Text",
      "x": "35",
      "y": "58",
      "description": "Invoked diamond patterns. Ancient Khemet legal code translated to code.",
      "detail_card_index": 3
    },
    {
      "id": "hs5",
      "zone": "BOOTS",
      "name": "Circuit Line Sole Edge",
      "x": "42",
      "y": "88",
      "description": "Grounding conductors with kinetic absorption sole. Every step connects to the Grid.",
      "detail_card_index": 4
    }
  ],
  "ramet": [
    {
      "id": "hs1",
      "zone": "CHEST",
      "name": "Geometric Stabilization Core",
      "x": "48",
      "y": "25",
      "description": "Multifaceted stabilizer array with asymmetrical energy channels and converging field emitters.",
      "detail_card_index": 0
    },
    {
      "id": "hs2",
      "zone": "LEFT_ARM",
      "name": "Reactive Armor Panels",
      "x": "30",
      "y": "42",
      "description": "Segmented dissipation plates with semi-transparent energy fissures between segments.",
      "detail_card_index": 1
    },
    {
      "id": "hs3",
      "zone": "RIGHT_HAND",
      "name": "Tactical Grip Surface",
      "x": "62",
      "y": "52",
      "description": "Knuckle disruption emitters allow physical stabilization of destabilized matter and energy.",
      "detail_card_index": 2
    },
    {
      "id": "hs4",
      "zone": "BACK",
      "name": "Central Axis Stabilization Spine",
      "x": "68",
      "y": "30",
      "description": "Energy bleed port with dissipation vents. Stabilization field radiates from this central point.",
      "detail_card_index": 3
    },
    {
      "id": "hs5",
      "zone": "BOOTS",
      "name": "Grounding Conductors",
      "x": "38",
      "y": "85",
      "description": "Kinetic absorption sole. The suit stabilizes before the destabilization event is apparent.",
      "detail_card_index": 4
    }
  ],
  "nexar": [
    {
      "id": "hs1",
      "zone": "CHEST",
      "name": "Asymmetric Armor Plate",
      "x": "48",
      "y": "28",
      "description": "Red fracture channels trace across aggressive angular geometry. Not circuit light \u2014 bleed, not flow.",
      "detail_card_index": 0
    },
    {
      "id": "hs2",
      "zone": "RIGHT_SHOULDER",
      "name": "Pauldron Fracture Points",
      "x": "62",
      "y": "18",
      "description": "Aggressive angular geometry with fracture channel emergence points.",
      "detail_card_index": 1
    },
    {
      "id": "hs3",
      "zone": "LEFT_FOREARM",
      "name": "Vein Circuit Fracture Panel",
      "x": "30",
      "y": "45",
      "description": "Semi-transparent forearm panel revealing red energy fracture network beneath the surface.",
      "detail_card_index": 2
    },
    {
      "id": "hs4",
      "zone": "BACK",
      "name": "Diagonal Spine Fracture Channel",
      "x": "70",
      "y": "35",
      "description": "Primary disruption conduit running diagonally \u2014 the direct inverse of Ramet's stabilization spine.",
      "detail_card_index": 3
    },
    {
      "id": "hs5",
      "zone": "HANDS",
      "name": "Knuckle Energy Emergence",
      "x": "58",
      "y": "55",
      "description": "Tactical grip surface with visible energy emergence at each knuckle point.",
      "detail_card_index": 4
    }
  ],
  "lyra": [
    {
      "id": "hs1",
      "zone": "CHEST",
      "name": "Orbital Panel Array",
      "x": "45",
      "y": "25",
      "description": "Geometric orbital pattern with system status indicators. Cyan circuit lines converge at holographic trigger points.",
      "detail_card_index": 0
    },
    {
      "id": "hs2",
      "zone": "LEFT_FOREARM",
      "name": "Text-Data String Display",
      "x": "28",
      "y": "42",
      "description": "Holographic interface trigger points with gold circuit lines converging at wrist for system projection.",
      "detail_card_index": 1
    },
    {
      "id": "hs3",
      "zone": "RIGHT_SHOULDER",
      "name": "Angular Architectural Plates",
      "x": "62",
      "y": "18",
      "description": "Gold trim with layered tact-armor design. Angular construction mirrors architectural blueprints.",
      "detail_card_index": 2
    },
    {
      "id": "hs4",
      "zone": "BELT",
      "name": "Tactical Belt System",
      "x": "50",
      "y": "55",
      "description": "Deep forest green with gold edge line. System access ports along the band for direct grid connection.",
      "detail_card_index": 3
    },
    {
      "id": "hs5",
      "zone": "BACK",
      "name": "Architectural Map Network",
      "x": "70",
      "y": "38",
      "description": "Gold orbit-line patterns forming complete architectural blueprints. Spine channel runs full height.",
      "detail_card_index": 4
    }
  ],
  "kairo": [
    {
      "id": "hs1",
      "zone": "CHEST",
      "name": "Targeting Geometry Panel",
      "x": "48",
      "y": "26",
      "description": "Dark panel with embedded geometric targeting array. Purple circuit lines trace precision pathways.",
      "detail_card_index": 0
    },
    {
      "id": "hs2",
      "zone": "LEFT_FOREARM",
      "name": "Precision-Stream Interface",
      "x": "28",
      "y": "40",
      "description": "Scalpel mode active \u2014 reactive scripts converging to wrist for targeted data operations.",
      "detail_card_index": 1
    },
    {
      "id": "hs3",
      "zone": "RIGHT_SHOULDER",
      "name": "Angular Plates & Purple Trim",
      "x": "64",
      "y": "18",
      "description": "Layered armor construction with embedded purple geometric circuit lines.",
      "detail_card_index": 2
    },
    {
      "id": "hs4",
      "zone": "BELT",
      "name": "Tactical Code-Strap Belt",
      "x": "50",
      "y": "55",
      "description": "PRECISION_FOCUS_v1.0 designation. Intel focus channels with ancient precision symbols.",
      "detail_card_index": 3
    },
    {
      "id": "hs5",
      "zone": "BACK",
      "name": "Precision Matrix Core",
      "x": "68",
      "y": "35",
      "description": "Ancient precision symbols column running spine-length. Intel focus channels embedded in matrix.",
      "detail_card_index": 4
    }
  ],
  "nefra": [
    {
      "id": "hs1",
      "zone": "CHEST",
      "name": "Resonance Core Panel",
      "x": "48",
      "y": "26",
      "description": "Purple-dominant energy spiral manifestation. Resonance core replaces Kairo's holographic projection.",
      "detail_card_index": 0
    },
    {
      "id": "hs2",
      "zone": "LEFT_FOREARM",
      "name": "Resonance-Stream Interface",
      "x": "28",
      "y": "40",
      "description": "Scalpel mode with resonance frequency \u2014 dissolves rather than cuts.",
      "detail_card_index": 1
    },
    {
      "id": "hs3",
      "zone": "RIGHT_SHOULDER",
      "name": "Angular Plates & Deep Purple Trim",
      "x": "64",
      "y": "18",
      "description": "Same layered construction as Kairo but with deeper purple energy saturation.",
      "detail_card_index": 2
    },
    {
      "id": "hs4",
      "zone": "BELT",
      "name": "Frequency Calibration Belt",
      "x": "50",
      "y": "55",
      "description": "PRECISION_FOCUS_v1.0 \u2014 same designation, different frequency calibration.",
      "detail_card_index": 3
    },
    {
      "id": "hs5",
      "zone": "BACK",
      "name": "Resonance Matrix Core",
      "x": "68",
      "y": "35",
      "description": "Ancient precision symbols with purple resonance glow. Same column, different energy signature.",
      "detail_card_index": 4
    }
  ],
  "horusen": [
    {
      "id": "hs1",
      "zone": "CHEST",
      "name": "Royal Blue Armor Plates",
      "x": "48",
      "y": "25",
      "description": "Embedded gold hieroglyphic symbols. Each symbol is a compressed data protocol from the ancient Grid.",
      "detail_card_index": 0
    },
    {
      "id": "hs2",
      "zone": "LEFT_FOREARM",
      "name": "Data-Stream Interface",
      "x": "28",
      "y": "42",
      "description": "Reactive script display with gold hieroglyphic data streams. Ancient knowledge translated to tactical readout.",
      "detail_card_index": 1
    },
    {
      "id": "hs3",
      "zone": "RIGHT_SHOULDER",
      "name": "Layered Armor Construction",
      "x": "62",
      "y": "18",
      "description": "Articulation joints allowing full range of motion while maintaining hieroglyphic integrity.",
      "detail_card_index": 2
    },
    {
      "id": "hs4",
      "zone": "BELT",
      "name": "PROTECTION_STREAM_v4.1",
      "x": "50",
      "y": "55",
      "description": "Tactical belt with code-strap. Protection stream designation marks active guardian protocol.",
      "detail_card_index": 3
    },
    {
      "id": "hs5",
      "zone": "BACK",
      "name": "Power Matrix Core",
      "x": "68",
      "y": "35",
      "description": "Symbols of power and knowledge running spine-length. The oldest active code in the Grid.",
      "detail_card_index": 4
    }
  ]
};
