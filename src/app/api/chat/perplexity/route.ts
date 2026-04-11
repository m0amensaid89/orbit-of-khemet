import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { messages, requestType } = await req.json()
  const lastMessage = messages[messages.length - 1]?.content || ''

  const response = await fetch('https://api.perplexity.ai/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      preset: 'fast-search',
      input:  lastMessage,
    }),
  })

  const data    = await response.json()
  const content = data?.output?.find((b: { type: string, content?: { text?: string }[] }) => b.type === 'message')?.content?.[0]?.text || 'No response received.'

  return NextResponse.json({
    content,
    platform:     requestType === 'website_analysis' ? 'Perplexity Web' : 'Perplexity Research',
    requestType,
  })
}
