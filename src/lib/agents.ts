export type Agent = {
  id: string;
  name: string;
  category: string;
  role_summary: string;
  description: string;
  prompt?: string;
};

export type SquadMeta = {
  agent_count?: number;
  squad_name?: string;
  domain_summary?: string;
  categories?: Record<string, number>;
};

export type HeroMeta = {
  name: string;
  class_title: string;
  origin_line: string;
  bio: string;
  quote: string;
  universe_role: string;
  color_signature: string;
  faction: string;
  status: string;
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

export function getOnboardingMessage(prompt: string): string | null {
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
