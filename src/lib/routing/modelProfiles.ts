// ── Orbit of Khemet — Model Profiles Registry ──────────────────────────────
// S48: Smart Routing Engine
// Static capability database. queryRouter.ts reads this to make selections.
// Never select models manually — always go through queryRouter.

export type ModelCost = 'free' | 'low' | 'medium' | 'high' | 'very_high';
export type ModelSpeed = 'instant' | 'fast' | 'medium' | 'slow';

export interface ModelProfile {
  id: string;
  label: string;
  strengths: string[];
  weaknesses: string[];
  domains: string[];    // agent category domains this model excels at
  languages: string[];  // ISO 639-1 codes — languages the model handles well
  cost: ModelCost;
  speed: ModelSpeed;
  maxTokens: number;
  supportsRealtime: boolean;
  supportsCode: boolean;
  supportsArabic: boolean;
  supportsLongContext: boolean;
  tierRequired: 'free' | 'starter' | 'pro' | 'any'; // minimum tier
}

export const MODEL_PROFILES: Record<string, ModelProfile> = {
  // ── CLAUDE FAMILY ─────────────────────────────────────────────────────────
  'anthropic/claude-haiku-4-5': {
    id: 'anthropic/claude-haiku-4-5',
    label: 'Claude Haiku',
    strengths: ['fast', 'concise', 'summaries', 'classification', 'short-tasks'],
    weaknesses: ['complex-reasoning', 'long-analysis', 'code-generation'],
    domains: ['customer_support', 'quick_answers', 'classification'],
    languages: ['en', 'ar', 'fr', 'de', 'es'],
    cost: 'low',
    speed: 'instant',
    maxTokens: 200000,
    supportsRealtime: false,
    supportsCode: true,
    supportsArabic: true,
    supportsLongContext: true,
    tierRequired: 'free',
  },
  'anthropic/claude-sonnet-4-5': {
    id: 'anthropic/claude-sonnet-4-5',
    label: 'Claude Sonnet',
    strengths: ['writing', 'analysis', 'reasoning', 'multilingual', 'strategy', 'law'],
    weaknesses: ['realtime-data', 'very-complex-code'],
    domains: ['strategy', 'writing', 'law', 'education', 'analysis', 'hr', 'content'],
    languages: ['en', 'ar', 'fr', 'de', 'es', 'it', 'pt'],
    cost: 'medium',
    speed: 'medium',
    maxTokens: 200000,
    supportsRealtime: false,
    supportsCode: true,
    supportsArabic: true,
    supportsLongContext: true,
    tierRequired: 'any',
  },
  'anthropic/claude-opus-4-5': {
    id: 'anthropic/claude-opus-4-5',
    label: 'Claude Opus',
    strengths: ['deep-reasoning', 'complex-analysis', 'nuanced-writing', 'research-synthesis'],
    weaknesses: ['speed', 'cost-efficiency', 'realtime'],
    domains: ['deep_analysis', 'research', 'legal', 'executive', 'philosophy'],
    languages: ['en', 'ar', 'fr', 'de', 'es'],
    cost: 'very_high',
    speed: 'slow',
    maxTokens: 200000,
    supportsRealtime: false,
    supportsCode: true,
    supportsArabic: true,
    supportsLongContext: true,
    tierRequired: 'pro',
  },

  // ── OPENAI FAMILY ─────────────────────────────────────────────────────────
  'openai/gpt-4o-mini': {
    id: 'openai/gpt-4o-mini',
    label: 'GPT-4o Mini',
    strengths: ['code', 'structured-output', 'fast', 'function-calling'],
    weaknesses: ['long-context', 'deep-analysis'],
    domains: ['code', 'data', 'technical', 'automation'],
    languages: ['en', 'ar', 'fr', 'de'],
    cost: 'low',
    speed: 'fast',
    maxTokens: 128000,
    supportsRealtime: false,
    supportsCode: true,
    supportsArabic: true,
    supportsLongContext: false,
    tierRequired: 'free',
  },
  'openai/gpt-4o': {
    id: 'openai/gpt-4o',
    label: 'GPT-4o',
    strengths: ['code', 'structured-output', 'data-analysis', 'function-calling', 'excel', 'technical'],
    weaknesses: ['long-form-writing', 'arabic-nuance'],
    domains: ['code', 'data', 'excel', 'technical', 'finance', 'operations'],
    languages: ['en', 'ar', 'fr', 'de', 'es'],
    cost: 'medium',
    speed: 'fast',
    maxTokens: 128000,
    supportsRealtime: false,
    supportsCode: true,
    supportsArabic: true,
    supportsLongContext: false,
    tierRequired: 'any',
  },

  // ── GOOGLE FAMILY ─────────────────────────────────────────────────────────
  'google/gemini-2.0-flash': {
    id: 'google/gemini-2.0-flash',
    label: 'Gemini Flash',
    strengths: ['multimodal', 'image-analysis', 'arabic', 'speed', 'multilingual'],
    weaknesses: ['complex-reasoning', 'code-generation'],
    domains: ['image_analysis', 'multilingual', 'quick-tasks', 'media'],
    languages: ['en', 'ar', 'fr', 'de', 'es', 'zh', 'hi'],
    cost: 'low',
    speed: 'instant',
    maxTokens: 1000000,
    supportsRealtime: false,
    supportsCode: true,
    supportsArabic: true,
    supportsLongContext: true,
    tierRequired: 'free',
  },
  'google/gemini-2.0-flash-001': {
    id: 'google/gemini-2.0-flash-001',
    label: 'Gemini Flash 001',
    strengths: ['multimodal', 'arabic', 'speed', 'long-context'],
    weaknesses: ['complex-reasoning'],
    domains: ['multilingual', 'quick-tasks', 'content'],
    languages: ['en', 'ar', 'fr', 'de', 'es', 'zh'],
    cost: 'low',
    speed: 'instant',
    maxTokens: 1000000,
    supportsRealtime: false,
    supportsCode: true,
    supportsArabic: true,
    supportsLongContext: true,
    tierRequired: 'free',
  },

  // ── XAI / GROK ───────────────────────────────────────────────────────────
  'x-ai/grok-3-mini': {
    id: 'x-ai/grok-3-mini',
    label: 'Grok 3 Mini',
    strengths: ['realtime', 'current-events', 'fast'],
    weaknesses: ['deep-analysis', 'long-form'],
    domains: ['realtime', 'news', 'market', 'social'],
    languages: ['en', 'ar'],
    cost: 'low',
    speed: 'fast',
    maxTokens: 131072,
    supportsRealtime: true,
    supportsCode: true,
    supportsArabic: true,
    supportsLongContext: false,
    tierRequired: 'free',
  },
  'x-ai/grok-3': {
    id: 'x-ai/grok-3',
    label: 'Grok 3',
    strengths: ['realtime', 'current-events', 'reasoning', 'analysis', 'code'],
    weaknesses: ['long-context'],
    domains: ['realtime', 'news', 'market', 'social', 'research'],
    languages: ['en', 'ar'],
    cost: 'medium',
    speed: 'medium',
    maxTokens: 131072,
    supportsRealtime: true,
    supportsCode: true,
    supportsArabic: true,
    supportsLongContext: false,
    tierRequired: 'any',
  },
};

// Domain → preferred model mapping (used by queryRouter for category-based routing)
export const DOMAIN_MODEL_MAP: Record<string, string> = {
  // Technical domains → GPT-4o for code precision
  'code':             'openai/gpt-4o',
  'technical':        'openai/gpt-4o',
  'data':             'openai/gpt-4o',
  'excel':            'openai/gpt-4o',
  'finance':          'openai/gpt-4o',
  'operations':       'openai/gpt-4o',
  'automation':       'openai/gpt-4o',
  // Strategy/law/writing → Claude Sonnet for depth and nuance
  'strategy':         'anthropic/claude-sonnet-4-5',
  'law':              'anthropic/claude-sonnet-4-5',
  'writing':          'anthropic/claude-sonnet-4-5',
  'content':          'anthropic/claude-sonnet-4-5',
  'education':        'anthropic/claude-sonnet-4-5',
  'hr':               'anthropic/claude-sonnet-4-5',
  'analysis':         'anthropic/claude-sonnet-4-5',
  // Realtime → Grok
  'realtime':         'x-ai/grok-3',
  'news':             'x-ai/grok-3',
  'market':           'x-ai/grok-3',
  // Multilingual/quick → Gemini
  'multilingual':     'google/gemini-2.0-flash',
  'image_analysis':   'google/gemini-2.0-flash',
  'media':            'google/gemini-2.0-flash',
  // Deep analysis → Claude Opus (pro tier only)
  'deep_analysis':    'anthropic/claude-opus-4-5',
  'research':         'anthropic/claude-opus-4-5',
  'legal':            'anthropic/claude-opus-4-5',
};

// Agent category → domain mapping
export const CATEGORY_DOMAIN_MAP: Record<string, string> = {
  // THOREN — Law & Governance
  'Finance & Operations':       'finance',
  'Legal & Compliance':         'law',
  'Governance':                 'strategy',
  // RAMET — Stability & Operations
  'Operations':                 'operations',
  'Project Management':         'operations',
  'HR & People':                'hr',
  // NEXAR — Tech & Innovation
  'Technology':                 'code',
  'Development':                'code',
  'Engineering':                'code',
  'AI & Automation':            'automation',
  // LYRA — Creative & Content
  'Marketing':                  'writing',
  'Content':                    'writing',
  'Copywriting':                'writing',
  'Creative':                   'writing',
  'Design':                     'writing',
  // KAIRO — Growth
  'Growth':                     'strategy',
  'Sales':                      'strategy',
  'Business Development':       'strategy',
  // NEFRA — Data & Intelligence
  'Data & Analytics':           'data',
  'Research & Intelligence':    'realtime',
  'Market Research':            'realtime',
  // HORUSEN — Systems
  'Systems':                    'code',
  'Architecture':               'code',
  'Security':                   'code',
  // Generic
  'Jobseekers':                 'writing',
  'Education':                  'education',
  'Custom':                     'writing',
};
