export type RequestType =
  | 'text'
  | 'code'
  | 'realtime'
  | 'research'
  | 'image_analysis'
  | 'deep_analysis'
  | 'image_generation'
  | 'video_quick'
  | 'video_standard'
  | 'video_cinematic'
  | 'video_edit'
  | 'website_analysis'
  | 'browser_control'

export const CREDIT_COSTS: Record<RequestType, number> = {
  text:              6,
  code:              9,
  realtime:          6,
  research:         15,
  image_analysis:    2,
  deep_analysis:    26,
  image_generation: 200,
  video_quick:      80,   // Sprint 36: corrected from 2 — break-even is 62 at $9 tier
  video_standard:   400,  // Sprint 36: corrected from 5 — break-even is 311 at $9 tier
  video_cinematic:  800,  // Sprint 36: corrected from 12 — break-even is 622 at $9 tier
  video_edit:       4000, // Sprint 36: corrected from 700 — break-even is 3111 at $9 tier
  website_analysis: 15,
  browser_control: 25,  // per action — Playwright session on Railway
}

export const PLATFORM_MODEL_MAP: Record<RequestType, string> = {
  text:             'anthropic/claude-sonnet-4-5',
  code:             'openai/gpt-4o',
  realtime:         'x-ai/grok-3',
  research:         'perplexity-agent',
  image_analysis:   'google/gemini-2.0-flash',
  deep_analysis:    'anthropic/claude-opus-4-5',
  image_generation: 'x-ai/grok-aurora',
  video_quick:      'fal-ai/kling-video/v3/turbo',
  video_standard:   'fal-ai/kling-video/v3/pro',
  video_cinematic:  'fal-ai/veo3',
  video_edit:       'fal-ai/runway-gen4',
  website_analysis: 'perplexity-agent',
  browser_control: 'orbit-browser-service',
}

export const PLATFORM_LABELS: Record<RequestType, string> = {
  text:             'Claude Sonnet',
  code:             'GPT-4o',
  realtime:         'Grok 3',
  research:         'Perplexity',
  image_analysis:   'Gemini Flash',
  deep_analysis:    'Claude Opus',
  image_generation: 'Grok Aurora',
  video_quick:      'Kling 3 Turbo',
  video_standard:   'Kling 3 Pro',
  video_cinematic:  'Veo 3.1',
  video_edit:       'Runway Gen-4',
  website_analysis: 'Perplexity Web',
  browser_control: 'Browser Agent',
}

export const TIER_CREDITS: Record<string, number> = {
  personal_basic:      7000,
  personal_explorer:   11200,
  personal_starter:    22400,
  business_pro:        38500,
  business_standard:   420000,
  business_enterprise: 840000,
  free_scout:          100,
}

export const UPGRADE_THRESHOLD = 0.15

export interface UserCredits {
  balance: number;
  totalAllocation: number;
  tier: 'FREE' | 'STARTER' | 'PRO' | 'EMPIRE';
  resetDate: string;
  usageHistory: { date: string; amount: number; type: string }[];
}

export const TIER_LIMITS = {
  FREE: 100,
  STARTER: 500,
  PRO: 1000,
  EMPIRE: 5000,
};

export const TIER_COLORS = {
  FREE: 'rgba(212,175,55,0.4)',
  STARTER: '#D4AF37',
  PRO: '#06B6D4',
  EMPIRE: '#2563EB',
};

export function getUsagePercentage(balance: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.max(0, (balance / total) * 100));
}

export function getWarningLevel(percentage: number): 'normal' | 'warning' | 'critical' {
  if (percentage < 5) return 'critical';
  if (percentage < 15) return 'warning';
  return 'normal';
}

export function formatCredits(amount: number): string {
  return amount.toLocaleString();
}

// ── SPRINT 34: Smart Router v2 ────────────────────────────────────────────
// Complexity-aware, tier-optimized model selection.
// Replaces static PLATFORM_MODEL_MAP lookup in chat/route.ts

export function getMessageComplexity(message: string): 'simple' | 'standard' | 'complex' {
  const wordCount = message.trim().split(/\s+/).length
  const hasCodeIndicators = /```|function|class|import|export|const |let |var /.test(message)
  const hasAnalysisIndicators = /analyze|compare|evaluate|assess|strategy|deep|comprehensive|detailed|thorough/.test(message.toLowerCase())
  const hasMultiStep = message.includes('\n') && wordCount > 100

  if (hasCodeIndicators && wordCount > 50) return 'complex'
  if (hasAnalysisIndicators || hasMultiStep) return 'complex'
  if (wordCount > 150) return 'standard'
  if (wordCount < 30) return 'simple'
  return 'standard'
}

const SMART_MODEL_MAP: Record<RequestType, {
  simple: string
  standard: string
  complex: string
  free: string
}> = {
  text: {
    simple:   'anthropic/claude-haiku-4-5',
    standard: 'anthropic/claude-sonnet-4-5',
    complex:  'anthropic/claude-sonnet-4-5',
    free:     'anthropic/claude-haiku-4-5',
  },
  code: {
    simple:   'openai/gpt-4o-mini',
    standard: 'openai/gpt-4o',
    complex:  'openai/gpt-4o',
    free:     'openai/gpt-4o-mini',
  },
  realtime: {
    simple:   'x-ai/grok-3-mini',
    standard: 'x-ai/grok-3',
    complex:  'x-ai/grok-3',
    free:     'x-ai/grok-3-mini',
  },
  research: {
    simple:   'perplexity-agent',
    standard: 'perplexity-agent',
    complex:  'perplexity-agent',
    free:     'perplexity-agent',
  },
  image_analysis: {
    simple:   'google/gemini-2.0-flash',
    standard: 'google/gemini-2.0-flash',
    complex:  'google/gemini-2.0-flash',
    free:     'google/gemini-2.0-flash',
  },
  deep_analysis: {
    simple:   'anthropic/claude-sonnet-4-5',
    standard: 'anthropic/claude-opus-4-5',
    complex:  'anthropic/claude-opus-4-5',
    free:     'anthropic/claude-sonnet-4-5',
  },
  image_generation: {
    simple:   'x-ai/grok-aurora',
    standard: 'x-ai/grok-aurora',
    complex:  'x-ai/grok-aurora',
    free:     'x-ai/grok-aurora',
  },
  video_quick: {
    simple:   'fal-ai/kling-video/v3/turbo',
    standard: 'fal-ai/kling-video/v3/turbo',
    complex:  'fal-ai/kling-video/v3/turbo',
    free:     'fal-ai/kling-video/v3/turbo',
  },
  video_standard: {
    simple:   'fal-ai/kling-video/v3/pro',
    standard: 'fal-ai/kling-video/v3/pro',
    complex:  'fal-ai/kling-video/v3/pro',
    free:     'fal-ai/kling-video/v3/pro',
  },
  video_cinematic: {
    simple:   'fal-ai/veo3',
    standard: 'fal-ai/veo3',
    complex:  'fal-ai/veo3',
    free:     'fal-ai/veo3',
  },
  video_edit: {
    simple:   'fal-ai/runway-gen4',
    standard: 'fal-ai/runway-gen4',
    complex:  'fal-ai/runway-gen4',
    free:     'fal-ai/runway-gen4',
  },
  website_analysis: {
    simple:   'perplexity-agent',
    standard: 'perplexity-agent',
    complex:  'perplexity-agent',
    free:     'perplexity-agent',
  },
  browser_control: {
    simple:   'orbit-browser-service',
    standard: 'orbit-browser-service',
    complex:  'orbit-browser-service',
    free:     'orbit-browser-service',
  },
}

export function getSmartModel(
  requestType: RequestType,
  message: string,
  userTier?: string | null
): string {
  const isFree = !userTier || userTier === 'free' || userTier === 'free_scout'
  if (isFree) {
    return SMART_MODEL_MAP[requestType]?.free ?? PLATFORM_MODEL_MAP[requestType]
  }
  const complexity = getMessageComplexity(message)
  return SMART_MODEL_MAP[requestType]?.[complexity] ?? PLATFORM_MODEL_MAP[requestType]
}
