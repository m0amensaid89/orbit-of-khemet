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

const VIDEO_MODELS_IMAGE: Record<string, string> = {
  video_quick:    'fal-ai/kling-video/v1/standard/image-to-video',
  video_standard: 'fal-ai/kling-video/v1.6/pro/image-to-video',
}

const VIDEO_LABELS: Record<string, string> = {
  video_quick:     'Kling 1.0',
  video_standard:  'Kling 1.6 Pro',
  video_cinematic: 'Veo 3.1',
  video_edit:      'MiniMax Video',
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let prompt = '', videoType = 'video_standard', mode = 'text', aspectRatio = '16:9'
    let imageUrl: string | undefined
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      prompt = form.get('prompt') as string || ''
      videoType = form.get('videoType') as string || 'video_standard'
      mode = form.get('mode') as string || 'text'
      aspectRatio = form.get('aspectRatio') as string || '16:9'
      const imageFile = form.get('image') as File | null
      if (imageFile) {
        // Upload image to fal.ai storage
        try {
          const uploaded = await fal.storage.upload(imageFile)
          imageUrl = uploaded
        } catch { imageUrl = undefined }
      }
    } else {
      const body = await req.json()
      prompt = body.prompt; videoType = body.videoType || 'video_standard'
      mode = body.mode || 'text'; aspectRatio = body.aspectRatio || '16:9'
    }

    const supabaseServer = await createClient()
    const { data: { user } } = await supabaseServer.auth.getUser()

    const creditCost = CREDIT_COSTS[videoType as keyof typeof CREDIT_COSTS] || 200

    if (user) {
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { data: profile } = await supabaseAdmin
        .from('profiles').select('credits, tier').eq('id', user.id).single()

      if (profile?.tier === 'free_scout' || !user) {
        return NextResponse.json({ error: 'upgrade_required', message: 'Video generation requires a paid plan. Upgrade to unlock.' }, { status: 403 })
      }

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

    const isImageMode = mode === 'image' && imageUrl
    const modelId = isImageMode
      ? (VIDEO_MODELS_IMAGE[videoType] || VIDEO_MODELS_IMAGE.video_quick)
      : (VIDEO_MODELS[videoType] || VIDEO_MODELS.video_standard)

    // Submit to fal.ai queue — returns immediately with request_id
    const { request_id } = await fal.queue.submit(modelId, {
      input: {
        prompt,
        duration: videoType === 'video_standard' ? 10 : 5,
        aspect_ratio: aspectRatio || '16:9',
        ...(isImageMode && imageUrl ? { image_url: imageUrl } : {}),
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