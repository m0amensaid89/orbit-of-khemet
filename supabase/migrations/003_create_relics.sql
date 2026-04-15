-- Create relics table
CREATE TABLE public.relics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  hero_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  task TEXT,
  output_format TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.relics ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own relics
CREATE POLICY "Users can view own relics" ON public.relics
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own relics
CREATE POLICY "Users can create own relics" ON public.relics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own relics
CREATE POLICY "Users can delete own relics" ON public.relics
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-update updated_at on relics
CREATE TRIGGER relics_updated_at
  BEFORE UPDATE ON public.relics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
