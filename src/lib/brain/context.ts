import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getBrainContext(userId: string): Promise<string> {
  if (!userId) return ''

  const contextParts: string[] = []

  // Fetch user memories first (highest priority context)
  try {
    const { data: memories } = await supabaseAdmin
      .from('user_memory')
      .select('memory_text, category')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(15)

    if (memories && memories.length > 0) {
      const memoryBlock = memories
        .map(m => '[' + m.category.toUpperCase() + '] ' + m.memory_text)
        .join('\n')
      contextParts.push('=== AGENT MEMORY — WHAT I KNOW ABOUT THIS USER ===\n' + memoryBlock + '\n=== END MEMORY ===')
    }
  } catch { /* silent fail */ }

  // Fetch knowledge chunks
  try {
    const { data: chunks } = await supabaseAdmin
      .from('knowledge_chunks')
      .select('content, knowledge_sources(name, type)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (chunks && chunks.length > 0) {
      const knowledgeBlock = chunks
        .map((chunk: { content: string; knowledge_sources: unknown }) => {
          const ks = chunk.knowledge_sources as { name: string; type: string } | null
          const sourceName = Array.isArray(ks) ? (ks[0]?.name || 'Unknown') : (ks?.name || 'Unknown')
          return '[FROM: ' + sourceName + ']\n' + chunk.content
        })
        .join('\n\n---\n\n')
      contextParts.push('=== KHEMET BRAIN — USER KNOWLEDGE BASE ===\nThe following content was uploaded by the user. Use it to inform your responses:\n\n' + knowledgeBlock + '\n\n=== END BRAIN CONTEXT ===')
    }
  } catch { /* silent fail */ }

  if (contextParts.length === 0) return ''
  return '\n\n' + contextParts.join('\n\n')
}
