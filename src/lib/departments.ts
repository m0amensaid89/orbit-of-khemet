export interface Department {
  id: string;
  name: string;
  hero: string;
  heroSlug: string;
  color: string;
  icon: string;
  description: string;
  capabilities: string[];
  quickActions: QuickAction[];
}

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'marketing',
    name: 'Marketing & Growth',
    hero: 'NEXAR',
    heroSlug: 'nexar',
    color: '#FF4444',
    icon: '📢',
    description: 'Campaign strategy, growth hacking, ad copy, SEO, and lead generation.',
    capabilities: ['Cold email sequences', 'SEO strategy', 'Ad copy creation', 'Campaign planning', 'Growth strategy', 'Social media content'],
    quickActions: [
      { id: 'cold-email', label: 'COLD EMAIL SEQUENCE', prompt: 'Write a 5-email cold outreach sequence for a B2B SaaS product targeting HR directors', icon: '✉️' },
      { id: 'seo-audit', label: 'SEO STRATEGY', prompt: 'Create a comprehensive SEO strategy for a gamification consulting company in Egypt', icon: '🔍' },
      { id: 'ad-copy', label: 'AD COPY', prompt: 'Write 5 high-converting LinkedIn ad copies for an AI platform targeting business owners', icon: '📣' },
      { id: 'growth-plan', label: 'GROWTH PLAN', prompt: 'Build a 90-day growth strategy for a B2B AI platform entering the MENA market', icon: '📈' },
    ],
  },
  {
    id: 'strategy',
    name: 'Strategy & Planning',
    hero: 'HORUSEN',
    heroSlug: 'horusen',
    color: '#3A6DD4',
    icon: '🎯',
    description: 'Business plans, competitive analysis, OKRs, roadmaps, and market research.',
    capabilities: ['Business planning', 'Competitive analysis', 'OKR setting', 'Market research', 'Roadmap creation', 'SWOT analysis'],
    quickActions: [
      { id: 'business-plan', label: 'BUSINESS PLAN', prompt: 'Create a lean business plan for a gamification and AI consulting company targeting MENA enterprises', icon: '📋' },
      { id: 'competitive', label: 'COMPETITIVE ANALYSIS', prompt: 'Analyze the competitive landscape for AI business platforms in the MENA region', icon: '⚔️' },
      { id: 'okrs', label: 'SET OKRs', prompt: 'Create quarterly OKRs for an AI platform startup in its growth phase with 5 employees', icon: '🎯' },
      { id: 'swot', label: 'SWOT ANALYSIS', prompt: 'Run a SWOT analysis for I-Gamify.net as an AI and gamification consulting company in Egypt', icon: '🔬' },
    ],
  },
  {
    id: 'operations',
    name: 'Operations & Technology',
    hero: 'KAIRO',
    heroSlug: 'kairo',
    color: '#6C63FF',
    icon: '⚙️',
    description: 'SOPs, automation workflows, system design, technical architecture, and process optimization.',
    capabilities: ['SOP creation', 'Workflow automation', 'System design', 'Process optimization', 'Technical documentation', 'Tool selection'],
    quickActions: [
      { id: 'sop', label: 'CREATE SOP', prompt: 'Write a detailed SOP for onboarding a new client at a consulting agency', icon: '📝' },
      { id: 'automation', label: 'AUTOMATION PLAN', prompt: 'Design an automation workflow for a small business sales and marketing process', icon: '🤖' },
      { id: 'tech-stack', label: 'TECH STACK REVIEW', prompt: 'Recommend the optimal tech stack for a B2B SaaS platform targeting MENA enterprises', icon: '🏗️' },
      { id: 'process', label: 'PROCESS AUDIT', prompt: 'Audit and optimize the typical client delivery process for a digital consulting firm', icon: '🔄' },
    ],
  },
  {
    id: 'content',
    name: 'Content & Brand',
    hero: 'LYRA',
    heroSlug: 'lyra',
    color: '#2D6A4F',
    icon: '✍️',
    description: 'Blog posts, social media, brand voice, storytelling, and content strategy.',
    capabilities: ['Blog writing', 'Brand voice development', 'Social media content', 'Storytelling', 'Content strategy', 'Copywriting'],
    quickActions: [
      { id: 'brand-voice', label: 'BRAND VOICE', prompt: 'Define a complete brand voice guide for a premium AI platform with Egyptian-inspired design', icon: '🎨' },
      { id: 'blog-post', label: 'BLOG POST', prompt: 'Write a 1500-word thought leadership article on how gamification transforms employee training', icon: '📰' },
      { id: 'linkedin', label: 'LINKEDIN CONTENT', prompt: 'Create a 30-day LinkedIn content calendar for a B2B AI consulting company', icon: '💼' },
      { id: 'story', label: 'BRAND STORY', prompt: 'Write a compelling brand origin story for I-Gamify.net focusing on our mission to transform business through AI and gamification', icon: '📖' },
    ],
  },
  {
    id: 'sales',
    name: 'Sales & CRM',
    hero: 'NEFRA',
    heroSlug: 'nefra',
    color: '#9B59B6',
    icon: '💰',
    description: 'Sales scripts, proposals, follow-up sequences, objection handling, and CRM strategy.',
    capabilities: ['Sales scripts', 'Proposal writing', 'Follow-up sequences', 'Objection handling', 'Pipeline strategy', 'Client presentations'],
    quickActions: [
      { id: 'sales-script', label: 'SALES SCRIPT', prompt: 'Write a discovery call script for selling AI workflow consulting to a mid-size company CEO', icon: '📞' },
      { id: 'proposal', label: 'PROPOSAL', prompt: 'Create a professional project proposal for implementing gamification in a corporate training program', icon: '📄' },
      { id: 'objections', label: 'OBJECTION HANDLER', prompt: 'Create responses to the top 10 objections when selling AI consulting services to traditional businesses', icon: '🛡️' },
      { id: 'follow-up', label: 'FOLLOW-UP SEQUENCE', prompt: 'Write a 7-day email follow-up sequence after a sales demo for an AI platform', icon: '🔁' },
    ],
  },
  {
    id: 'finance',
    name: 'Finance & Analytics',
    hero: 'RAMET',
    heroSlug: 'ramet',
    color: '#4ECDC4',
    icon: '📊',
    description: 'Financial reports, KPI dashboards, forecasting, pricing strategy, and metrics analysis.',
    capabilities: ['Financial modeling', 'KPI tracking', 'Revenue forecasting', 'Pricing strategy', 'Budget planning', 'Metrics analysis'],
    quickActions: [
      { id: 'kpi-dashboard', label: 'KPI FRAMEWORK', prompt: 'Design a KPI framework for a B2B SaaS company with 50 clients and 5 employees', icon: '📈' },
      { id: 'pricing', label: 'PRICING STRATEGY', prompt: 'Develop a pricing strategy for an AI platform targeting MENA SMEs with 3 tier options', icon: '💲' },
      { id: 'forecast', label: 'REVENUE FORECAST', prompt: 'Build a 12-month revenue forecast model for a consulting company growing at 20% monthly', icon: '🔮' },
      { id: 'budget', label: 'BUDGET PLAN', prompt: 'Create a quarterly budget plan for a 5-person digital consulting startup in Egypt', icon: '💼' },
    ],
  },
  {
    id: 'legal',
    name: 'Legal & Compliance',
    hero: 'THOREN',
    heroSlug: 'thoren',
    color: '#C0C0C0',
    icon: '⚖️',
    description: 'Contracts, terms of service, privacy policies, compliance frameworks, and risk assessment.',
    capabilities: ['Contract templates', 'Terms of service', 'Privacy policies', 'Risk assessment', 'Compliance frameworks', 'NDA drafting'],
    quickActions: [
      { id: 'contract', label: 'CONTRACT TEMPLATE', prompt: 'Draft a professional service agreement template for a digital consulting company in Egypt', icon: '📜' },
      { id: 'privacy', label: 'PRIVACY POLICY', prompt: 'Write a GDPR-compliant privacy policy for a SaaS platform that processes user data and chat history', icon: '🔒' },
      { id: 'nda', label: 'NDA TEMPLATE', prompt: 'Create a mutual NDA template for a consulting company working with enterprise clients', icon: '🤝' },
      { id: 'risk', label: 'RISK ASSESSMENT', prompt: 'Perform a risk assessment for launching an AI platform in the MENA region including regulatory considerations', icon: '⚠️' },
    ],
  },
];

export function getDepartment(id: string): Department | undefined {
  return DEPARTMENTS.find(d => d.id === id);
}

export function getDepartmentByHero(heroSlug: string): Department | undefined {
  return DEPARTMENTS.find(d => d.heroSlug === heroSlug);
}
