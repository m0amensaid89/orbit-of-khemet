import { NextRequest, NextResponse } from 'next/server'
import { fal } from '@fal-ai/client'

fal.config({ credentials: process.env.FAL_AI_KEY })

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const requestId = searchParams.get('requestId')
    const modelId = searchParams.get('modelId')

    if (!requestId || !modelId) {
      return NextResponse.json({ error: 'Missing requestId or modelId' }, { status: 400 })
    }

    const status = await fal.queue.status(modelId, {
      requestId,
      logs: false,
    })

    if (status.status === 'COMPLETED') {
      const responseUrl = (status as any).response_url
      let videoUrl: string | null = null

      if (responseUrl) {
        try {
          const resultRes = await fetch(responseUrl, {
            headers: { 'Authorization': `Key ${process.env.FAL_AI_KEY}` }
          })
          const result = await resultRes.json() as { video?: { url: string }; url?: string }
          videoUrl = result?.video?.url || result?.url || null
        } catch {
          videoUrl = null
        }
      }

      return NextResponse.json({ status: 'COMPLETED', videoUrl })
    }

    if ((status.status as string) === 'FAILED') {
      return NextResponse.json({ status: 'FAILED', error: 'Generation failed' })
    }

    // IN_QUEUE or IN_PROGRESS
    return NextResponse.json({
      status: status.status,
      position: (status as { queue_position?: number }).queue_position || null,
    })

  } catch (error) {
    console.error('Video status error:', error)
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 })
  }
}