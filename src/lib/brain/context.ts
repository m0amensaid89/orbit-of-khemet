import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getBrainContext(userId: string): Promise<string> {
  if (!userId) return ''

  const { data: chunks } = await supabaseAdmin
    .from('knowledge_chunks')
    .select('content, knowledge_sources(name, type)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (!chunks || chunks.length === 0) return ''

  const contextBlock = chunks
    .map((chunk: { content: string, knowledge_sources?: { name: string, type: string } | { name: string, type: string }[] | null | unknown }) => {
      const ks = chunk.knowledge_sources as { name: string, type: string } | { name: string, type: string }[] | null | undefined;
      const sourceName = Array.isArray(ks) ? ks[0]?.name : ks?.name || 'Unknown'
      return `[FROM: ${sourceName}]\n${chunk.content}`
    })
    .join('\n\n---\n\n')

  return `\n\n=== KHEMET BRAIN — USER KNOWLEDGE BASE ===\nThe following content was uploaded by the user. Use it to inform your responses:\n\n${contextBlock}\n\n=== END BRAIN CONTEXT ===\n`
}