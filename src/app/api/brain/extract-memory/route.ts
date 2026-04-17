export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { messages, userId } = await req.json()
    if (!userId || !messages?.length) return NextResponse.json({ success: true, extracted: 0 })

    // Check memory count limit
    const { count } = await supabaseAdmin
      .from('user_memory')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if ((count || 0) >= 50) return NextResponse.json({ success: true, extracted: 0 })

    // Format last 6 messages as text
    const formatted = messages.slice(-6)
      .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n')

    // Call OpenRouter GPT-4o-mini for memory extraction
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        max_tokens: 300,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'You are a memory extraction assistant. Given a conversation, extract 0-3 key facts about the USER (not the AI) that are worth remembering for future conversations. Focus on: who they are, their business, their goals, their preferences, their constraints. Return ONLY a valid JSON array of strings. Each string is one memory fact. Max 3 items. If nothing worth remembering, return []. Do not include trivial or obvious facts.',
          },
          {
            role: 'user',
            content: `Extract memories from this conversation:\n\n${formatted}`,
          },
        ],
      }),
    })

    if (!res.ok) return NextResponse.json({ success: true, extracted: 0 })

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content || '[]'

    let memories: string[] = []
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim()
      memories = JSON.parse(cleaned)
      if (!Array.isArray(memories)) memories = []
    } catch {
      return NextResponse.json({ success: true, extracted: 0 })
    }

    // Insert each extracted memory
    let inserted = 0
    for (const memory_text of memories.slice(0, 3)) {
      if (typeof memory_text !== 'string' || !memory_text.trim()) continue
      const { error } = await supabaseAdmin.from('user_memory').insert({
        user_id: userId,
        memory_text: memory_text.trim(),
        category: 'general',
        source: 'agent',
      })
      if (!error) inserted++
    }

    return NextResponse.json({ success: true, extracted: inserted })
  } catch {
    return NextResponse.json({ success: true, extracted: 0 })
  }
}
