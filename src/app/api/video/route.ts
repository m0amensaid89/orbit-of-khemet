import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { CREDIT_COSTS, RequestType } from '@/lib/credits'
import { fal } from '@fal-ai/client'

fal.config({ credentials: process.env.FAL_AI_KEY })

const VIDEO_MODELS: Record<string, string> = {
  video_quick:     'fal-ai/kling-video/v2.1/standard/text-to-video',
  video_standard:  'fal-ai/kling-video/v2.1/pro/text-to-video',
  video_cinematic: 'fal-ai/veo3',
  video_edit:      'fal-ai/runway-gen4-turbo/text-to-video',
}

const VIDEO_LABELS: Record<string, string> = {
  video_quick:     'Kling 3 Turbo',
  video_standard:  'Kling 3 Pro',
  video_cinematic: 'Veo 3.1',
  video_edit:      'Runway Gen-4',
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, videoType = 'video_standard', duration = 5 } = await req.json()

    // Auth and credit check
    const supabaseServer = await createClient()
    const { data: { user } } = await supabaseServer.auth.getUser()

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const creditCost = CREDIT_COSTS[videoType as RequestType] || 200

    if (user) {
      const { data: profile } = await supabaseAdmin
        .from('profiles').select('credits').eq('id', user.id).single()

      if (!profile || profile.credits < creditCost) {
        return NextResponse.json({
          error: 'insufficient_credits',
          message: 'Your Grid Energy is depleted, Architect.',
          creditsRequired: creditCost,
          creditsAvailable: profile?.credits || 0,
        }, { status: 402 })
      }
    }

    // Generate video via fal.ai
    const modelId = VIDEO_MODELS[videoType] || VIDEO_MODELS.video_standard

    const { request_id } = await fal.queue.submit(modelId, {
      input: {
        prompt,
        duration,
        aspect_ratio: '16:9',
      },
    })

    // Poll until complete (max 4 minutes)
    let videoUrl: string | null = null
    const maxAttempts = 48 // 48 × 5 seconds = 4 minutes
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // wait 5 seconds
      const status = await fal.queue.status(modelId, {
        requestId: request_id,
        logs: false,
      }) as unknown as { status: string }

      if (status.status === 'COMPLETED') {
        const output = await fal.queue.result(modelId, {
          requestId: request_id,
        }) as { video?: { url: string }; url?: string }
        videoUrl = output?.video?.url || output?.url || null
        break
      }

      if (status.status === 'FAILED') {
        return NextResponse.json({ error: 'Video generation failed' }, { status: 500 })
      }
    }

    if (!videoUrl) {
      return NextResponse.json({ error: 'Video generation timed out' }, { status: 504 })
    }

    // Deduct credits
    if (user) {
      const { data: profile } = await supabaseAdmin
        .from('profiles').select('credits').eq('id', user.id).single()
      if (profile) {
        await supabaseAdmin.from('profiles')
          .update({ credits: profile.credits - creditCost })
          .eq('id', user.id)
      }
    }

    return NextResponse.json({
      videoUrl,
      videoType,
      platformLabel: VIDEO_LABELS[videoType],
      creditsUsed: creditCost,
      prompt,
    })

  } catch (error) {
    console.error('Video generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
