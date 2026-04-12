import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { CREDIT_COSTS } from '@/lib/credits'
import { fal } from '@fal-ai/client'

fal.config({ credentials: process.env.FAL_AI_KEY })

const VIDEO_MODELS: Record<string, string> = {
  video_quick:     'fal-ai/kling-video/v1/standard/text-to-video',
  video_standard:  'fal-ai/kling-video/v1.6/pro/text-to-video',
  video_cinematic: 'fal-ai/minimax-video/text-to-video',
  video_edit:      'fal-ai/minimax-video/text-to-video',
}

const VIDEO_LABELS: Record<string, string> = {
  video_quick:     'Kling 1.0',
  video_standard:  'Kling 1.6 Pro',
  video_cinematic: 'MiniMax Video',
  video_edit:      'MiniMax Video',
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, videoType = 'video_standard' } = await req.json()

    const supabaseServer = await createClient()
    const { data: { user } } = await supabaseServer.auth.getUser()

    const creditCost = CREDIT_COSTS[videoType as keyof typeof CREDIT_COSTS] || 200

    if (user) {
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { data: profile } = await supabaseAdmin
        .from('profiles').select('credits').eq('id', user.id).single()

      if (!profile || (profile.credits !== null && profile.credits < creditCost)) {
        return NextResponse.json({
          error: 'insufficient_credits',
          message: 'Your Grid Energy is depleted, Architect.',
          creditsRequired: creditCost,
          creditsAvailable: profile?.credits || 0,
        }, { status: 402 })
      }

      // PRE-DEDUCT credits immediately on submission
      await supabaseAdmin.from('profiles')
        .update({ credits: (profile.credits || 0) - creditCost })
        .eq('id', user.id)
    }

    const modelId = VIDEO_MODELS[videoType] || VIDEO_MODELS.video_standard

    // Submit to fal.ai queue — returns immediately with request_id
    const { request_id } = await fal.queue.submit(modelId, {
      input: {
        prompt,
        duration: 5,
        aspect_ratio: '16:9',
      },
    })

    return NextResponse.json({
      requestId: request_id,
      modelId,
      videoType,
      platformLabel: VIDEO_LABELS[videoType],
      creditCost,
      status: 'submitted',
    })

  } catch (error) {
    console.error('Video submit error:', error)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}