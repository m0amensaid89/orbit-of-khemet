import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Split text into chunks of ~500 words with 50-word overlap
function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
    i += chunkSize - overlap;
  }
  return chunks.filter(c => c.trim().length > 50);
}

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, content, source_type, file_url } = await req.json();
    if (!title || !content) return Response.json({ error: 'Missing title or content' }, { status: 400 });

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Save source
    const { data: source, error: sourceError } = await supabaseAdmin
      .from('knowledge_sources')
      .insert({ user_id: user.id, title, content, source_type: source_type || 'text', file_url })
      .select().single();

    if (sourceError) throw sourceError;

    // Chunk and embed
    const chunks = chunkText(content);
    let embedded = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      // Get embedding from OpenRouter (using text-embedding-3-small via OpenAI compatible endpoint)
      const embRes = await fetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/text-embedding-3-small',
          input: chunk,
        }),
      });

      if (embRes.ok) {
        const embData = await embRes.json();
        const embedding = embData.data?.[0]?.embedding;
        if (embedding) {
          await supabaseAdmin.from('knowledge_chunks').insert({
            source_id: source.id,
            user_id: user.id,
            content: chunk,
            embedding,
            chunk_index: i,
          });
          embedded++;
        }
      }
    }

    // Update chunk count
    await supabaseAdmin
      .from('knowledge_sources')
      .update({ chunk_count: embedded })
      .eq('id', source.id);

    return Response.json({ success: true, source_id: source.id, chunks_embedded: embedded });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}