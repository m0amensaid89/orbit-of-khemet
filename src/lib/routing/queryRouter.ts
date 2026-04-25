// ── Orbit of Khemet — Query Router ──────────────────────────────────────────
// S48: Smart Routing Engine
// Selects the optimal model for every message based on:
//   1. Agent-level override (preferredModel) — highest priority
//   2. Real-time signal detection (→ Grok)
//   3. Deep analysis signal detection (→ Claude Opus, pro tier only)
//   4. Code/technical domain detection (→ GPT-4o)
//   5. Agent category → domain → model mapping
//   6. Arabic language optimization (→ Gemini Flash for simple tasks)
//   7. Tier-aware model downgrade for free users
//   8. Falls back to getSmartModel() from credits.ts

import type { RequestType } from '@/lib/credits';
import { getSmartModel, getMessageComplexity } from '@/lib/credits';
import { DOMAIN_MODEL_MAP, CATEGORY_DOMAIN_MAP } from '@/lib/routing/modelProfiles';

export interface QueryRouterContext {
  message: string;
  requestType: RequestType;
  heroSlug: string;
  agentCategory?: string | null;
  preferredModel?: string | null;  // agent-level override
  userTier?: string | null;
  lang?: string | null;
}

// ── Signal detectors ────────────────────────────────────────────────────────

function detectsRealtime(msg: string): boolean {
  return /\b(latest|current|today|now|this week|this month|2025|2026|breaking|live|trending|recent|news|stock|price|weather)\b/i.test(msg);
}

function detectsCode(msg: string): boolean {
  return /```|function\s+\w|class\s+\w|import\s+|export\s+|const\s+\w|let\s+\w|var\s+\w|\bdef\s+|\bdebugg|\brefactor|\bwrite code|\bfix this|\b(api|sql|python|javascript|typescript|react|node|docker)\b/i.test(msg);
}

function detectsDeepAnalysis(msg: string): boolean {
  return /\b(comprehensive|thorough|in-depth|deep analysis|evaluate|compare|assess|breakdown|audit|review the entire|analyze all|full report|detailed report|strategic analysis|executive summary)\b/i.test(msg);
}

function detectsCreativeWriting(msg: string): boolean {
  return /\b(write a|draft|compose|create content|blog post|article|essay|story|email|copywriting|script|caption|headline|tagline|proposal)\b/i.test(msg);
}

function detectsArabic(msg: string): boolean {
  return /[\u0600-\u06FF]/.test(msg);
}

function isFreeUser(tier?: string | null): boolean {
  return !tier || tier === 'free' || tier === 'free_scout';
}

// ── Main routing function ────────────────────────────────────────────────────

export function queryRouter(ctx: QueryRouterContext): string {
  const {
    message,
    requestType,
    agentCategory,
    preferredModel,
    userTier,
    lang,
  } = ctx;

  // ── STEP 1: Agent-level override always wins ──────────────────────────────
  if (preferredModel && preferredModel.length > 0) {
    return preferredModel;
  }

  // Non-text request types — delegate immediately to getSmartModel
  const TEXT_TYPES: RequestType[] = ['text', 'code', 'research', 'deep_analysis', 'realtime'];
  if (!TEXT_TYPES.includes(requestType)) {
    return getSmartModel(requestType, message, userTier);
  }

  const isFree = isFreeUser(userTier);
  const isArabic = detectsArabic(message) || lang === 'ar';
  const complexity = getMessageComplexity(message);

  // ── STEP 2: Real-time signal → Grok ──────────────────────────────────────
  if (detectsRealtime(message) && requestType !== 'code') {
    return isFree ? 'x-ai/grok-3-mini' : 'x-ai/grok-3';
  }

  // ── STEP 3: Code signal → GPT-4o ─────────────────────────────────────────
  if (detectsCode(message) || requestType === 'code') {
    return isFree ? 'openai/gpt-4o-mini' : 'openai/gpt-4o';
  }

  // ── STEP 4: Deep analysis → Claude Opus (non-free only) ──────────────────
  if (detectsDeepAnalysis(message) || requestType === 'deep_analysis') {
    if (!isFree) return 'anthropic/claude-opus-4-5';
    return 'anthropic/claude-sonnet-4-5';
  }

  // ── STEP 5: Creative writing → Claude Sonnet ─────────────────────────────
  if (detectsCreativeWriting(message)) {
    return 'anthropic/claude-sonnet-4-5';
  }

  // ── STEP 6: Agent category → domain → model ──────────────────────────────
  if (agentCategory) {
    const domain = CATEGORY_DOMAIN_MAP[agentCategory];
    if (domain) {
      const domainModel = DOMAIN_MODEL_MAP[domain];
      if (domainModel) {
        // Downgrade for free tier if model is expensive
        if (isFree && domainModel === 'anthropic/claude-opus-4-5') {
          return 'anthropic/claude-sonnet-4-5';
        }
        return domainModel;
      }
    }
  }

  // ── STEP 7: Arabic short query → Gemini Flash (fast + great Arabic) ───────
  if (isArabic && complexity === 'simple') {
    return 'google/gemini-2.0-flash';
  }

  // ── STEP 8: Standard text fallback by complexity + tier ──────────────────
  if (isFree) {
    return complexity === 'complex'
      ? 'anthropic/claude-haiku-4-5'
      : 'anthropic/claude-haiku-4-5';
  }

  if (complexity === 'complex') return 'anthropic/claude-sonnet-4-5';
  if (complexity === 'simple')  return 'anthropic/claude-haiku-4-5';
  return 'anthropic/claude-sonnet-4-5'; // standard
}

// ── Debug helper: explain why a model was chosen ─────────────────────────────
export function explainRouting(ctx: QueryRouterContext): {
  model: string;
  reason: string;
  tier: string;
} {
  const model = queryRouter(ctx);
  const isFree = isFreeUser(ctx.userTier);
  let reason = 'fallback to getSmartModel';

  if (ctx.preferredModel) {
    reason = 'agent preferredModel override';
  } else if (detectsRealtime(ctx.message)) {
    reason = 'real-time signal detected';
  } else if (detectsCode(ctx.message)) {
    reason = 'code signal detected';
  } else if (detectsDeepAnalysis(ctx.message)) {
    reason = isFree ? 'deep analysis → sonnet (free tier)'
                    : 'deep analysis → opus';
  } else if (detectsCreativeWriting(ctx.message)) {
    reason = 'creative writing signal';
  } else if (ctx.agentCategory && CATEGORY_DOMAIN_MAP[ctx.agentCategory]) {
    reason = `category ${ctx.agentCategory} → domain ${CATEGORY_DOMAIN_MAP[ctx.agentCategory]}`;
  } else if (detectsArabic(ctx.message)) {
    reason = 'Arabic language → Gemini Flash';
  }

  return { model, reason, tier: ctx.userTier || 'free' };
}
