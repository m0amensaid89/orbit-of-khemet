-- S52: Live Model Registry
-- Synced from OpenRouter every 24h via /api/models/sync

CREATE TABLE IF NOT EXISTS model_registry (
  id                  TEXT PRIMARY KEY,          -- e.g. "anthropic/claude-sonnet-4-5"
  label               TEXT NOT NULL,             -- display name
  provider            TEXT NOT NULL,             -- "anthropic" | "openai" | "google" | "x-ai" | "meta"
  context_length      INTEGER DEFAULT 0,
  cost_input_per_1m   NUMERIC(12,6) DEFAULT 0,   -- USD per 1M input tokens
  cost_output_per_1m  NUMERIC(12,6) DEFAULT 0,   -- USD per 1M output tokens
  supports_tools      BOOLEAN DEFAULT false,
  supports_vision     BOOLEAN DEFAULT false,
  is_active           BOOLEAN DEFAULT true,
  description         TEXT,
  last_synced_at      TIMESTAMPTZ DEFAULT NOW(),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: public read, service-role write
ALTER TABLE model_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "model_registry_public_read"
  ON model_registry FOR SELECT TO authenticated, anon
  USING (true);

-- Service role can do everything (no policy needed — service role bypasses RLS)

-- Index for provider filtering
CREATE INDEX IF NOT EXISTS idx_model_registry_provider ON model_registry(provider);
CREATE INDEX IF NOT EXISTS idx_model_registry_active ON model_registry(is_active);

-- Seed with current known models (queryRouter.ts source of truth)
INSERT INTO model_registry (id, label, provider, context_length, supports_tools, supports_vision, is_active) VALUES
  ('anthropic/claude-haiku-4-5',   'Claude Haiku 4.5',   'anthropic', 200000, true,  false, true),
  ('anthropic/claude-sonnet-4-5',  'Claude Sonnet 4.5',  'anthropic', 200000, true,  true,  true),
  ('anthropic/claude-opus-4-5',    'Claude Opus 4.5',    'anthropic', 200000, true,  true,  true),
  ('openai/gpt-4o-mini',           'GPT-4o Mini',        'openai',    128000, true,  true,  true),
  ('openai/gpt-4o',                'GPT-4o',             'openai',    128000, true,  true,  true),
  ('google/gemini-2.0-flash',      'Gemini 2.0 Flash',   'google',    1000000,true,  true,  true),
  ('google/gemini-2.0-flash-001',  'Gemini 2.0 Flash 001','google',   1000000,true,  true,  true),
  ('x-ai/grok-3-mini',             'Grok 3 Mini',        'x-ai',      131072, false, false, true),
  ('x-ai/grok-3',                  'Grok 3',             'x-ai',      131072, true,  false, true)
ON CONFLICT (id) DO NOTHING;
