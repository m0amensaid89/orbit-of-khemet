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

export const CREDIT_COSTS: Record<RequestType, number> = {
  text:              6,
  code:              9,
  realtime:          6,
  research:         15,
  image_analysis:    2,
  deep_analysis:    26,
  image_generation: 200,
  video_quick:      2,
  video_standard:   5,
  video_cinematic:  12,
  video_edit:       700,
  website_analysis: 15,
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
